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

    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock user document
      await tx.user.update({
        where: { id: withdrawal.userId },
        data: { updatedAt: new Date() }
      });

      // 2. Verify pending status inside transaction
      const currentWithdrawal = await tx.withdrawal.findUnique({
        where: { id }
      });

      if (!currentWithdrawal || currentWithdrawal.status !== 'pending') {
        throw new Error('ALREADY_PROCESSED');
      }

      if (action === 'approve') {
        const netAmount = Number((currentWithdrawal.amount * 0.94).toFixed(2));
        const fee = Number((currentWithdrawal.amount * 0.06).toFixed(2));

        // Mark withdrawal as approved
        await tx.withdrawal.update({
          where: { id },
          data: {
            status: 'approved',
            processedAt: new Date(),
          }
        });

        // Update transaction status
        await tx.transaction.updateMany({
          where: { reference: currentWithdrawal.id },
          data: {
            status: 'completed',
            description: `Withdrawal request processed (${currentWithdrawal.network}) (Net: $${netAmount.toFixed(2)}, Fee: $${fee.toFixed(2)})`
          }
        });

        return { message: 'Withdrawal approved successfully' };
      } else if (action === 'reject') {
        // Refund the user's balance immediately
        await tx.user.update({
          where: { id: currentWithdrawal.userId },
          data: { balance: { increment: currentWithdrawal.amount } }
        });

        // Mark withdrawal as rejected
        await tx.withdrawal.update({
          where: { id },
          data: {
            status: 'rejected',
            processedAt: new Date(),
          }
        });

        // Mark transaction as failed
        await tx.transaction.updateMany({
          where: { reference: currentWithdrawal.id },
          data: {
            status: 'failed',
            description: `Withdrawal request rejected (${currentWithdrawal.network})`
          }
        });

        return { message: 'Withdrawal rejected successfully' };
      } else {
        throw new Error('INVALID_ACTION');
      }
    }, { timeout: 30000 });

    return NextResponse.json(result);
  } catch (err: any) {
    if (err.message === 'ALREADY_PROCESSED') {
      return NextResponse.json({ error: 'Withdrawal has already been processed' }, { status: 400 });
    }
    if (err.message === 'INVALID_ACTION') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    console.error('[admin-withdrawals-post]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
