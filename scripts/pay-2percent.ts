import { prisma } from '../lib/prisma';

async function main() {
  console.log("Starting manual 2% ROI payout for today...");
  const activeInvestments = await prisma.investment.findMany({
    where: { status: 'active' },
  });

  let processed = 0;
  let totalPaid = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const inv of activeInvestments) {
    const todayEntry = await prisma.dailyROIEntry.findFirst({
      where: { investmentId: inv.id, date: { gte: today } },
    });
    if (todayEntry) {
      console.log(`Skipping inv ${inv.id}: already paid today.`);
      continue;
    }

    const user = await prisma.user.findUnique({ where: { id: inv.userId } });
    if (!user || !user.isActive || user.fundsFrozen || user.roiBlocked) continue;

    const capital = inv.activeCapital > 0 ? inv.activeCapital : (inv.amount + (inv.bonusAmount || 0));
    if (capital <= 0) continue;

    const maxPayout = (inv as any).maxPayout > 0 ? (inv as any).maxPayout : +(inv.amount * 2).toFixed(2);
    const remainingCapacity = +(maxPayout - inv.totalEarned).toFixed(2);
    if (remainingCapacity <= 0) continue;

    const rawDailyProfit = +(capital * 0.02).toFixed(2);
    const dailyProfit = +Math.min(rawDailyProfit, remainingCapacity).toFixed(2);
    if (dailyProfit <= 0) continue;

    const hitCap = inv.totalEarned + dailyProfit >= maxPayout - 0.001;

    // Do updates sequentially without an explicit long-running transaction block
    await prisma.user.update({
      where: { id: inv.userId },
      data: { balance: { increment: dailyProfit }, totalEarned: { increment: dailyProfit } },
    });
    await prisma.investment.update({
      where: { id: inv.id },
      data: {
        totalEarned: +(inv.totalEarned + dailyProfit).toFixed(2),
        businessDaysElapsed: inv.businessDaysElapsed + 2,
        maxPayout: maxPayout,
        activeCapital: hitCap ? 0 : capital,
        ...(hitCap ? { status: 'completed' } : {}),
      },
    });
    if (hitCap) {
      await prisma.user.update({
        where: { id: inv.userId },
        data: { operationalCapital: { decrement: capital } },
      });
    } else if (inv.activeCapital === 0) {
      await prisma.user.update({
        where: { id: inv.userId },
        data: { operationalCapital: { increment: capital } },
      });
    }
    await prisma.dailyROIEntry.create({
      data: { investmentId: inv.id, amount: dailyProfit, date: today },
    });
    await prisma.transaction.create({
      data: {
        userId: inv.userId, type: 'daily_roi', amount: dailyProfit, status: 'completed',
        description: `Manual 2% ROI (covers 2 days)${hitCap ? ' (Cap reached)' : ''}`,
        reference: inv.id, isVirtual: inv.isVirtual,
      },
    });

    processed++;
    totalPaid += dailyProfit;
  }
  console.log(`Processed ${processed} investments. Total paid: $${totalPaid.toFixed(2)}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
