import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { propagateCommissions } from '@/lib/referral-engine';
import { getAvailableBalance, getP2pBalance } from '@/lib/balance';
import { SYSTEM_CONFIG } from '@/lib/config/system';
import { addBusinessDays } from '@/lib/roi-engine';

const createSchema = z.object({
  planId: z.string().min(1),
  amount: z.number().positive(),
  p2pAmount: z.number().min(0).optional().default(0), // Amount to use from P2P Wallet (max 50% of total)
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

// POST /api/investments — create a new investment (deducts from Internal Wallet + optionally P2P Wallet)
export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const { planId, amount, p2pAmount } = parsed.data;

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

    // ── P2P 50/50 Rule Enforcement ────────────────────────────────────────────
    // Maximum 50% of the package value can be paid using P2P balance.
    // The remaining 50%+ must come from Internal Wallet (new USDT deposits).
    if (p2pAmount > 0) {
      const maxP2p = +(amount * 0.50).toFixed(2);
      if (p2pAmount > maxP2p) {
        return NextResponse.json(
          { error: `Maximum ${50}% of the package value ($${maxP2p.toFixed(2)}) can be paid from your P2P Wallet. The remaining must come from your Internal Wallet.` },
          { status: 400 }
        );
      }
    }

    const internalAmount = +(amount - p2pAmount).toFixed(2); // Amount from Internal Wallet

    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock user document (optimistic concurrency on MongoDB)
      await tx.user.update({
        where: { id: payload.userId },
        data:  { updatedAt: new Date() },
      });

      // 2. Verify available Internal Wallet balance inside transaction
      const availableBalance = await getAvailableBalance(payload.userId, tx);
      if (internalAmount > availableBalance) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      // 3. Verify available P2P Wallet balance if using P2P funds
      if (p2pAmount > 0) {
        const p2pBal = await getP2pBalance(payload.userId, tx);
        if (p2pAmount > p2pBal) {
          throw new Error('INSUFFICIENT_P2P_BALANCE');
        }
      }

      // 4. Calculate tier bonus per spec:
      //    Starter ($10–$999):   0% bonus
      //    Prime   ($1,000+):   +10% bonus
      //    Ultra   ($3,000+):   +20% bonus
      const tierBonus = (plan as any).bonus ? +(amount * (plan as any).bonus).toFixed(2) : 0;

      // activeCapital = principal + instant tier bonus (generates returns from Day 1)
      const activeCapital = +(amount + tierBonus).toFixed(2);

      // maxPayout = original deposited amount × 2 (hard lifetime earnings cap)
      // All earnings (daily ROI + commissions + bonuses) count toward this limit.
      const maxPayout = +(amount * 2).toFixed(2);

      // 5. Contract end date: startDate + plan.duration calendar days (approximate)
      //    Actual enforcement is via businessDaysElapsed counter in the ROI engine.
      const startDate = new Date();
      const endDate   = addBusinessDays(startDate, plan.duration);

      // 6. Create the investment record
      const investment = await tx.investment.create({
        data: {
          userId:      payload.userId,
          planId,
          amount,
          bonusAmount: tierBonus, // kept for backwards compat
          tierBonus,
          activeCapital,
          maxPayout,
          startDate,
          endDate,
          status: 'active',
        } as any,
      });

      // 7. Deposit transaction record (funds moved from balance to investment)
      const descParts = [`Investment activated — ${plan.name}`];
      if (tierBonus > 0) descParts.push(`(+$${tierBonus.toFixed(2)} tier bonus)`);
      if (p2pAmount > 0) descParts.push(`[P2P: $${p2pAmount.toFixed(2)}]`);

      await tx.transaction.create({
        data: {
          userId:      payload.userId,
          type:        'deposit',
          amount,
          status:      'completed',
          description: descParts.join(' '),
          reference:   investment.id,
        },
      });

      // 8. Deduct from Internal Wallet balance
      if (internalAmount > 0) {
        await tx.user.update({
          where: { id: payload.userId },
          data: {
            balance: { decrement: internalAmount },
          },
        });
      }

      // 9. Deduct from P2P Wallet if applicable
      if (p2pAmount > 0) {
        await tx.user.update({
          where: { id: payload.userId },
          data: {
            p2pBalance: { decrement: p2pAmount },
          },
        });

        // Record P2P usage transaction for audit trail
        await tx.transaction.create({
          data: {
            userId:      payload.userId,
            type:        'p2p_activation',
            amount:      p2pAmount,
            status:      'completed',
            description: `P2P funds used for ${plan.name} activation`,
            reference:   investment.id,
          },
        });
      }

      // 10. Update user operational capital and plan rate
      await tx.user.update({
        where: { id: payload.userId },
        data: {
          planRate:          plan.dailyROI * 100,
          // operationalCapital tracks the sum of all active investment activeCapitals
          operationalCapital: { increment: activeCapital },
          // activeDeposit kept for backwards compat with existing dashboard queries
          activeDeposit:     { increment: amount },
        } as any,
      });

      // 11. Propagate referral commissions on the deposited amount
      await propagateCommissions(payload.userId, investment.id, amount, tx);

      return { investment, tierBonus, activeCapital, p2pAmount, internalAmount };
    });

    return NextResponse.json(
      {
        message:       'Investment activated',
        investment:    result.investment,
        tierBonus:     result.tierBonus,
        activeCapital: result.activeCapital,
        p2pUsed:       result.p2pAmount,
        internalUsed:  result.internalAmount,
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err.message === 'INSUFFICIENT_BALANCE') {
      return NextResponse.json(
        { error: 'Insufficient Internal Wallet balance to invest.' },
        { status: 400 }
      );
    }
    if (err.message === 'INSUFFICIENT_P2P_BALANCE') {
      return NextResponse.json(
        { error: 'Insufficient P2P Wallet balance.' },
        { status: 400 }
      );
    }
    console.error('[investments/POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
