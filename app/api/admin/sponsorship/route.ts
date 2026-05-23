import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/admin/sponsorship
export async function GET(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'list'; // 'list' | 'search_users'
    const search = searchParams.get('search') || '';

    if (mode === 'search_users') {
      // Find normal users that are not sponsored
      const users = await prisma.user.findMany({
        where: {
          isSponsored: false,
          role: 'user',
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
        take: 10
      });
      return NextResponse.json({ users });
    }

    // mode === 'list': Fetch all sponsored users and calculate metrics
    const sponsoredUsers = await prisma.user.findMany({
      where: { isSponsored: true },
      orderBy: { createdAt: 'desc' }
    });

    const leaders = [];

    for (const u of sponsoredUsers) {
      // 1. Calculate Direct Level 1 Sales Volume
      const referrals = await prisma.referralLink.findMany({
        where: { referrerId: u.id },
        select: { referredId: true }
      });
      const referredIds = referrals.map(r => r.referredId);

      const directRealInvestments = await prisma.investment.findMany({
        where: { userId: { in: referredIds }, isVirtual: false },
        select: { amount: true }
      });
      const directSales = directRealInvestments.reduce((sum, inv) => sum + inv.amount, 0);

      // 2. Calculate Network Sales Volume (Recursive down to 16 levels)
      let currentLevelIds = [u.id];
      const allDownlineIds: string[] = [];
      for (let level = 1; level <= 16; level++) {
        const links = await prisma.referralLink.findMany({
          where: { referrerId: { in: currentLevelIds } },
          select: { referredId: true }
        });
        if (links.length === 0) break;
        const nextIds = links.map(l => l.referredId);
        allDownlineIds.push(...nextIds);
        currentLevelIds = nextIds;
      }

      const networkRealInvestments = await prisma.investment.findMany({
        where: { userId: { in: allDownlineIds }, isVirtual: false },
        select: { amount: true }
      });
      const networkSales = networkRealInvestments.reduce((sum, inv) => sum + inv.amount, 0);

      // 3. Fetch approved ROI and Commission withdrawals
      const withdrawals = await prisma.withdrawal.findMany({
        where: { userId: u.id, status: 'approved' },
        select: { amount: true, type: true }
      });

      const totalRoiWithdrawn = withdrawals
        .filter(w => w.type === 'roi')
        .reduce((sum, w) => sum + w.amount, 0);

      const totalCommissionWithdrawn = withdrawals
        .filter(w => w.type === 'commission')
        .reduce((sum, w) => sum + w.amount, 0);

      // Update the user's direct sales cache in DB for quick checks
      await prisma.user.update({
        where: { id: u.id },
        data: { sponsoredDirectSales: directSales }
      });

      leaders.push({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        type: u.sponsoredType || 'free',
        giftedAmount: u.sponsoredGiftedAmount,
        goalAmount: u.sponsoredGoalAmount,
        directSales,
        networkSales,
        totalRoiWithdrawn,
        totalCommissionWithdrawn,
        roiBlocked: u.roiBlocked,
        fundsFrozen: u.fundsFrozen,
        joined: u.createdAt.toISOString().split('T')[0]
      });
    }

    return NextResponse.json({ leaders });
  } catch (err) {
    console.error('[admin-sponsorship-get]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/sponsorship (Gift Sponsored Package)
export async function POST(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, sponsoredType, sponsoredGiftedAmount } = await req.json();

    if (!userId || !sponsoredType || !sponsoredGiftedAmount || sponsoredGiftedAmount <= 0) {
      return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find matching investment plan based on amount
    const plans = await prisma.plan.findMany({ where: { isActive: true } });
    if (plans.length === 0) {
      return NextResponse.json({ error: 'No active plans configured' }, { status: 400 });
    }

    // Find the plan with minDeposit closest but less than or equal to sponsoredGiftedAmount
    const eligiblePlans = plans.filter(p => p.minDeposit <= sponsoredGiftedAmount);
    const plan = eligiblePlans.length > 0 
      ? eligiblePlans.reduce((prev, curr) => (curr.minDeposit > prev.minDeposit ? curr : prev))
      : plans[0]; // fallback to first plan

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    await prisma.$transaction(async (tx) => {
      // 1. Lock user document
      await tx.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() }
      });

      // 2. Create the virtual investment
      const investment = await tx.investment.create({
        data: {
          userId,
          planId: plan.id,
          amount: sponsoredGiftedAmount,
          startDate,
          endDate,
          status: 'active',
          isVirtual: true // Mark as virtual
        }
      });

      // 3. Create virtual transaction (to track plan activation history)
      await tx.transaction.create({
        data: {
          userId,
          type: 'deposit',
          amount: sponsoredGiftedAmount,
          status: 'completed',
          description: `Gifted sponsored package — ${plan.name} (Virtual)`,
          reference: investment.id,
          isVirtual: true
        }
      });

      // 4. Update sponsored details on user
      const sponsoredGoalAmount = sponsoredType === 'goal_locked' ? sponsoredGiftedAmount * 2 : 0;
      await tx.user.update({
        where: { id: userId },
        data: {
          isSponsored: true,
          sponsoredType,
          sponsoredGiftedAmount: { increment: sponsoredGiftedAmount },
          sponsoredGoalAmount: { increment: sponsoredGoalAmount },
          activeDeposit: { increment: sponsoredGiftedAmount },
          planRate: plan.dailyROI * 100,
          roiBlocked: false,
        }
      });
    });

    return NextResponse.json({ success: true, message: 'Sponsored account created successfully' });
  } catch (err) {
    console.error('[admin-sponsorship-post]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/sponsorship (Manage blocks & edit pending payouts)
export async function PUT(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, action, withdrawalId, newAmount } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (action === 'toggle_roi_block') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { roiBlocked: !user.roiBlocked }
      });

      return NextResponse.json({
        success: true,
        message: `ROI withdrawals ${updated.roiBlocked ? 'blocked' : 'unblocked'} successfully`
      });
    }

    if (action === 'toggle_freeze') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { fundsFrozen: !user.fundsFrozen }
      });

      return NextResponse.json({
        success: true,
        message: `Account funds ${updated.fundsFrozen ? 'frozen' : 'unfrozen'} successfully`
      });
    }

    if (action === 'modify_withdrawal') {
      if (!withdrawalId || newAmount == null || newAmount <= 0) {
        return NextResponse.json({ error: 'Missing modification parameters' }, { status: 400 });
      }

      const withdrawal = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
      if (!withdrawal) return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
      if (withdrawal.status !== 'pending') {
        return NextResponse.json({ error: 'Withdrawal has already been processed' }, { status: 400 });
      }

      if (newAmount > withdrawal.amount) {
        return NextResponse.json({ error: 'Cannot increase the requested withdrawal amount' }, { status: 400 });
      }

      const diff = withdrawal.amount - newAmount;

      await prisma.$transaction(async (tx) => {
        // 1. Update the withdrawal amount and note
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            amount: newAmount,
            note: `Amount modified by Administrator (Original: $${withdrawal.amount.toFixed(2)} | Adjusted: $${newAmount.toFixed(2)})`
          }
        });

        // 2. Update the corresponding outgoing transaction
        const txn = await tx.transaction.findFirst({
          where: { userId, type: 'withdrawal', reference: withdrawalId }
        });
        if (txn) {
          await tx.transaction.update({
            where: { id: txn.id },
            data: {
              amount: -newAmount,
              description: txn.description ? `${txn.description} (Adjusted by Admin)` : `Adjusted Withdrawal request`
            }
          });
        }

        // 3. Refund the difference back to the user's balance
        if (diff > 0) {
          await tx.user.update({
            where: { id: userId },
            data: { balance: { increment: diff } }
          });
        }
      });

      return NextResponse.json({
        success: true,
        message: `Withdrawal successfully adjusted. Original: $${withdrawal.amount.toFixed(2)} | Adjusted: $${newAmount.toFixed(2)}. Difference refunded: $${diff.toFixed(2)}.`
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[admin-sponsorship-put]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
