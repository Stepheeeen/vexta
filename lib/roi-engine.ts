import { prisma } from './prisma';
import { SYSTEM_CONFIG } from './config/system';

export const PLAN_RATES = SYSTEM_CONFIG.plans;

/** Calculate daily ROI amount for a given principal */
export function calculateDailyROI(principal: number, dailyRate: number): number {
  return +(principal * dailyRate).toFixed(2);
}

/** Calculate total return over the full plan duration (with daily compounding) */
export function calculateTotalReturn(principal: number, dailyRate: number, days: number): number {
  return +(principal * 3.0).toFixed(2);
}

/** Calculate total return as a percentage (with daily compounding) */
export function calculateTotalROIPercent(dailyRate: number, days: number): number {
  return 300.0;
}

/**
 * Process daily ROI for all active investments.
 * Designed to be called by a cron job or simulation runner.
 * Returns the total ROI processed.
 */
export async function processDailyROI(): Promise<{ processed: number; totalPaid: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Skip weekends (Saturday = 6, Sunday = 0)
  const dayOfWeek = today.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    console.log('[ROI] Skipping daily ROI distribution (weekend)');
    return { processed: 0, totalPaid: 0 };
  }

  // Get all active investments whose end date hasn't passed
  const activeInvestments = await prisma.investment.findMany({
    where: {
      status: 'active',
      endDate: { gte: today },
    },
    include: { plan: true },
  });

  let totalPaid = 0;

  for (const inv of activeInvestments) {
    // Check if we already processed today for this investment
    const todayEntry = await prisma.dailyROIEntry.findFirst({
      where: {
        investmentId: inv.id,
        date: { gte: today },
      },
    });
    if (todayEntry) continue;

    // Compound interest: calculate daily ROI based on (amount + bonusAmount + totalEarned)
    const compoundedBase = inv.amount + (inv.bonusAmount || 0) + inv.totalEarned;
    const dailyAmount = calculateDailyROI(compoundedBase, inv.plan.dailyROI);

    // Calculate new total earned and cap it at 300% of the invested principal amount
    const newTotalEarned = inv.totalEarned + dailyAmount;
    const maxEarnings = inv.amount * 3.0; // 300%

    let finalDailyAmount = dailyAmount;
    let completed = false;
    if (newTotalEarned >= maxEarnings) {
      finalDailyAmount = Math.max(0, maxEarnings - inv.totalEarned);
      completed = true;
    }

    if (finalDailyAmount <= 0 && !completed) {
      completed = true;
    }

    if (finalDailyAmount > 0) {
      // Record the daily ROI entry
      await prisma.dailyROIEntry.create({
        data: {
          investmentId: inv.id,
          amount: finalDailyAmount,
          date: today,
        },
      });

      // Update total earned on investment
      await prisma.investment.update({
        where: { id: inv.id },
        data: { totalEarned: { increment: finalDailyAmount } },
      });

      // Record transaction
      await prisma.transaction.create({
        data: {
          userId: inv.userId,
          type: 'roi',
          amount: finalDailyAmount,
          status: 'completed',
          description: `Daily ROI — ${inv.plan.name}`,
          reference: inv.id,
        },
      });

      totalPaid += finalDailyAmount;
    }

    // Mark completed if end date reached or max 300% ROI reached
    if (completed || new Date() >= new Date(inv.endDate)) {
      await prisma.investment.update({
        where: { id: inv.id },
        data: { status: 'completed' },
      });
    }
  }

  return { processed: activeInvestments.length, totalPaid: +totalPaid.toFixed(2) };
}

export async function upsertPlans() {
  for (const [, plan] of Object.entries(PLAN_RATES)) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: { dailyROI: plan.dailyROI, minDeposit: plan.minDeposit, duration: plan.duration, tag: plan.tag },
      create: {
        name: plan.name,
        tag: plan.tag,
        minDeposit: plan.minDeposit,
        dailyROI: plan.dailyROI,
        duration: plan.duration,
      },
    });
  }

  // Deactivate other plans
  const activePlanNames = Object.values(PLAN_RATES).map(p => p.name);
  await prisma.plan.updateMany({
    where: { name: { notIn: activePlanNames } },
    data: { isActive: false },
  });
}
