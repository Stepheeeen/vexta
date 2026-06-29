import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    const whereClause: any = { type: 'deposit' };
    if (statusFilter && statusFilter !== 'all') {
      whereClause.status = statusFilter;
    }

    const rawDeposits = await prisma.transaction.findMany({
      where: whereClause,
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

    const deposits = rawDeposits.map(d => {
      let network = 'USDT (BEP20)';
      let txHash = d.reference || '';
      try {
        if (d.metadata) {
          const meta = JSON.parse(d.metadata);
          if (meta.network) network = meta.network;
          if (meta.txHash) txHash = meta.txHash;
        }
      } catch {}

      return {
        id: d.id,
        userId: d.userId,
        user: `${d.user.firstName} ${d.user.lastName}`,
        email: d.user.email,
        amount: d.amount,
        network,
        txHash,
        date: d.createdAt.toISOString().split('T')[0],
        status: d.status,
        description: d.description || 'Deposit Request',
      };
    });

    const pendingCount = await prisma.transaction.count({
      where: { type: 'deposit', status: 'pending' }
    });

    return NextResponse.json({ deposits, pendingCount });
  } catch (err) {
    console.error('[admin-deposits-get]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const txn = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!txn || txn.type !== 'deposit') {
      return NextResponse.json({ error: 'Deposit request not found' }, { status: 404 });
    }

    if (txn.status !== 'pending') {
      return NextResponse.json({ error: 'Deposit has already been processed' }, { status: 400 });
    }

    if (action === 'approve') {
      await prisma.$transaction(async (tx) => {
        // 1. Lock user document
        await tx.user.update({
          where: { id: txn.userId },
          data: { updatedAt: new Date() }
        });

        // 2. Verify pending status inside transaction
        const currentTxn = await tx.transaction.findUnique({
          where: { id }
        });

        if (!currentTxn || currentTxn.status !== 'pending') {
          throw new Error('ALREADY_PROCESSED');
        }

        // 3. Mark transaction as completed
        await tx.transaction.update({
          where: { id },
          data: {
            status: 'completed',
            description: currentTxn.description ? currentTxn.description.replace('Pending', 'Approved') : 'Approved Deposit'
          }
        });

        // 4. Update user balance
        await tx.user.update({
          where: { id: currentTxn.userId },
          data: {
            balance: { increment: currentTxn.amount },
          }
        });
      }, { timeout: 30000 });

      return NextResponse.json({ message: 'Deposit approved successfully' });
    }

    if (action === 'reject') {
      await prisma.$transaction(async (tx) => {
        // 1. Verify pending status inside transaction
        const currentTxn = await tx.transaction.findUnique({
          where: { id }
        });

        if (!currentTxn || currentTxn.status !== 'pending') {
          throw new Error('ALREADY_PROCESSED');
        }

        // 2. Mark transaction as failed
        await tx.transaction.update({
          where: { id },
          data: {
            status: 'failed',
            description: currentTxn.description ? currentTxn.description.replace('Pending', 'Rejected') : 'Rejected Deposit'
          }
        });
      }, { timeout: 30000 });

      return NextResponse.json({ message: 'Deposit rejected successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    if (err.message === 'ALREADY_PROCESSED') {
      return NextResponse.json({ error: 'Deposit has already been processed' }, { status: 400 });
    }
    console.error('[admin-deposits-post]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
