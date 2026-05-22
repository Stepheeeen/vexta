import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { propagateCommissions } from '@/lib/referral-engine';
import { getAvailableBalance } from '@/lib/balance';

const createSchema = z.object({
  planId: z.string().min(1),
  amount: z.number().positive(),
});

// GET /api/investments — list user's investments
export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const investments = await prisma.investment.findMany({
    where: { userId: payload.userId },
    include: { plan: true, dailyROIs: { orderBy: { date: 'desc' }, take: 7 } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ investments });
}

// POST /api/investments — create a new investment
export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const { planId, amount } = parsed.data;

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'Plan not found or inactive' }, { status: 404 });
    }

    if (amount < plan.minDeposit) {
      return NextResponse.json(
        { error: `Minimum deposit for ${plan.name} is $${plan.minDeposit}` },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock user document
      await tx.user.update({
        where: { id: payload.userId },
        data: { updatedAt: new Date() }
      });

      // 2. Calculate available balance inside transaction
      const availableBalance = await getAvailableBalance(payload.userId, tx);

      if (amount > availableBalance) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration);

      let bonusAmount = 0;
      if (amount >= 3000) {
        bonusAmount = amount * 0.30;
      } else if (amount >= 1000) {
        bonusAmount = amount * 0.10;
      }

      const investment = await tx.investment.create({
        data: {
          userId: payload.userId,
          planId,
          amount,
          bonusAmount,
          startDate,
          endDate,
          status: 'active',
        },
      });

      // Deposit transaction
      await tx.transaction.create({
        data: {
          userId: payload.userId,
          type: 'deposit',
          amount,
          status: 'completed',
          description: `Investment activated — ${plan.name}`,
          reference: investment.id,
        },
      });

      // Decrement the user's persisted balance field and set planRate
      await tx.user.update({
        where: { id: payload.userId },
        data: {
          balance: { decrement: amount },
          planRate: plan.dailyROI * 100,
        }
      });

      // Propagate referral commissions
      await propagateCommissions(payload.userId, investment.id, amount, tx);

      return investment;
    });

    return NextResponse.json({ message: 'Investment activated', investment: result }, { status: 201 });
  } catch (err: any) {
    if (err.message === 'INSUFFICIENT_BALANCE') {
      return NextResponse.json(
        { error: 'Insufficient available balance to invest.' },
        { status: 400 }
      );
    }
    console.error('[investments/POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
