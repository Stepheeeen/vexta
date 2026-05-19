import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/admin/withdrawals — Lists all withdrawals
export async function GET(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rawWithdrawals = await prisma.withdrawal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    const withdrawals = rawWithdrawals.map(w => ({
      id: w.id,
      user: `${w.user.firstName} ${w.user.lastName}`,
      email: w.user.email,
      amount: `$${w.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      method: 'Crypto Wallet',
      account: `${w.network}: ${w.walletAddress.slice(0, 6)}...${w.walletAddress.slice(-4)}`,
      date: w.createdAt.toISOString().split('T')[0],
      status: w.status === 'pending' ? 'Pending' : w.status === 'approved' ? 'Completed' : 'Rejected'
    }));

    // Calculate metrics
    const pendingSum = await prisma.withdrawal.aggregate({
      where: { status: 'pending' },
      _sum: { amount: true }
    });

    const approvedToday = await prisma.withdrawal.aggregate({
      where: {
        status: 'approved',
        processedAt: {
          gte: new Date(new Date().setHours(0,0,0,0))
        }
      },
      _sum: { amount: true }
    });

    return NextResponse.json({
      withdrawals,
      metrics: {
        pending: pendingSum._sum.amount ?? 0,
        todayProcessed: approvedToday._sum.amount ?? 0,
      }
    });
  } catch (err) {
    console.error('[admin-withdrawals-get]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/withdrawals — Approve or reject a withdrawal request
export async function POST(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, action } = await req.json();
    if (!id || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json({ error: 'Withdrawal has already been processed' }, { status: 400 });
    }

    if (action === 'approve') {
      // 1. Mark withdrawal as approved
      await prisma.withdrawal.update({
        where: { id },
        data: {
          status: 'approved',
          processedAt: new Date(),
        }
      });

      // 2. Create the negative transaction to reflect in user balance
      await prisma.transaction.create({
        data: {
          userId: withdrawal.userId,
          type: 'withdrawal',
          amount: -Math.abs(withdrawal.amount),
          status: 'completed',
          description: `Withdrawal request processed (${withdrawal.network})`,
          reference: withdrawal.id,
        }
      });

      return NextResponse.json({ message: 'Withdrawal approved successfully' });
    }

    if (action === 'reject') {
      // Mark as rejected
      await prisma.withdrawal.update({
        where: { id },
        data: {
          status: 'rejected',
          processedAt: new Date(),
        }
      });

      return NextResponse.json({ message: 'Withdrawal rejected successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[admin-withdrawals-post]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
