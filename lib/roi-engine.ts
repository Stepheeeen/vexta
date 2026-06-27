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
  today.setUTCHours(0, 0, 0, 0); // ← UTC (was local time — timezone bug fix)

  if (!bypassWeekendCheck) {
    const day = today.getUTCDay(); // ← UTC day
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

  // ── Group active investments by userId to prevent write conflicts ──
  const groups: Record<string, typeof activeInvestments> = {};
  for (const inv of activeInvestments) {
    if (!groups[inv.userId]) {
      groups[inv.userId] = [];
    }
    groups[inv.userId].push(inv);
  }

  const userIds = Object.keys(groups);
  console.log(`[ROI] Processing ${activeInvestments.length} active investments across ${userIds.length} distinct users...`);

  let processed = 0;
  let totalPaid = 0;

  // Process distinct users in parallel chunks of 50
  const CHUNK_SIZE = 50;
  for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
    const chunkUserIds = userIds.slice(i, i + CHUNK_SIZE);

    const results = await Promise.allSettled(
      chunkUserIds.map(async (uid) => {
        let userPaidAmount = 0;
        let userPaidCount = 0;
        const userInvs = groups[uid];
        // Process this user's investments sequentially to avoid write conflicts
        for (const inv of userInvs) {
          const paid = await processSingleInvestmentROI(inv, today);
          if (paid > 0) {
            userPaidCount++;
            userPaidAmount = +(userPaidAmount + paid).toFixed(2);
          }
        }
        return { count: userPaidCount, amount: userPaidAmount };
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        processed += result.value.count;
        totalPaid = +(totalPaid + result.value.amount).toFixed(2);
      } else if (result.status === 'rejected') {
        console.error('[ROI] User chunk failed:', result.reason);
      }
    }
  }

  console.log(`[ROI] Generated returns for ${processed} investments. Total: $${totalPaid.toFixed(2)}`);
  return { processed, totalPaid };
}


/**
 * Process a single investment's daily ROI.
 * Extracted so it can run concurrently in Promise.allSettled() chunks.
 * Returns the daily profit credited, or 0 if skipped.
 */
async function processSingleInvestmentROI(inv: any, today: Date): Promise<number> {
  // Guard: skip if already processed today for this investment
  const todayEntry = await prisma.dailyROIEntry.findFirst({
    where: {
      investmentId: inv.id,
      date: { gte: today },
    },
  });
  if (todayEntry) return 0;

  // ── 200% Cap enforcement ───────────────────────────────────────────────
  const maxPayout = (inv as any).maxPayout > 0
    ? (inv as any).maxPayout
    : +(inv.amount * 2).toFixed(2);

  const remainingCapacity = +(maxPayout - inv.totalEarned).toFixed(2);

  if (remainingCapacity <= 0) {
    await prisma.investment.update({
      where: { id: inv.id },
      data: { status: 'completed', activeCapital: 0 },
    });
    await prisma.user.update({
      where: { id: inv.userId },
      data: { operationalCapital: { decrement: inv.activeCapital } },
    });
    console.log(`[ROI] Investment ${inv.id} already at 200% cap — marking completed.`);
    return 0;
  }

  const rawDailyProfit = calculateDailyROI(inv.activeCapital);
  const dailyProfit = +Math.min(rawDailyProfit, remainingCapacity).toFixed(2);
  if (dailyProfit <= 0) return 0;

  const newDaysElapsed = inv.businessDaysElapsed + 1;
  const newTotalEarned = +(inv.totalEarned + dailyProfit).toFixed(2);

  const hitCap = newTotalEarned >= maxPayout - 0.001;
  const willComplete = hitCap || newDaysElapsed >= (inv.duration || maxContractDays);

  try {
    await prisma.$transaction(async (tx) => {
      // Fetch fresh user to check freeze / block flags and retrieve current fresh balance
      const freshUser = await tx.user.findUnique({ where: { id: inv.userId } });
      if (!freshUser || !freshUser.isActive || freshUser.fundsFrozen || freshUser.roiBlocked) {
        throw new Error('USER_INELIGIBLE');
      }

      // 1. Credit user balance immediately
      await tx.user.update({
        where: { id: inv.userId },
        data: {
          balance:     { increment: dailyProfit },
          totalEarned: { increment: dailyProfit },
        },
      });

      // 2. Update investment counters
      await tx.investment.update({
        where: { id: inv.id },
        data: {
          totalEarned:         newTotalEarned,
          businessDaysElapsed: newDaysElapsed,
          maxPayout:           maxPayout,
          ...(willComplete ? { status: 'completed', activeCapital: 0 } : {}),
        },
      });

      if (willComplete) {
        await tx.user.update({
          where: { id: inv.userId },
          data: { operationalCapital: { decrement: inv.activeCapital } },
        });
      }

      // 3. DailyROIEntry audit log
      await tx.dailyROIEntry.create({
        data: {
          investmentId: inv.id,
          amount:       dailyProfit,
          date:         today,
        },
      });

      // 4. Transaction ledger
      const reason = hitCap ? ' (200% cap reached — contract completed)' : willComplete ? ' (Contract completed)' : '';
      await tx.transaction.create({
        data: {
          userId:      inv.userId,
          type:        'daily_roi',
          amount:      dailyProfit,
          status:      'completed',
          description: `Daily arbitrage profit${reason}`,
          reference:   inv.id,
          isVirtual:   inv.isVirtual,
        },
      });

      // 5. Support Account 2X Rule
      if (freshUser.isSponsored && freshUser.sponsoredGiftedAmount > 0) {
        const maxSupportReturn = freshUser.sponsoredGiftedAmount * 2;
        const newInvTotalEarned = inv.totalEarned + dailyProfit;

        if (newInvTotalEarned >= maxSupportReturn) {
          // Since we already incremented the user balance by dailyProfit,
          // the actual current balance in the DB is freshUser.balance + dailyProfit.
          const currentBalance = freshUser.balance + dailyProfit;
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
            data: { status: 'completed', activeCapital: 0 }
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
    }, { timeout: 30000 });
  } catch (err: any) {
    if (err.message === 'USER_INELIGIBLE') {
      return 0;
    }
    throw err;
  }

  const capMsg = hitCap ? ' [200% CAP REACHED]' : '';
  console.log(
    `[ROI] Day ${newDaysElapsed}/${inv.duration || maxContractDays} | ` +
    `$${dailyProfit.toFixed(2)} → user:${inv.userId} | inv:${inv.id}${willComplete ? ' [COMPLETED]' : ''}${capMsg}`
  );

  return dailyProfit;
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


