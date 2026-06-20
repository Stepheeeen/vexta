import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAvailableBalance, getWithdrawableBalances, getP2pBalance } from '@/lib/balance';

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

  // ── Passive Earnings (Daily ROI) ───────────────────────────────────────────
  const dailyRoiTxns = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'daily_roi',
      status: 'completed'
    },
    _sum: { amount: true }
  });
  const totalDailyRoi = dailyRoiTxns._sum.amount ?? 0;
  const passiveEarnings = +(totalEarned + totalDailyRoi).toFixed(2);

  // ── Network Earnings (Commissions) ─────────────────────────────────────────
  const commissionTxns = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'commission',
      status: 'completed'
    },
    _sum: { amount: true }
  });
  const networkEarnings = +(commissionTxns._sum.amount ?? 0).toFixed(2);

  // ── Total Earnings ─────────────────────────────────────────────────────────
  const totalEarnings = +(passiveEarnings + networkEarnings).toFixed(2);

  // Referrals count (direct)
  const directReferrals = await prisma.referralLink.count({ where: { referrerId: userId } });

  // Total network count (all levels BFS)
  let totalNetworkCount = 0;
  let currentLevelIds = [userId];
  for (let level = 1; level <= 13; level++) {
    const links = await prisma.referralLink.findMany({
      where: { referrerId: { in: currentLevelIds } },
      select: { referredId: true },
    });
    if (links.length === 0) break;
    totalNetworkCount += links.length;
    currentLevelIds = links.map((l) => l.referredId);
  }

  // Recent transactions
  const recentTxns = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Dynamic available balance (Internal Wallet)
  const availableBalance = await getAvailableBalance(userId);
  const pools = await getWithdrawableBalances(userId);
  const p2pBalance = await getP2pBalance(userId);
  
  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      operationalCapital: true,
      isSponsored: true,
      sponsoredType: true,
      sponsoredGoalAmount: true,
      sponsoredDirectSales: true,
      roiBlocked: true,
      fundsFrozen: true,
      withdrawalsBlocked: true,
    } as any
  });

  return NextResponse.json({
    stats: {
      totalInvested: +totalInvested.toFixed(2),
      // ── Earnings Breakdown ────────────────────────────────────────────────
      totalEarnings,       // Passive + Network combined
      passiveEarnings,     // Daily ROI only
      networkEarnings,     // Commissions only
      // Legacy aliases (backwards compatibility)
      totalEarned: passiveEarnings,
      totalCommissions: networkEarnings,
      // ── Wallet Balances ───────────────────────────────────────────────────
      availableBalance,    // Internal Wallet
      p2pBalance,          // P2P Wallet (non-withdrawable, for package activation only)
      // ── Other Stats ───────────────────────────────────────────────────────
      operationalCapital: (userRecord as any)?.operationalCapital || 0,
      activeInvestments,
      directReferrals,
      totalNetworkCount,
    },
    pools,
    userSponsorship: userRecord,
    investments: investments.map((i) => ({
      id: i.id,
      plan: i.plan.name,
      amount: i.amount,
      activeCapital: (i as any).activeCapital,
      dailyROI: i.plan.dailyROI,
      duration: i.plan.duration,
      startDate: i.startDate,
      endDate: i.endDate,
      totalEarned: i.totalEarned,
      maxPayout: (i as any).maxPayout || i.amount * 2,
      status: i.status,
    })),
    recentTransactions: recentTxns,
  });
}
