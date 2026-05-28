import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAvailableBalance, getWithdrawableBalances } from '@/lib/balance';
import { deductWithdrawalFromCapital } from '@/lib/roi-engine';

const schema = z.object({
  amount:        z.number().positive().min(10, 'Minimum withdrawal is $10'),
  walletAddress: z.string().min(10, 'Invalid wallet address'),
  network:       z.enum(['BEP20']).default('BEP20'),
  type:          z.enum(['roi', 'commission']).default('roi'),
  verificationCode: z.string().optional(),
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

    const { amount, walletAddress, network, type, verificationCode } = parsed.data;

    // Check system settings
    const settings = await prisma.settings.findFirst();
    if (settings?.maintenanceMode && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'System is currently undergoing maintenance. Withdrawals are temporarily disabled.' },
        { status: 503 }
      );
    }

    const userRecord = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (!verificationCode) {
      // Preliminary balance check
      const pools = await getWithdrawableBalances(payload.userId, prisma as any);
      const availableInPool = type === 'roi' ? pools.availableRoi : pools.availableCommission;
      
      if (amount > availableInPool) {
        return NextResponse.json({ error: 'Insufficient available balance in the selected withdrawal category.' }, { status: 400 });
      }

      if ((userRecord as any).fundsFrozen) {
        return NextResponse.json({ error: 'Your account funds are temporarily frozen. Please contact support.' }, { status: 400 });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.user.update({
        where: { id: payload.userId },
        data: {
          verificationCode: code,
          verificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000),
        }
      });

      const { sendWithdrawalOTPEmail } = require('@/lib/mail');
      await sendWithdrawalOTPEmail(userRecord.email, userRecord.firstName, code, amount, network);

      return NextResponse.json({ requiresOtp: true, message: 'OTP sent to email' }, { status: 200 });
    }

    // Verify OTP
    if ((userRecord as any).verificationCode !== verificationCode || !(userRecord as any).verificationCodeExpires || new Date() > (userRecord as any).verificationCodeExpires) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock user document
      const user = await tx.user.update({
        where: { id: payload.userId },
        data: { updatedAt: new Date() }
      });

      if ((user as any).fundsFrozen) {
        throw new Error('FUNDS_FROZEN');
      }

      // 2. Calculate available balance inside transaction
      const pools = await getWithdrawableBalances(payload.userId, tx);
      const availableInPool = type === 'roi' ? pools.availableRoi : pools.availableCommission;

      if (amount > availableInPool) {
        throw new Error('INSUFFICIENT_POOL_BALANCE');
      }

      // Free sponsored check
      if ((user as any).isSponsored && (user as any).sponsoredType === 'free' && type === 'roi') {
        // Calculate historical ROI withdrawn inside transaction
        const roiWithdrawnResult = await tx.withdrawal.aggregate({
          where: { userId: payload.userId, status: { in: ['approved', 'pending'] }, type: 'roi' },
          _sum: { amount: true }
        });
        const totalRoiWithdrawn = roiWithdrawnResult._sum.amount ?? 0;

        if ((totalRoiWithdrawn + amount) > 12) {
          if ((user as any).sponsoredDirectSales < 10) {
            // Lock user's ROI withdrawals
            await tx.user.update({
              where: { id: payload.userId },
              data: { roiBlocked: true } as any
            });
            throw new Error('FREE_ROI_LOCKED');
          }
        }
      }

      const feeRate = settings ? settings.withdrawalFee / 100 : 0.06;
      const fee = Number((amount * feeRate).toFixed(2));
      const netAmount = Number((amount - fee).toFixed(2));

      // 3. Decrement user's persisted balance field
      await tx.user.update({
        where: { id: payload.userId },
        data: { balance: { decrement: amount } }
      });

      // 3.5. Deduct from operational capital if it's an ROI withdrawal
      if (type === 'roi') {
        await deductWithdrawalFromCapital(payload.userId, amount, tx);
      }

      const withdrawal = await tx.withdrawal.create({
        data: { 
          userId: payload.userId, 
          amount, 
          walletAddress, 
          network, 
          type,
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
          description: `Withdrawal request (${type === 'roi' ? 'ROI' : 'Commission'}) — ${network} (Net: $${netAmount.toFixed(2)}, Fee: $${fee.toFixed(2)})`,
          reference: withdrawal.id,
        },
      });

      return withdrawal;
    });

    // Clear verification code after successful transaction
    await prisma.user.update({
      where: { id: payload.userId },
      data: { verificationCode: null, verificationCodeExpires: null }
    });

    return NextResponse.json({ message: 'Withdrawal request submitted', withdrawal: result }, { status: 201 });
  } catch (err: any) {
    if (err.message === 'FUNDS_FROZEN') {
      return NextResponse.json(
        { error: 'Your account funds are temporarily frozen. Please contact support.' },
        { status: 400 }
      );
    }
    if (err.message === 'INSUFFICIENT_POOL_BALANCE') {
      return NextResponse.json(
        { error: 'Insufficient available balance in the selected withdrawal category.' },
        { status: 400 }
      );
    }
    if (err.message === 'FREE_ROI_LOCKED') {
      return NextResponse.json(
        { error: 'ROI withdrawals are locked. A minimum of $10 USD in direct sales is required to withdraw more than $12 USD in ROI.' },
        { status: 400 }
      );
    }
    console.error('[withdrawals/POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
