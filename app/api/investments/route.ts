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

      // 4. Calculate tier bonus
      const tierBonus = (plan as any).bonus ? +(amount * (plan as any).bonus).toFixed(2) : 0;
      const activeCapital = +(amount + tierBonus).toFixed(2);
      const maxPayout = +(amount * 2).toFixed(2);
      const startDate = new Date();
      const endDate   = addBusinessDays(startDate, plan.duration);

      // 5. Create the investment record
      // commissionStatus = 'pending' so the retry reconciler can pick it up
      // if the server crashes before propagateCommissions completes.
      const investment = await tx.investment.create({
        data: {
          userId:          payload.userId,
          planId,
          amount,
          bonusAmount:     tierBonus,
          tierBonus,
          activeCapital,
          maxPayout,
          startDate,
          endDate,
          status:          'active',
          commissionStatus: 'pending',
        } as any,
      });

      // 6. Deposit transaction record
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

      // 7. Deduct balances
      if (internalAmount > 0) {
        await tx.user.update({
          where: { id: payload.userId },
          data: { balance: { decrement: internalAmount } },
        });
      }

      if (p2pAmount > 0) {
        await tx.user.update({
          where: { id: payload.userId },
          data: { p2pBalance: { decrement: p2pAmount } },
        });
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

      // 8. Update user operational capital
      await tx.user.update({
        where: { id: payload.userId },
        data: {
          planRate:          plan.dailyROI * 100,
          operationalCapital: { increment: activeCapital },
          activeDeposit:     { increment: amount },
        } as any,
      });

      return { investment, tierBonus, activeCapital, p2pAmount, internalAmount };

    // NOTE: Commissions are intentionally run OUTSIDE this transaction.
    // The commission chain (13 levels × multiple DB queries) exceeds Prisma's
    // default 5-second interactive transaction timeout, rolling back the entire
    // investment. By moving them outside, a slow commission chain can never
    // undo a successfully committed investment.
    }, { timeout: 30000 });

    // 9. Fire-and-forget commission propagation AFTER the investment is committed.
    // commissionStatus starts as 'pending'; we mark it 'completed' on success.
    // If the server crashes here, the retry-commissions endpoint will pick it up.
    const investmentId = result.investment.id;
    propagateCommissions(payload.userId, investmentId, amount)
      .then(async levels => {
        console.log(`[investments/POST] Commissions propagated: ${levels.length} levels for investment ${investmentId}`);
        // Mark commissionStatus as completed so the reconciler skips it
        await prisma.investment.update({
          where: { id: investmentId },
          data:  { commissionStatus: 'completed' } as any,
        }).catch(e => console.error('[investments/POST] Failed to update commissionStatus:', e));
      })
      .catch(async commErr => {
        console.error('[investments/POST] Commission propagation error (non-fatal, investment committed):', commErr);
        // commissionStatus remains 'pending' — retry-commissions endpoint will retry it
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
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred during activation. Please try again.' },
      { status: 500 }
    );
  }
}
