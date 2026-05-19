import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  amount:        z.number().positive().min(10, 'Minimum withdrawal is $10'),
  walletAddress: z.string().min(10, 'Invalid wallet address'),
  network:       z.enum(['TRC20', 'BEP20', 'ERC20']).default('TRC20'),
});

// GET /api/withdrawals
export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId: payload.userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ withdrawals });
}

// POST /api/withdrawals
export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const { amount, walletAddress, network } = parsed.data;

    // Calculate available balance
    const earnedResult = await prisma.investment.aggregate({
      where: { userId: payload.userId },
      _sum: { totalEarned: true },
    });
    const commissionResult = await prisma.commission.aggregate({
      where: { userId: payload.userId },
      _sum: { amount: true },
    });
    const withdrawnResult = await prisma.withdrawal.aggregate({
      where: { userId: payload.userId, status: { in: ['approved', 'pending'] } },
      _sum: { amount: true },
    });

    const available = (earnedResult._sum.totalEarned ?? 0)
      + (commissionResult._sum.amount ?? 0)
      - (withdrawnResult._sum.amount ?? 0);

    if (amount > available) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: $${available.toFixed(2)}` },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawal.create({
      data: { userId: payload.userId, amount, walletAddress, network, status: 'pending' },
    });

    // Record outgoing transaction
    await prisma.transaction.create({
      data: {
        userId: payload.userId,
        type: 'withdrawal',
        amount: -amount,
        status: 'pending',
        description: `Withdrawal request — ${network}`,
        reference: withdrawal.id,
      },
    });

    return NextResponse.json({ message: 'Withdrawal request submitted', withdrawal }, { status: 201 });
  } catch (err) {
    console.error('[withdrawals/POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
