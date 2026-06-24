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
  // Accept both old and new type names for backwards compatibility
  type:          z.enum(['roi', 'commission', 'passive', 'network', 'all']).default('passive'),
  verificationCode: z.string().optional(),
});

// Normalize type names: roi → passive, commission → network
function normalizeWithdrawalType(type: string): 'passive' | 'network' | 'all' {
  if (type === 'all') return 'all';
  if (type === 'roi' || type === 'passive') return 'passive';
  return 'network';
}

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

    const { amount, walletAddress, network, verificationCode } = parsed.data;
    const type = normalizeWithdrawalType(parsed.data.type);

    // Check system settings
    const settings = await prisma.settings.findFirst();
    if (settings?.maintenanceMode && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'System is currently undergoing maintenance. Withdrawals are temporarily disabled.' },
        { status: 503 }
      );
    }

    // Check timezone window: Friday 10:00 UTC to 18:00 UTC
    // which equals Friday 6:00 PM to Saturday 2:00 AM (Singapore Time GMT+8)
    const now = new Date();
    const currentDay = now.getUTCDay(); // 0 is Sunday, 5 is Friday
    const currentHour = now.getUTCHours(); // 0-23
    
    const isWithdrawalWindow = currentDay === 5 && currentHour >= 10 && currentHour < 18;
    
    if (!isWithdrawalWindow && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Withdrawals are currently closed. The withdrawal gateway is only open on Fridays from 6:00 PM to 2:00 AM Saturday (Singapore Time GMT+8).' },
        { status: 403 }
      );
    }

    const userRecord = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (userRecord.withdrawalsBlocked) {
      return NextResponse.json({ error: 'Your withdrawals have been blocked by an administrator. Please contact support.' }, { status: 400 });
    }

    // Prevent multiple withdrawals in the same window (max 1 per Friday)
    // Check if the user has made a withdrawal in the last 24 hours (covers the entire 8-hour window)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentWithdrawal = await prisma.withdrawal.findFirst({
      where: {
        userId: payload.userId,
        createdAt: { gte: last24Hours }
      }
    });

    if (recentWithdrawal && payload.role !== 'admin') {
      return NextResponse.json({ 
        error: 'You have already requested a withdrawal this week. Users are limited to one withdrawal per Friday.' 
      }, { status: 400 });
    }

    if (!verificationCode) {
      // Preliminary balance check
      const pools = await getWithdrawableBalances(payload.userId, prisma as any);
      let availableInPool = 0;
      if (type === 'passive') availableInPool = pools.availablePassive;
      else if (type === 'network') availableInPool = pools.availableNetwork;
      else if (type === 'all') availableInPool = pools.availablePassive + pools.availableNetwork;
      
      if (amount > availableInPool) {
        // For gifted leaders trying to withdraw passive earnings
        if ((type === 'passive' || type === 'all') && pools.blockedPassive > 0 && amount > pools.availableNetwork) {
          return NextResponse.json({ error: 'Passive earnings withdrawal is currently restricted. Network earnings can be withdrawn normally. Contact management for approval.' }, { status: 400 });
        }
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
    if (userRecord.verificationCode !== verificationCode || !userRecord.verificationCodeExpires || new Date() > userRecord.verificationCodeExpires) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock user document
      const user = await tx.user.update({
        where: { id: payload.userId },
        data: { updatedAt: new Date() }
      });

      if (user.fundsFrozen) {
        throw new Error('FUNDS_FROZEN');
      }

      if (user.withdrawalsBlocked) {
        throw new Error('WITHDRAWALS_BLOCKED');
      }

      // 2. Calculate available balance inside transaction
      const pools = await getWithdrawableBalances(payload.userId, tx);
      let availableInPool = 0;
      if (type === 'passive') availableInPool = pools.availablePassive;
      else if (type === 'network') availableInPool = pools.availableNetwork;
      else if (type === 'all') availableInPool = pools.availablePassive + pools.availableNetwork;

      if (amount > availableInPool) {
        if ((type === 'passive' || type === 'all') && pools.blockedPassive > 0 && amount > pools.availableNetwork) {
          throw new Error('PASSIVE_BLOCKED');
        }
        throw new Error('INSUFFICIENT_POOL_BALANCE');
      }

      // Dynamic Fee Calculation
      // < $600: 6% fee, >= $600: 2% fee
      const feePercentage = amount >= 600 ? 0.02 : 0.06;
      const percentageFee = amount * feePercentage;
      const MAINTENANCE_FEE = 0.01;
      const totalFee = Number((percentageFee + MAINTENANCE_FEE).toFixed(2));
      const netAmount = Number((amount - totalFee).toFixed(2));

      // Calculate Passive vs Network split if type is 'all'
      let passiveAmount = 0;
      let networkAmount = 0;
      if (type === 'all') {
        if (amount <= pools.availablePassive) {
          passiveAmount = amount;
        } else {
          passiveAmount = pools.availablePassive;
          networkAmount = amount - pools.availablePassive;
        }
      } else if (type === 'passive') {
        passiveAmount = amount;
      } else {
        networkAmount = amount;
      }

      // 3. Decrement user's persisted balance by the full requested amount
      await tx.user.update({
        where: { id: payload.userId },
        data: { balance: { decrement: amount } }
      });

      // 3.5. Deduct from operational capital if it involves passive earnings
      if (passiveAmount > 0) {
        await deductWithdrawalFromCapital(payload.userId, passiveAmount, tx);
      }

      // Generate the note for the withdrawal record
      let noteStr = `Fee: $${totalFee.toFixed(2)} | Net payout: $${netAmount.toFixed(2)}`;
      if (type === 'all') {
        noteStr = `[ALL:P=${passiveAmount},N=${networkAmount}] ` + noteStr;
      }

      const withdrawal = await tx.withdrawal.create({
        data: { 
          userId: payload.userId, 
          amount,       // gross amount requested (full balance deduction)
          walletAddress, 
          network, 
          type,         // 'passive', 'network', or 'all'
          status: 'pending',
          note: noteStr
        },
      });

      // 4. Record outgoing transaction
      let typeLabel = 'Passive Earnings';
      if (type === 'network') typeLabel = 'Network Earnings';
      if (type === 'all') typeLabel = 'Consolidated (All)';
      
      await tx.transaction.create({
        data: {
          userId: payload.userId,
          type: 'withdrawal',
          amount: -amount,
          status: 'pending',
          description: `Withdrawal request (${typeLabel}) — ${network} (Net: $${netAmount.toFixed(2)}, Fee: $${totalFee.toFixed(2)})`,
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
    if (err.message === 'WITHDRAWALS_BLOCKED') {
      return NextResponse.json(
        { error: 'Your withdrawals have been blocked by an administrator. Please contact support.' },
        { status: 400 }
      );
    }
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
    if (err.message === 'PASSIVE_BLOCKED') {
      return NextResponse.json(
        { error: 'Passive earnings withdrawal is currently restricted for your account. Network earnings can be withdrawn normally. Please contact management for approval.' },
        { status: 400 }
      );
    }
    console.error('[withdrawals/POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
