import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/admin/transactions — Retrieve all user transactions
export async function GET(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rawTransactions = await prisma.transaction.findMany({
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

    const transactions = rawTransactions.map(tx => ({
      id: tx.id,
      user: `${tx.user.firstName} ${tx.user.lastName}`,
      email: tx.user.email,
      type: tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
      amount: `${tx.amount >= 0 ? '+' : ''}$${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
      date: tx.createdAt.toISOString().split('T')[0],
      description: tx.description ?? 'No details provided'
    }));

    return NextResponse.json({ transactions });
  } catch (err) {
    console.error('[admin-transactions-get]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
