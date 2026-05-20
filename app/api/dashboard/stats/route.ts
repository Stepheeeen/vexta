import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check maintenance mode
  const settings = await prisma.settings.findFirst();
  if (settings?.maintenanceMode && payload.role !== 'admin') {
    return NextResponse.json({ error: 'Maintenance', maintenanceMode: true }, { status: 503 });
  }

  const userId = payload.userId;

  // Investments
  const investments = await prisma.investment.findMany({
    where: { userId },
    include: { plan: true },
  });

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const totalEarned = investments.reduce((s, i) => s + i.totalEarned, 0);
  const activeInvestments = investments.filter((i) => i.status === 'active').length;

  // Commissions (referral earnings)
  const commissionResult = await prisma.commission.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  const totalCommissions = commissionResult._sum.amount ?? 0;

  // Referrals count (direct)
  const directReferrals = await prisma.referralLink.count({ where: { referrerId: userId } });

  // Recent transactions
  const recentTxns = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Total pure deposits
  const depositTxns = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'deposit',
      description: { not: { contains: 'Investment activated' } }
    },
    _sum: { amount: true }
  });
  const totalDeposits = depositTxns._sum.amount ?? 0;

  // Total balance
  const withdrawnResult = await prisma.withdrawal.aggregate({
    where: { userId, status: { in: ['approved', 'pending'] } },
    _sum: { amount: true },
  });
  const totalWithdrawn = withdrawnResult._sum.amount ?? 0;
  const availableBalance = +(totalDeposits + totalEarned + totalCommissions - totalInvested - totalWithdrawn).toFixed(2);

  return NextResponse.json({
    stats: {
      totalInvested: +totalInvested.toFixed(2),
      totalEarned: +totalEarned.toFixed(2),
      totalCommissions: +totalCommissions.toFixed(2),
      availableBalance,
      activeInvestments,
      directReferrals,
    },
    investments: investments.map((i) => ({
      id: i.id,
      plan: i.plan.name,
      amount: i.amount,
      dailyROI: i.plan.dailyROI,
      duration: i.plan.duration,
      startDate: i.startDate,
      endDate: i.endDate,
      totalEarned: i.totalEarned,
      status: i.status,
    })),
    recentTransactions: recentTxns,
  });
}
