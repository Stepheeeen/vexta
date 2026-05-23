import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAvailableBalance, getWithdrawableBalances } from '@/lib/balance';

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

  // Daily ROI from transaction table (since production daily ROI is created as a transaction of type 'daily_roi')
  const dailyRoiTxns = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'daily_roi',
      status: 'completed'
    },
    _sum: { amount: true }
  });
  const totalDailyRoi = dailyRoiTxns._sum.amount ?? 0;
  const totalEarnedFinal = totalEarned + totalDailyRoi;

  // Commissions (referral earnings) from transaction history to include all sources
  const commissionTxns = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'commission',
      status: 'completed'
    },
    _sum: { amount: true }
  });
  const totalCommissions = commissionTxns._sum.amount ?? 0;

  // Referrals count (direct)
  const directReferrals = await prisma.referralLink.count({ where: { referrerId: userId } });

  // Recent transactions
  const recentTxns = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Dynamic available balance
  const availableBalance = await getAvailableBalance(userId);
  const pools = await getWithdrawableBalances(userId);
  
  const userSponsorship = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isSponsored: true,
      sponsoredType: true,
      sponsoredGoalAmount: true,
      sponsoredDirectSales: true,
      roiBlocked: true,
      fundsFrozen: true,
    }
  });

  return NextResponse.json({
    stats: {
      totalInvested: +totalInvested.toFixed(2),
      totalEarned: +totalEarnedFinal.toFixed(2),
      totalCommissions: +totalCommissions.toFixed(2),
      availableBalance,
      activeInvestments,
      directReferrals,
    },
    pools,
    userSponsorship,
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
