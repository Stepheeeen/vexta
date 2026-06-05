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
  return +(principal * 0.3).toFixed(2);
}

/** Legacy — kept for backwards compatibility. */
export function calculateTotalROIPercent(_dailyRate: number, _days: number): number {
  return 30.0;
}

// ─── Generate Today's Returns ───────────────────────────────────────

/**
 * Generates daily returns.
 *
 * For every active investment that hasn't completed its 200-business-day lifecycle:
 *   1. Calculates dailyProfit = investment.activeCapital * 1%.
 *   2. Credits user.balance immediately (withdrawable now).
 *   3. Increments investment.businessDaysElapsed + investment.totalEarned.
 *   4. Creates a DailyROIEntry (existing audit log).
 *   5. Creates a Transaction record (type: daily_roi).
 *   6. If businessDaysElapsed reaches maxContractDays, marks investment completed.
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
      console.log('[ROI] Skipping — weekend.');
      return { processed: 0, totalPaid: 0 };
    }
  }

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
          },
        });

        // 2. Update investment counters
        await tx.investment.update({
          where: { id: inv.id },
          data: {
            totalEarned:         { increment: dailyProfit },
            businessDaysElapsed: newDaysElapsed,
            ...(willComplete ? { status: 'completed' } : {}),
          },
        });

        // 3. DailyROIEntry audit log
        await tx.dailyROIEntry.create({
          data: {
            investmentId: inv.id,
            amount:       dailyProfit,
            date:         today,
          },
        });

        // 4. Transaction ledger record
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

        // 5. Support Account 2X Rule
        if ((user as any).isSponsored && (user as any).sponsoredGiftedAmount > 0) {
          const maxSupportReturn = (user as any).sponsoredGiftedAmount * 2;
          const newInvTotalEarned = inv.totalEarned + dailyProfit;
          
          if (newInvTotalEarned >= maxSupportReturn) {
            // Ensure we don't drop balance below 0 if they've somehow withdrawn
            const currentBalance = (user as any).balance + dailyProfit;
            const wipeAmountBalance = Math.min(maxSupportReturn, currentBalance);
            
            await tx.user.update({
              where: { id: inv.userId },
              data: {
                balance: { decrement: wipeAmountBalance },
                totalEarned: { decrement: maxSupportReturn },
                operationalCapital: { decrement: inv.activeCapital },
                isSponsored: false,
                sponsoredGiftedAmount: 0,
              }
            });
            
            await tx.investment.update({
              where: { id: inv.id },
              data: {
                status: 'completed',
                activeCapital: 0
              }
            });
            
            await tx.transaction.create({
              data: {
                userId: inv.userId,
                type: 'system_reset',
                amount: -wipeAmountBalance,
                status: 'completed',
                description: `Support account completed (2X reached). Profits reset.`,
                reference: inv.id,
              }
            });
            
            console.log(`[ROI] User ${inv.userId} hit 2X support account limit. Reset applied.`);
          }
        }
      });

      console.log(
        `[ROI] Day ${newDaysElapsed}/${maxContractDays} | ` +
        `$${dailyProfit.toFixed(2)} → user:${inv.userId} | inv:${inv.id}${willComplete ? ' [COMPLETED]' : ''}`
      );
      processed++;
      totalPaid = +(totalPaid + dailyProfit).toFixed(2);
    } catch (err) {
      console.error(`[ROI] Failed for investment ${inv.id}:`, err);
    }
  }

  console.log(`[ROI] Generated returns for ${processed} investments. Total: $${totalPaid.toFixed(2)}`);
  return { processed, totalPaid };
}

// ─── Main Entry Point (called by cron) ───────────────────────────────────────

/**
 * Full daily ROI run. Executes generation of daily returns.
 */
export async function processDailyROI(
  bypassWeekendCheck = false
): Promise<{ processed: number; totalPaid: number }> {
  console.log('[ROI] Starting daily distribution...');

  const result = await generateDailyReturns(bypassWeekendCheck);

  console.log(`[ROI] Complete. Paid: ${result.processed} investments ($${result.totalPaid.toFixed(2)}).`);

  return {
    processed:      result.processed,
    totalPaid:      result.totalPaid,
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
 * Deducts a withdrawn amount from a user's operational capital.
 */
export async function deductWithdrawalFromCapital(
  userId: string,
  amount: number,
  tx: any // PrismaTransaction
) {
  let remainingAmount = amount;

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

