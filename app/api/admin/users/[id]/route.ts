import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit-logger';

// Helper to get recursive network stats
async function getNetworkStats(userId: string) {
  let totalNetworkSize = 0;
  let totalNetworkVolume = 0;
  let totalNetworkProfits = 0;
  
  // Get direct referrals
  const directLinks = await prisma.referralLink.findMany({
    where: { referrerId: userId },
    select: { referredId: true },
  });
  
  const directReferralsCount = directLinks.length;
  
  // We need to traverse downline
  let currentLevelIds = directLinks.map(l => l.referredId);
  const allNetworkIds: string[] = [];
  
  while (currentLevelIds.length > 0) {
    totalNetworkSize += currentLevelIds.length;
    allNetworkIds.push(...currentLevelIds);
    
    const nextLinks = await prisma.referralLink.findMany({
      where: { referrerId: { in: currentLevelIds } },
      select: { referredId: true },
    });
    currentLevelIds = nextLinks.map(l => l.referredId);
  }
  
  if (allNetworkIds.length > 0) {
    const networkUsers = await prisma.user.findMany({
      where: { id: { in: allNetworkIds } },
      select: { totalEarned: true },
    });
    totalNetworkProfits = networkUsers.reduce((sum, u) => sum + u.totalEarned, 0);
    
    const networkDeposits = await prisma.transaction.aggregate({
      where: { 
        userId: { in: allNetworkIds },
        type: 'deposit',
        status: 'completed',
        isVirtual: false
      },
      _sum: { amount: true }
    });
    totalNetworkVolume = networkDeposits._sum.amount ?? 0;
  }

  return {
    directReferralsCount,
    totalNetworkSize,
    totalNetworkVolume,
    totalNetworkProfits
  };
}

// GET user details and network stats
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = getUserFromRequest(req);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const totalPersonalDepositsAgg = await prisma.transaction.aggregate({
      where: { userId: user.id, type: 'deposit', status: 'completed', isVirtual: false },
      _sum: { amount: true }
    });
    const totalPersonalDeposits = totalPersonalDepositsAgg._sum.amount ?? 0;
    
    const totalWithdrawnAgg = await prisma.withdrawal.aggregate({
      where: { userId: user.id, status: 'approved' },
      _sum: { amount: true }
    });
    const totalWithdrawn = totalWithdrawnAgg._sum.amount ?? 0;

    const networkStats = await getNetworkStats(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        status: user.isActive ? 'Active' : 'Suspended',
        country: user.country,
        joinedAt: user.createdAt,
        balance: user.balance,
        totalEarned: user.totalEarned,
        withdrawalsBlocked: (user as any).withdrawalsBlocked,
        totalPersonalDeposits,
        sponsoredGiftedAmount: user.sponsoredGiftedAmount,
        totalWithdrawn,
        operationalCapital: user.operationalCapital,
        isSponsored: user.isSponsored
      },
      networkStats
    });
  } catch (error) {
    console.error('[AdminUserDetails]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST admin actions
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = getUserFromRequest(req);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { action, value, reason } = await req.json();
    const userId = params.id;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (action === 'toggle-withdrawals') {
      const currentBlocked = (user as any).withdrawalsBlocked;
      await prisma.user.update({
        where: { id: userId },
        data: { withdrawalsBlocked: !currentBlocked }
      });
      await logAdminAction(payload.userId, userId, currentBlocked ? 'UNBLOCK_WITHDRAWALS' : 'BLOCK_WITHDRAWALS', reason || 'Toggled withdrawal block state');
      return NextResponse.json({ success: true, blocked: !currentBlocked });
    }
    
    if (action === 'adjust-balance') {
      const amount = Number(value);
      if (isNaN(amount)) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      
      await prisma.user.update({
        where: { id: userId },
        data: { balance: amount }
      });
      
      await logAdminAction(payload.userId, userId, 'MANUAL_BALANCE_ADJUST', `Changed balance from ${user.balance} to ${amount}. Reason: ${reason}`);
      return NextResponse.json({ success: true, balance: amount });
    }
    
    if (action === 'reset-profits') {
      await prisma.user.update({
        where: { id: userId },
        data: { totalEarned: 0 }
      });
      await logAdminAction(payload.userId, userId, 'MANUAL_PROFIT_RESET', `Reset totalEarned to 0. Reason: ${reason}`);
      return NextResponse.json({ success: true });
    }

    if (action === 'release-support') {
      await prisma.user.update({
        where: { id: userId },
        data: { isSponsored: false, sponsoredGiftedAmount: 0 }
      });
      await logAdminAction(payload.userId, userId, 'MANUAL_SUPPORT_RELEASE', `Released support account status. Reason: ${reason}`);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[AdminUserAction]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
