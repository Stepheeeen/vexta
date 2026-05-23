import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Gather counts
    const totalUsers = await prisma.user.count();
    const pendingWithdrawalsCount = await prisma.withdrawal.count({
      where: { status: 'pending' }
    });
    const pendingDepositsCount = await prisma.transaction.count({
      where: { type: 'deposit', status: 'pending' }
    });

    // 2. Fetch all transaction data to calculate total volume
    // We sum absolute transaction values to get total volume, or sum deposits
    const deposits = await prisma.transaction.findMany({
      where: { type: 'deposit', status: 'completed', isVirtual: false },
      select: { amount: true }
    });
    const totalVolume = deposits.reduce((sum, tx) => sum + tx.amount, 0);

    const approvedWithdrawals = await prisma.withdrawal.findMany({
      where: { status: 'approved' },
      select: { amount: true, type: true }
    });
    const totalWithdrawals = approvedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const totalRoiWithdrawals = approvedWithdrawals.filter(w => w.type === 'roi').reduce((sum, w) => sum + w.amount, 0);
    const totalCommissionWithdrawals = approvedWithdrawals.filter(w => w.type === 'commission').reduce((sum, w) => sum + w.amount, 0);

    // Dynamic calculations for total profits distributed
    const roiProfitAggregate = await prisma.transaction.aggregate({
      where: { type: { in: ['roi', 'daily_roi'] }, status: 'completed' },
      _sum: { amount: true }
    });
    const totalRoiProfit = roiProfitAggregate._sum.amount ?? 0;

    const commissionProfitAggregate = await prisma.transaction.aggregate({
      where: { type: 'commission', status: 'completed' },
      _sum: { amount: true }
    });
    const totalUnilevelProfit = commissionProfitAggregate._sum.amount ?? 0;

    // 3. System ROI average
    // Get average dailyROI from all plans
    const plans = await prisma.plan.findMany({ select: { dailyROI: true } });
    let avgDailyROI = 0;
    if (plans.length > 0) {
      avgDailyROI = plans.reduce((sum, p) => sum + p.dailyROI, 0) / plans.length;
    }

    // 4. Recent users (last 5)
    const rawRecentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        transactions: {
          select: {
            type: true,
            amount: true,
            status: true,
            description: true,
          }
        }
      }
    });

    const recentUsers = rawRecentUsers.map(user => {
      // Calculate dynamic user balance dynamically
      let balance = 0;
      user.transactions.forEach(t => {
        if (t.status !== 'failed' && t.status !== 'rejected') {
          const desc = t.description || '';
          const isInvestment = t.type === 'deposit' && desc.includes('Investment activated');

          if (t.type === 'deposit' && !isInvestment) {
            if (t.status === 'completed') {
              balance += t.amount;
            }
          } else if (isInvestment) {
            balance -= t.amount;
          } else if (t.type === 'commission' && t.status === 'completed') {
            balance += t.amount;
          } else if ((t.type === 'roi' || t.type === 'daily_roi') && t.status === 'completed') {
            balance += t.amount;
          } else if (t.type === 'p2p_received' && t.status === 'completed') {
            balance += t.amount;
          } else if (t.type === 'p2p_sent' && t.status === 'completed') {
            balance -= t.amount;
          } else if (t.type === 'withdrawal') {
            if (t.status === 'pending' || t.status === 'completed' || t.status === 'approved') {
              balance -= Math.abs(t.amount);
            }
          }
        }
      });
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        joined: user.createdAt.toISOString().split('T')[0],
        status: user.isActive ? 'Active' : 'Suspended',
        balance: `$${Math.max(0, balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      };
    });

    // 5. Recent pending withdrawals (last 5)
    const rawPending = await prisma.withdrawal.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const pendingWithdrawals = rawPending.map(w => ({
      id: w.id,
      user: `${w.user.firstName} ${w.user.lastName}`,
      amount: `$${w.amount.toLocaleString()}`,
      method: 'Crypto Wallet',
      date: w.createdAt.toISOString().split('T')[0],
      status: w.status === 'pending' ? 'Pending' : w.status === 'approved' ? 'Approved' : 'Rejected'
    }));

    // 6. Recent pending deposits (last 5)
    const rawPendingDeposits = await prisma.transaction.findMany({
      where: { type: 'deposit', status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const pendingDeposits = rawPendingDeposits.map(d => ({
      id: d.id,
      user: `${d.user.firstName} ${d.user.lastName}`,
      amount: `$${d.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      date: d.createdAt.toISOString().split('T')[0],
      status: 'Pending'
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        totalVolume,
        totalWithdrawals,
        totalRoiWithdrawals,
        totalCommissionWithdrawals,
        totalRoiProfit,
        totalUnilevelProfit,
        pendingWithdrawalsCount,
        pendingDepositsCount,
        platformROI: avgDailyROI
      },
      recentUsers,
      pendingWithdrawals,
      pendingDeposits
    });
  } catch (err) {
    console.error('[admin-stats]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
