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

    // 2. Fetch all transaction data to calculate total volume
    // We sum absolute transaction values to get total volume, or sum deposits
    const deposits = await prisma.transaction.findMany({
      where: { type: 'deposit', status: 'completed' },
      select: { amount: true }
    });
    const totalVolume = deposits.reduce((sum, tx) => sum + tx.amount, 0);

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
            status: true
          }
        }
      }
    });

    const recentUsers = rawRecentUsers.map(user => {
      // Calculate dynamic user balance = Deposits + Commissions + ROI - Withdrawals
      let balance = 0;
      user.transactions.forEach(t => {
        if (t.status === 'completed' || t.status === 'approved') {
          if (['deposit', 'commission', 'roi'].includes(t.type)) {
            balance += t.amount;
          } else if (t.type === 'withdrawal') {
            balance -= Math.abs(t.amount);
          }
        }
      });
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        joined: user.createdAt.toISOString().split('T')[0],
        status: user.isActive ? 'Active' : 'Suspended',
        balance: `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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

    return NextResponse.json({
      stats: {
        totalUsers,
        totalVolume,
        pendingWithdrawalsCount,
        platformROI: avgDailyROI
      },
      recentUsers,
      pendingWithdrawals
    });
  } catch (err) {
    console.error('[admin-stats]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
