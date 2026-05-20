import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PLAN_RATES } from '@/lib/roi-engine';

export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = payload.userId;
  const body = await req.json().catch(() => ({}));
  const action = body.action || 'earnings';

  try {
    if (action === 'deposit') {
      // Create a mock completed deposit of $5,000 to user's balance
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: 'deposit',
          amount: 5000.00,
          status: 'completed',
          description: 'Demo Deposit via USDTRC20',
          reference: 'DEMO_DEP_' + Math.random().toString(36).substring(7).toUpperCase(),
        },
      });
      return NextResponse.json({ success: true, message: 'Demo deposit of $5,000 completed successfully!', transaction });
    }

    if (action === 'arbitrage') {
      // Find or upsert Plan B (Popular)
      let plan = await prisma.plan.findFirst({
        where: { name: 'Plan B' },
      });

      if (!plan) {
        plan = await prisma.plan.create({
          data: {
            name: 'Plan B',
            tag: 'Popular',
            minDeposit: 500,
            dailyROI: 0.02,
            duration: 45,
          },
        });
      }

      // Ensure user has at least $2,000 virtual balance by generating a helper deposit first
      const transactionDeposit = await prisma.transaction.create({
        data: {
          userId,
          type: 'deposit',
          amount: 2000.00,
          status: 'completed',
          description: 'Demo Funding for Arbitrage',
          reference: 'DEMO_FUND_' + Math.random().toString(36).substring(7).toUpperCase(),
        },
      });

      // Create an active investment/contract of $2,000
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration);

      const investment = await prisma.investment.create({
        data: {
          userId,
          planId: plan.id,
          amount: 2000.00,
          bonusAmount: 200.00, // 10% bonus
          startDate,
          endDate,
          status: 'active',
          totalEarned: 0,
        },
      });

      // Create the investment transaction deducting the balance
      const transactionInvest = await prisma.transaction.create({
        data: {
          userId,
          type: 'deposit',
          amount: 2000.00,
          status: 'completed',
          description: 'Investment activated — Plan B',
          reference: investment.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Demo Arbitrage Plan B ($2,000 position) activated successfully!',
        investment,
        transactionDeposit,
        transactionInvest,
      });
    }

    if (action === 'earnings') {
      // Ensure user has an investment to earn from, or create one if none exists
      let investment = await prisma.investment.findFirst({
        where: { userId, status: 'active' },
        include: { plan: true },
      });

      if (!investment) {
        let plan = await prisma.plan.findFirst({
          where: { name: 'Plan B' },
        });

        if (!plan) {
          plan = await prisma.plan.create({
            data: {
              name: 'Plan B',
              tag: 'Popular',
              minDeposit: 500,
              dailyROI: 0.02,
              duration: 45,
            },
          });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration);

        investment = await prisma.investment.create({
          data: {
            userId,
            planId: plan.id,
            amount: 1000.00,
            bonusAmount: 100.00,
            startDate,
            endDate,
            status: 'active',
            totalEarned: 0,
          },
          include: { plan: true },
        });
      }

      // Add a random batch of daily ROI entries to populate the ledger history
      const mockROIs = [40.00, 40.80, 41.62, 42.45, 43.30];
      const createdTxns = [];

      for (let i = 0; i < mockROIs.length; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (mockROIs.length - i));

        const entry = await prisma.dailyROIEntry.create({
          data: {
            investmentId: investment.id,
            amount: mockROIs[i],
            date,
          },
        });

        const tx = await prisma.transaction.create({
          data: {
            userId,
            type: 'roi',
            amount: mockROIs[i],
            status: 'completed',
            description: `Daily ROI — ${investment.plan.name}`,
            reference: investment.id,
            createdAt: date,
          },
        });

        // Increment the investment totalEarned
        await prisma.investment.update({
          where: { id: investment.id },
          data: { totalEarned: { increment: mockROIs[i] } },
        });

        createdTxns.push(tx);
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully generated 5 days of mock daily ROI history!',
        transactionsCount: createdTxns.length,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('[simulate-demo/POST]', err);
    return NextResponse.json({ error: err.message || 'Simulation execution failed' }, { status: 500 });
  }
}
