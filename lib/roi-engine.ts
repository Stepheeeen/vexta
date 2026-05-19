/**
 * ROI Engine
 * Calculates daily returns and manages investment lifecycle.
 * All rates stored as decimals: 2% = 0.02
 */

import { prisma } from './prisma';

export const PLAN_RATES = {
  PLAN_A: { dailyROI: 0.015, duration: 30, minDeposit: 100,  name: 'Plan A', tag: 'Starter'  },
  PLAN_B: { dailyROI: 0.020, duration: 45, minDeposit: 500,  name: 'Plan B', tag: 'Popular'  },
  PLAN_C: { dailyROI: 0.025, duration: 60, minDeposit: 2000, name: 'Plan C', tag: 'Advanced' },
} as const;

/** Calculate daily ROI amount for a given principal */
export function calculateDailyROI(principal: number, dailyRate: number): number {
  return +(principal * dailyRate).toFixed(2);
}

/** Calculate total return over the full plan duration */
export function calculateTotalReturn(principal: number, dailyRate: number, days: number): number {
  return +(principal * dailyRate * days).toFixed(2);
}

/** Calculate total return as a percentage */
export function calculateTotalROIPercent(dailyRate: number, days: number): number {
  return +(dailyRate * days * 100).toFixed(1);
}

/**
 * Process daily ROI for all active investments.
 * Designed to be called by a cron job or simulation runner.
 * Returns the total ROI processed.
 */
export async function processDailyROI(): Promise<{ processed: number; totalPaid: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

    const dailyAmount = calculateDailyROI(inv.amount, inv.plan.dailyROI);

    // Record the daily ROI entry
    await prisma.dailyROIEntry.create({
      data: {
        investmentId: inv.id,
        amount: dailyAmount,
        date: today,
      },
    });

    // Update total earned on investment
    await prisma.investment.update({
      where: { id: inv.id },
      data: { totalEarned: { increment: dailyAmount } },
    });

    // Record transaction
    await prisma.transaction.create({
      data: {
        userId: inv.userId,
        type: 'roi',
        amount: dailyAmount,
        status: 'completed',
        description: `Daily ROI — ${inv.plan.name}`,
        reference: inv.id,
      },
    });

    totalPaid += dailyAmount;

    // Mark completed if end date reached
    if (new Date() >= new Date(inv.endDate)) {
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
}
