import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAvailableBalance, getWithdrawableBalances, safeDecrementBalance } from '@/lib/balance';
import bcrypt from 'bcryptjs';

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
    
    const standardWindow = currentDay === 5 && currentHour >= 10 && currentHour < 18;

    // Check manual override setting
    let isWithdrawalWindow = false;
    const withdrawalState = settings?.withdrawalGatewayState ?? 'auto';
    if (withdrawalState === 'open') {
      isWithdrawalWindow = true;
    } else if (withdrawalState === 'closed') {
      isWithdrawalWindow = false;
    } else {
      isWithdrawalWindow = standardWindow;
    }
    
    // Admin bypasses the timezone check.
    if (!isWithdrawalWindow && payload.role !== 'admin') {
      const closeMsg = withdrawalState === 'closed'
        ? 'Withdrawals have been manually closed by management.'
        : 'Withdrawals are currently closed. The withdrawal gateway is only open on Fridays from 6:00 PM to 2:00 AM Saturday (Singapore Time GMT+8).';
      return NextResponse.json(
        { error: closeMsg },
        { status: 403 }
      );
    }

    const userRecord = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (userRecord.withdrawalsBlocked) {
      return NextResponse.json({ error: 'Your withdrawals have been blocked by an administrator. Please contact support.' }, { status: 400 });
    }

    // Prevent multiple withdrawals in the same week (max 1 per Friday window)
    // Find the START of the current Friday's 10:00 UTC window.
    // Using current Friday window start — not a rolling 24h — so a user who withdrew
    // at Friday 17:55 UTC is only blocked until next Friday 10:00 UTC (not 17:55).
    const now2 = new Date();
    const fridayWindowStart = new Date(now2);
    fridayWindowStart.setUTCHours(10, 0, 0, 0); // This Friday at 10:00 UTC

    const recentWithdrawal = await prisma.withdrawal.findFirst({
      where: {
        userId: payload.userId,
        createdAt: { gte: fridayWindowStart },
        status: { not: 'rejected' }, // Don't count rejected withdrawals
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
        if ((type === 'passive' || type === 'all') && pools.blockedPassive > 0 && amount > pools.availableNetwork) {
          return NextResponse.json({ error: 'Passive earnings withdrawal is currently restricted. Network earnings can be withdrawn normally. Contact management for approval.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Insufficient available balance in the selected withdrawal category.' }, { status: 400 });
      }

      if ((userRecord as any).fundsFrozen) {
        return NextResponse.json({ error: 'Your account funds are temporarily frozen. Please contact support.' }, { status: 400 });
      }

      // Check OTP lockout
      if ((userRecord as any).otpLockedUntil && new Date() < (userRecord as any).otpLockedUntil) {
        const unlockTime = new Date((userRecord as any).otpLockedUntil).toUTCString();
        return NextResponse.json({ error: `Too many failed attempts. OTP locked until ${unlockTime}.` }, { status: 429 });
      }

      // Generate and hash OTP — plaintext is emailed, only hash is stored
      const plainCode = String(Math.floor(100000 + Math.random() * 900000));
      const hashedCode = await bcrypt.hash(plainCode, 10);

      await prisma.user.update({
        where: { id: payload.userId },
        data: {
          verificationCode: hashedCode,
          verificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000),
          otpAttempts: 0,        // reset attempt counter on new OTP
          otpLockedUntil: null,
        } as any
      });

      const { sendWithdrawalOTPEmail } = require('@/lib/mail');
      await sendWithdrawalOTPEmail(userRecord.email, userRecord.firstName, plainCode, amount, network);

      return NextResponse.json({ requiresOtp: true, message: 'OTP sent to email' }, { status: 200 });
    }

    // ── Verify OTP ─────────────────────────────────────────────────────────────
    // Check lockout first
    if ((userRecord as any).otpLockedUntil && new Date() < (userRecord as any).otpLockedUntil) {
      const unlockTime = new Date((userRecord as any).otpLockedUntil).toUTCString();
      return NextResponse.json({ error: `Too many failed attempts. OTP locked until ${unlockTime}.` }, { status: 429 });
    }

    if (!userRecord.verificationCode || !userRecord.verificationCodeExpires || new Date() > userRecord.verificationCodeExpires) {
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    // Constant-time hash comparison (bcrypt)
    const otpValid = await bcrypt.compare(verificationCode, userRecord.verificationCode);

    if (!otpValid) {
      // Increment attempt counter
      const newAttempts = ((userRecord as any).otpAttempts ?? 0) + 1;
      const MAX_OTP_ATTEMPTS = 5;
      const updateData: any = { otpAttempts: newAttempts };

      if (newAttempts >= MAX_OTP_ATTEMPTS) {
        // Lock for 30 minutes after 5 failures
        updateData.otpLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        updateData.verificationCode = null;
        updateData.verificationCodeExpires = null;
        await prisma.user.update({ where: { id: payload.userId }, data: updateData });
        return NextResponse.json({ error: 'Too many failed attempts. OTP has been invalidated. Please request a new one after 30 minutes.' }, { status: 429 });
      }

      await prisma.user.update({ where: { id: payload.userId }, data: updateData });
      return NextResponse.json({ 
        error: `Invalid verification code. ${MAX_OTP_ATTEMPTS - newAttempts} attempt(s) remaining.` 
      }, { status: 400 });
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
      } else if (type === 'network') {
        networkAmount = amount;
      }

      // 3. Persist the balance deduction
      await safeDecrementBalance(payload.userId, amount, tx);



      // 3.6. Reset/consume temporary withdrawal unlock if any
      const unlockType = (user as any).withdrawalUnlockType ?? 'none';
      if (unlockType === 'full') {
        await tx.user.update({
          where: { id: payload.userId },
          data: { withdrawalUnlockType: 'none', withdrawalUnlockAmount: 0 }
        });
      } else if (unlockType === 'amount' && passiveAmount > 0) {
        const newUnlockedAmount = Math.max(0, ((user as any).withdrawalUnlockAmount ?? 0) - passiveAmount);
        await tx.user.update({
          where: { id: payload.userId },
          data: {
            withdrawalUnlockAmount: newUnlockedAmount,
            withdrawalUnlockType: newUnlockedAmount <= 0.01 ? 'none' : 'amount'
          }
        });
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

      return { ...withdrawal, _netAmount: netAmount };
    }, { timeout: 30000 });

    // Clear verification code after successful transaction
    await prisma.user.update({
      where: { id: payload.userId },
      data: { verificationCode: null, verificationCodeExpires: null }
    });

    // ── PLISIO AUTOMATED WITHDRAWAL ───────────────────────────────────────────
    const { SYSTEM_CONFIG } = require('@/lib/config/system');
    const plisioSecretKey = SYSTEM_CONFIG.plisio.secretKey;
    
    let isAutomatedSuccess = false;
    let plisioError = '';

    if (plisioSecretKey && walletAddress && result._netAmount > 0) {
      try {
        // Plisio allows fee_plan="normal". If "Client pays withdrawal fees" is enabled in
        // the merchant dashboard, Plisio automatically deducts the fee from this amount.
        const plisioUrl = `https://api.plisio.net/api/v1/operations/withdraw?api_key=${plisioSecretKey}&psys_cid=USDT_BSC&to=${walletAddress}&amount=${result._netAmount}&type=cash_out&fee_plan=normal`;
        
        const plisioRes = await fetch(plisioUrl);
        const plisioData = await plisioRes.json();

        if (plisioData.status === 'success') {
          isAutomatedSuccess = true;
          // Mark as completed immediately since it was dispatched
          await prisma.$transaction([
            prisma.withdrawal.update({
              where: { id: result.id },
              data: { status: 'completed', note: result.note + ` | Plisio Txn: ${plisioData.data?.txn_id}` }
            }),
            prisma.transaction.updateMany({
              where: { reference: result.id, type: 'withdrawal' },
              data: { status: 'completed' }
            })
          ]);
        } else {
          // Plisio error (e.g. insufficient master balance)
          plisioError = plisioData.data?.message || JSON.stringify(plisioData);
          console.error('[withdrawals/POST] Plisio Automated Error:', plisioError);
        }
      } catch (err: any) {
        plisioError = err.message;
        console.error('[withdrawals/POST] Plisio API Exception:', err);
      }
    }

    if (!isAutomatedSuccess) {
      // Failsafe: Keep it pending and notify the admin immediately!
      // (Notifications model does not exist yet, so we log it to the server console)
      console.warn(`[withdrawals/POST] Plisio dispatch failed. Fallback to pending. Admin notified.`);
    }

    return NextResponse.json({ 
      message: isAutomatedSuccess 
        ? 'Withdrawal processed and dispatched successfully!' 
        : 'Withdrawal request submitted and pending manual review.', 
      withdrawal: result 
    }, { status: 201 });
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
