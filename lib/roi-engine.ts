import { prisma } from './prisma';
import { SYSTEM_CONFIG } from './config/system';

export const PLAN_RATES = SYSTEM_CONFIG.plans;
const { dailyRate, pendingDelayDays, maxContractDays } = SYSTEM_CONFIG.compounding;

// ─── Business-Day Helpers ─────────────────────────────────────────────────────

/** Returns true if the given date falls on a weekday (Mon–Fri). */
export function isBusinessDay(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

/**
 * Advances a date by `n` business days, skipping Saturday and Sunday.
 * Used to calculate the `unlocksAt` timestamp for pending profit entries.
 */
export function addBusinessDays(date: Date, n: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < n) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result)) added++;
  }
  return result;
}

/**
 * Counts business days between two dates (exclusive of start, inclusive of end).
 * Used by the migration script to compute businessDaysElapsed for existing investments.
 */
export function countBusinessDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const endNorm = new Date(end);
  endNorm.setHours(0, 0, 0, 0);
  while (cursor < endNorm) {
    cursor.setDate(cursor.getDate() + 1);
    if (isBusinessDay(cursor)) count++;
  }
  return count;
}

// ─── Simple Calculation Helpers ───────────────────────────────────────────────

/** Calculate the 1% daily ROI amount for a given active capital base. */
export function calculateDailyROI(activeCapital: number): number {
  return +(activeCapital * dailyRate).toFixed(2);
}

/** Legacy — kept for backwards compatibility with existing callers. */
export function calculateTotalReturn(principal: number, _dailyRate: number, _days: number): number {
  return +(principal * 3.0).toFixed(2);
}

/** Legacy — kept for backwards compatibility. */
export function calculateTotalROIPercent(_dailyRate: number, _days: number): number {
  return 300.0;
}

// ─── Phase A: Promote Matured Pending Profits ─────────────────────────────────

/**
 * Phase A of the daily cron.
 *
 * Finds all PendingProfitEntry rows where:
 *   - unlocksAt <= now  (48 business hours have elapsed)
 *   - integratedAt IS NULL  (not yet promoted)
 *
 * For each entry it:
 *   1. Increments investment.activeCapital by the entry amount.
 *   2. Decrements user.pendingIntegration by the entry amount.
 *   3. Increments user.operationalCapital by the entry amount.
 *   4. Marks the entry integratedAt = now.
 *
 * Returns total amount promoted and number of entries processed.
 */
export async function promotePendingProfits(): Promise<{ promoted: number; totalAmount: number }> {
  const now = new Date();

  const maturedEntries = await prisma.pendingProfitEntry.findMany({
    where: {
      integratedAt: null,
      unlocksAt: { lte: now },
    },
    orderBy: { unlocksAt: 'asc' },
  });

  let promoted = 0;
  let totalAmount = 0;

  for (const entry of maturedEntries) {
    try {
      await prisma.$transaction(async (tx) => {
        // Idempotency guard: re-check inside transaction
        const fresh = await tx.pendingProfitEntry.findUnique({ where: { id: entry.id } });
        if (!fresh || fresh.integratedAt !== null) return;

        // 1. Promote to investment activeCapital
        await tx.investment.update({
          where: { id: entry.investmentId },
          data: { activeCapital: { increment: entry.amount } },
        });

        // 2. Update user capital counters
        await tx.user.update({
          where: { id: entry.userId },
          data: {
            operationalCapital: { increment: entry.amount },
            pendingIntegration: { decrement: entry.amount },
          },
        });

        // 3. Mark entry as integrated
        await tx.pendingProfitEntry.update({
          where: { id: entry.id },
          data: { integratedAt: now },
        });
      });

      promoted++;
      totalAmount = +(totalAmount + entry.amount).toFixed(2);
    } catch (err) {
      console.error(`[ROI Phase A] Failed to promote entry ${entry.id}:`, err);
    }
  }

  console.log(`[ROI Phase A] Promoted ${promoted} entries, total $${totalAmount.toFixed(2)} into active capital.`);
  return { promoted, totalAmount };
}

// ─── Phase B: Generate Today's Returns ───────────────────────────────────────

/**
 * Phase B of the daily cron.
 *
 * For every active investment that hasn't completed its 200-business-day lifecycle:
 *   1. Calculates dailyProfit = investment.activeCapital * 1%.
 *   2. Credits user.balance immediately (withdrawable now).
 *   3. Creates a PendingProfitEntry with unlocksAt = today + 2 business days.
 *   4. Increments user.pendingIntegration.
 *   5. Increments investment.businessDaysElapsed + investment.totalEarned.
 *   6. Creates a DailyROIEntry (existing audit log).
 *   7. Creates a Transaction record (type: daily_roi).
 *   8. If businessDaysElapsed reaches maxContractDays, marks investment completed.
 *
 * Skips weekends automatically. Returns a summary of users paid.
 */
export async function generateDailyReturns(
  bypassWeekendCheck = false
): Promise<{ processed: number; totalPaid: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!bypassWeekendCheck) {
    const day = today.getDay();
    if (day === 0 || day === 6) {
      console.log('[ROI Phase B] Skipping — weekend.');
      return { processed: 0, totalPaid: 0 };
    }
  }

  const unlocksAt = addBusinessDays(today, pendingDelayDays);

  const activeInvestments = await prisma.investment.findMany({
    where: {
      status: 'active',
      activeCapital: { gt: 0 },
    },
    include: { plan: true },
  });

  let processed = 0;
  let totalPaid = 0;

  for (const inv of activeInvestments) {
    try {
      // Guard: skip if already processed today for this investment
      const todayEntry = await prisma.dailyROIEntry.findFirst({
        where: {
          investmentId: inv.id,
          date: { gte: today },
        },
      });
      if (todayEntry) continue;

      // Fetch user to check freeze / block flags
      const user = await prisma.user.findUnique({ where: { id: inv.userId } });
      if (!user || !user.isActive || user.fundsFrozen || user.roiBlocked) continue;

      const dailyProfit = calculateDailyROI(inv.activeCapital);
      if (dailyProfit <= 0) continue;

      const newDaysElapsed = inv.businessDaysElapsed + 1;
      const willComplete = newDaysElapsed >= maxContractDays;

      await prisma.$transaction(async (tx) => {
        // 1. Credit user balance immediately (withdrawable)
        await tx.user.update({
          where: { id: inv.userId },
          data: {
            balance:           { increment: dailyProfit },
            totalEarned:       { increment: dailyProfit },
            pendingIntegration: { increment: dailyProfit },
          },
        });

        // 2. Create pending profit entry (delayed compounding queue)
        await tx.pendingProfitEntry.create({
          data: {
            userId:       inv.userId,
            investmentId: inv.id,
            amount:       dailyProfit,
            earnedOnDate: today,
            unlocksAt,
            isVirtual:    inv.isVirtual,
          },
        });

        // 3. Update investment counters
        await tx.investment.update({
          where: { id: inv.id },
          data: {
            totalEarned:         { increment: dailyProfit },
            businessDaysElapsed: newDaysElapsed,
            ...(willComplete ? { status: 'completed' } : {}),
          },
        });

        // 4. DailyROIEntry audit log
        await tx.dailyROIEntry.create({
          data: {
            investmentId: inv.id,
            amount:       dailyProfit,
            date:         today,
          },
        });

        // 5. Transaction ledger record
        await tx.transaction.create({
          data: {
            userId:      inv.userId,
            type:        'daily_roi',
            amount:      dailyProfit,
            status:      'completed',
            description: `Daily arbitrage profit${willComplete ? ' (Contract completed)' : ''}`,
            reference:   inv.id,
            isVirtual:   inv.isVirtual,
          },
        });
      });

      console.log(
        `[ROI Phase B] Day ${newDaysElapsed}/${maxContractDays} | ` +
        `$${dailyProfit.toFixed(2)} → user:${inv.userId} | inv:${inv.id}${willComplete ? ' [COMPLETED]' : ''}`
      );
      processed++;
      totalPaid = +(totalPaid + dailyProfit).toFixed(2);
    } catch (err) {
      console.error(`[ROI Phase B] Failed for investment ${inv.id}:`, err);
    }
  }

  console.log(`[ROI Phase B] Generated returns for ${processed} investments. Total: $${totalPaid.toFixed(2)}`);
  return { processed, totalPaid };
}

// ─── Main Entry Point (called by cron) ───────────────────────────────────────

/**
 * Full daily ROI run. Executes in two phases:
 *
 * Phase A — Promote pending profits whose 48-business-hour lock has expired
 *            into the investment's activeCapital (compounding base).
 *
 * Phase B — Calculate today's 1% return on each investment's current
 *            activeCapital and queue the profit in PendingProfitEntry.
 *
 * Order matters: A runs first so that today's base reflects yesterday's promotions.
 */
export async function processDailyROI(
  bypassWeekendCheck = false
): Promise<{ promoted: number; amountPromoted: number; processed: number; totalPaid: number }> {
  console.log('[ROI] Starting daily two-phase distribution...');

  const phaseA = await promotePendingProfits();
  const phaseB = await generateDailyReturns(bypassWeekendCheck);

  console.log(`[ROI] Complete. Promoted: ${phaseA.promoted} entries ($${phaseA.totalAmount.toFixed(2)}). Paid: ${phaseB.processed} investments ($${phaseB.totalPaid.toFixed(2)}).`);

  return {
    promoted:       phaseA.promoted,
    amountPromoted: phaseA.totalAmount,
    processed:      phaseB.processed,
    totalPaid:      phaseB.totalPaid,
  };
}

// ─── Plan Seeding (unchanged) ─────────────────────────────────────────────────

export async function upsertPlans() {
  const targetPlans: Record<string, any> = {};
  for (const [, plan] of Object.entries(PLAN_RATES)) {
    const res = await prisma.plan.upsert({
      where: { name: plan.name },
      update: {
        dailyROI:   plan.dailyROI,
        minDeposit: plan.minDeposit,
        duration:   plan.duration,
        bonus:      plan.bonus,
        tag:        plan.tag,
        isActive:   true,
      },
      create: {
        name:       plan.name,
        tag:        plan.tag,
        minDeposit: plan.minDeposit,
        dailyROI:   plan.dailyROI,
        duration:   plan.duration,
        bonus:      plan.bonus,
        isActive:   true,
      },
    });
    targetPlans[plan.name] = res;
  }

  const activePlanNames = Object.values(PLAN_RATES).map(p => p.name);
  const legacyPlans = await prisma.plan.findMany({
    where: { name: { notIn: activePlanNames } },
  });

  for (const p of legacyPlans) {
    let targetName = 'STARTER PLAN';
    const lower = p.name.toLowerCase();
    if (lower.includes('ultra') || lower === 'plan c')       targetName = 'ULTRA PLAN';
    else if (lower.includes('advance') || lower.includes('prime') || lower === 'plan b')  targetName = 'ADVANCE PLAN';

    const targetPlan = targetPlans[targetName];
    if (targetPlan) {
      await prisma.investment.updateMany({
        where: { planId: p.id },
        data:  { planId: targetPlan.id },
      });
    }
    await prisma.plan.delete({ where: { id: p.id } });
  }
}

// ─── Withdrawal Logic ─────────────────────────────────────────────────────────

/**
 * Deducts a withdrawn amount from a user's pending profits and operational capital.
 * Priority:
 * 1. Deduct from PendingProfitEntries (oldest first).
 * 2. If remainder > 0, deduct from active Investment activeCapitals.
 */
export async function deductWithdrawalFromCapital(
  userId: string,
  amount: number,
  tx: any // PrismaTransaction
) {
  let remainingAmount = amount;

  // 1. Deduct from Pending Profits first
  // Find all pending profits that haven't been integrated yet
  const pendingEntries = await tx.pendingProfitEntry.findMany({
    where: { userId, integratedAt: null },
    orderBy: { earnedOnDate: 'asc' }, // older ones first
  });

  for (const entry of pendingEntries) {
    if (remainingAmount <= 0) break;

    if (entry.amount <= remainingAmount) {
      // Consume the entire entry
      await tx.pendingProfitEntry.delete({ where: { id: entry.id } });
      
      // Update user pendingIntegration count
      await tx.user.update({
        where: { id: userId },
        data: { pendingIntegration: { decrement: entry.amount } }
      });
      remainingAmount = +(remainingAmount - entry.amount).toFixed(2);
    } else {
      // Consume partial entry
      await tx.pendingProfitEntry.update({
        where: { id: entry.id },
        data: { amount: +(entry.amount - remainingAmount).toFixed(2) }
      });

      // Update user pendingIntegration count
      await tx.user.update({
        where: { id: userId },
        data: { pendingIntegration: { decrement: remainingAmount } }
      });
      remainingAmount = 0;
    }
  }

  // 2. If there's still a remaining amount, deduct from active operational capital
  if (remainingAmount > 0) {
    const activeInvestments = await tx.investment.findMany({
      where: { userId, status: 'active', activeCapital: { gt: 0 } },
      orderBy: { createdAt: 'desc' }, // newest first, or could be any logic
    });

    for (const inv of activeInvestments) {
      if (remainingAmount <= 0) break;

      if (inv.activeCapital <= remainingAmount) {
        // Consume the entire active capital of this investment
        await tx.investment.update({
          where: { id: inv.id },
          data: { activeCapital: 0, status: 'completed' } // effectively dead
        });

        await tx.user.update({
          where: { id: userId },
          data: { operationalCapital: { decrement: inv.activeCapital } }
        });

        remainingAmount = +(remainingAmount - inv.activeCapital).toFixed(2);
      } else {
        // Consume partial active capital
        await tx.investment.update({
          where: { id: inv.id },
          data: { activeCapital: +(inv.activeCapital - remainingAmount).toFixed(2) }
        });

        await tx.user.update({
          where: { id: userId },
          data: { operationalCapital: { decrement: remainingAmount } }
        });

        remainingAmount = 0;
      }
    }
  }
}

