import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAvailableBalance } from '@/lib/balance';

const schema = z.object({
  amount:        z.number().positive().min(5, 'Minimum withdrawal is $5'),
  walletAddress: z.string().min(10, 'Invalid wallet address'),
  network:       z.enum(['BEP20']).default('BEP20'),
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

    // Check system settings
    const settings = await prisma.settings.findFirst();
    if (settings?.maintenanceMode && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'System is currently undergoing maintenance. Withdrawals are temporarily disabled.' },
        { status: 503 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock user document
      await tx.user.update({
        where: { id: payload.userId },
        data: { updatedAt: new Date() }
      });

      // 2. Calculate available balance inside transaction
      const available = await getAvailableBalance(payload.userId, tx);

      if (amount > available) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      const feeRate = settings ? settings.withdrawalFee / 100 : 0.06;
      const fee = Number((amount * feeRate).toFixed(2));
      const netAmount = Number((amount - fee).toFixed(2));

      // 3. Decrement user's persisted balance field
      await tx.user.update({
        where: { id: payload.userId },
        data: { balance: { decrement: amount } }
      });

      const withdrawal = await tx.withdrawal.create({
        data: { 
          userId: payload.userId, 
          amount, 
          walletAddress, 
          network, 
          status: 'pending',
          note: `${(feeRate * 100).toFixed(0)}% fee: $${fee.toFixed(2)} | Net payout: $${netAmount.toFixed(2)}`
        },
      });

      // 4. Record outgoing transaction
      await tx.transaction.create({
        data: {
          userId: payload.userId,
          type: 'withdrawal',
          amount: -amount,
          status: 'pending',
          description: `Withdrawal request — ${network} (Net: $${netAmount.toFixed(2)}, Fee: $${fee.toFixed(2)})`,
          reference: withdrawal.id,
        },
      });

      return withdrawal;
    });

    return NextResponse.json({ message: 'Withdrawal request submitted', withdrawal: result }, { status: 201 });
  } catch (err: any) {
    if (err.message === 'INSUFFICIENT_BALANCE') {
      return NextResponse.json(
        { error: 'Insufficient balance.' },
        { status: 400 }
      );
    }
    console.error('[withdrawals/POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
