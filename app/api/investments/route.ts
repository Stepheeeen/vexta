import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { propagateCommissions } from '@/lib/referral-engine';

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

    // Calculate available balance
    const depositTxns = await prisma.transaction.aggregate({
      where: {
        userId: payload.userId,
        type: 'deposit',
        description: { not: { contains: 'Investment activated' } }
      },
      _sum: { amount: true }
    });
    const totalDeposits = depositTxns._sum.amount ?? 0;

    const earnedResult = await prisma.investment.aggregate({
      where: { userId: payload.userId },
      _sum: { totalEarned: true },
    });
    const totalEarned = earnedResult._sum.totalEarned ?? 0;

    const commissionResult = await prisma.commission.aggregate({
      where: { userId: payload.userId },
      _sum: { amount: true },
    });
    const totalCommissions = commissionResult._sum.amount ?? 0;

    const investmentsResult = await prisma.investment.aggregate({
      where: { userId: payload.userId },
      _sum: { amount: true },
    });
    const totalInvested = investmentsResult._sum.amount ?? 0;

    const withdrawnResult = await prisma.withdrawal.aggregate({
      where: { userId: payload.userId, status: { in: ['approved', 'pending'] } },
      _sum: { amount: true },
    });
    const totalWithdrawn = withdrawnResult._sum.amount ?? 0;

    const availableBalance = totalDeposits + totalEarned + totalCommissions - totalInvested - totalWithdrawn;

    if (amount > availableBalance) {
      return NextResponse.json(
        { error: `Insufficient available balance to invest. Available: $${availableBalance.toFixed(2)}` },
        { status: 400 }
      );
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    const investment = await prisma.investment.create({
      data: {
        userId: payload.userId,
        planId,
        amount,
        startDate,
        endDate,
        status: 'active',
      },
    });

    // Deposit transaction
    await prisma.transaction.create({
      data: {
        userId: payload.userId,
        type: 'deposit',
        amount,
        status: 'completed',
        description: `Investment activated — ${plan.name}`,
        reference: investment.id,
      },
    });

    // Propagate referral commissions
    await propagateCommissions(payload.userId, investment.id, amount);

    return NextResponse.json({ message: 'Investment activated', investment }, { status: 201 });
  } catch (err) {
    console.error('[investments/POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
