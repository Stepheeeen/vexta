import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { propagateCommissions } from '@/lib/referral-engine';
import { getAvailableBalance } from '@/lib/balance';
import { SYSTEM_CONFIG } from '@/lib/config/system';
import { addBusinessDays } from '@/lib/roi-engine';

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

// POST /api/investments — create a new investment (deducts from user balance)
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

    // Check maintenance mode
    const settings = await prisma.settings.findFirst();
    if (settings?.maintenanceMode && payload.role !== 'admin') {
      return NextResponse.json({ error: 'System is currently under maintenance. New investments are temporarily disabled.' }, { status: 503 });
    }

    if (amount < plan.minDeposit) {
      return NextResponse.json(
        { error: `Minimum deposit for ${plan.name} is $${plan.minDeposit}` },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock user document (optimistic concurrency on MongoDB)
      await tx.user.update({
        where: { id: payload.userId },
        data:  { updatedAt: new Date() },
      });

      // 2. Verify available balance inside transaction
      const availableBalance = await getAvailableBalance(payload.userId, tx);
      if (amount > availableBalance) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      // 3. Calculate tier bonus per spec:
      //    Starter ($10–$999):   0% bonus
      //    Prime   ($1,000+):   +10% bonus
      //    Ultra   ($3,000+):   +20% bonus
      const tierBonus = (plan as any).bonus ? +(amount * (plan as any).bonus).toFixed(2) : 0;

      // activeCapital = principal + instant tier bonus (generates returns from Day 1)
      const activeCapital = +(amount + tierBonus).toFixed(2);

      // 4. Contract end date: startDate + plan.duration calendar days (approximate)
      //    Actual enforcement is via businessDaysElapsed counter in the ROI engine.
      const startDate = new Date();
      const endDate   = addBusinessDays(startDate, plan.duration);

      // 5. Create the investment record
      const investment = await tx.investment.create({
        data: {
          userId:      payload.userId,
          planId,
          amount,
          bonusAmount: tierBonus, // kept for backwards compat
          tierBonus,
          activeCapital,
          startDate,
          endDate,
          status: 'active',
        } as any,
      });

      // 6. Deposit transaction record (funds moved from balance to investment)
      await tx.transaction.create({
        data: {
          userId:      payload.userId,
          type:        'deposit',
          amount,
          status:      'completed',
          description: `Investment activated — ${plan.name}${tierBonus > 0 ? ` (+$${tierBonus.toFixed(2)} tier bonus)` : ''}`,
          reference:   investment.id,
        },
      });

      // 7. Deduct from user balance, update operational capital and planRate
      await tx.user.update({
        where: { id: payload.userId },
        data: {
          balance:           { decrement: amount },
          planRate:          plan.dailyROI * 100,
          // operationalCapital tracks the sum of all active investment activeCapitals
          operationalCapital: { increment: activeCapital },
          // activeDeposit kept for backwards compat with existing dashboard queries
          activeDeposit:     { increment: amount },
        } as any,
      });

      // 8. Propagate referral commissions on the deposited amount
      await propagateCommissions(payload.userId, investment.id, amount, tx);

      return { investment, tierBonus, activeCapital };
    });

    return NextResponse.json(
      {
        message:       'Investment activated',
        investment:    result.investment,
        tierBonus:     result.tierBonus,
        activeCapital: result.activeCapital,
      },
      { status: 201 }
    );
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
