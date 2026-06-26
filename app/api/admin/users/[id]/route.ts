import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit-logger';

// Helper to get recursive network stats
async function getNetworkStats(userId: string) {
  let totalNetworkSize = 0;
  let totalNetworkVolume = 0;
  let totalNetworkProfits = 0;
  
  // Get direct referrals
  const directLinks = await prisma.referralLink.findMany({
    where: { referrerId: userId },
    select: { referredId: true },
  });
  
  const directReferralsCount = directLinks.length;
  
  // We need to traverse downline
  let currentLevelIds = directLinks.map(l => l.referredId);
  const allNetworkIds: string[] = [];
  
  while (currentLevelIds.length > 0) {
    totalNetworkSize += currentLevelIds.length;
    allNetworkIds.push(...currentLevelIds);
    
    const nextLinks = await prisma.referralLink.findMany({
      where: { referrerId: { in: currentLevelIds } },
      select: { referredId: true },
    });
    currentLevelIds = nextLinks.map(l => l.referredId);
  }
  
  if (allNetworkIds.length > 0) {
    const networkUsers = await prisma.user.findMany({
      where: { id: { in: allNetworkIds } },
      select: { totalEarned: true },
    });
    totalNetworkProfits = networkUsers.reduce((sum, u) => sum + u.totalEarned, 0);
    
    const networkDeposits = await prisma.transaction.aggregate({
      where: { 
        userId: { in: allNetworkIds },
        type: 'deposit',
        status: 'completed',
        isVirtual: false
      },
      _sum: { amount: true }
    });
    totalNetworkVolume = networkDeposits._sum.amount ?? 0;
  }

  return {
    directReferralsCount,
    totalNetworkSize,
    totalNetworkVolume,
    totalNetworkProfits
  };
}

// GET user details and network stats
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = getUserFromRequest(req);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const totalPersonalDepositsAgg = await prisma.transaction.aggregate({
      where: { userId: user.id, type: 'deposit', status: 'completed', isVirtual: false },
      _sum: { amount: true }
    });
    const totalPersonalDeposits = totalPersonalDepositsAgg._sum.amount ?? 0;
    
    const totalWithdrawnAgg = await prisma.withdrawal.aggregate({
      where: { userId: user.id, status: 'approved' },
      _sum: { amount: true }
    });
    const totalWithdrawn = totalWithdrawnAgg._sum.amount ?? 0;

    const networkStats = await getNetworkStats(user.id);

    const completedVirtualInv = await prisma.investment.findFirst({
      where: { userId: user.id, isVirtual: true, status: 'completed' }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        status: user.isActive ? 'Active' : 'Suspended',
        country: user.country,
        joinedAt: user.createdAt,
        balance: user.balance,
        totalEarned: user.totalEarned,
        withdrawalsBlocked: (user as any).withdrawalsBlocked,
        totalPersonalDeposits,
        sponsoredGiftedAmount: user.sponsoredGiftedAmount,
        totalWithdrawn,
        operationalCapital: user.operationalCapital,
        isSponsored: user.isSponsored,
        withdrawalUnlockType: (user as any).withdrawalUnlockType,
        withdrawalUnlockAmount: (user as any).withdrawalUnlockAmount,
        hasCompletedPromo: !!completedVirtualInv,
        fundsFrozen: user.fundsFrozen,
        isVerified: user.isVerified,
        isActive: user.isActive,
        otpAttempts: user.otpAttempts,
        otpLockedUntil: user.otpLockedUntil,
      },
      networkStats
    });
  } catch (error) {
    console.error('[AdminUserDetails]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST admin actions
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;
  const payload = getUserFromRequest(req);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { action, value, reason } = await req.json();
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (action === 'toggle-withdrawals') {
      const currentBlocked = (user as any).withdrawalsBlocked;
      await prisma.user.update({
        where: { id: userId },
        data: { withdrawalsBlocked: !currentBlocked }
      });
      await logAdminAction(payload.userId, userId, currentBlocked ? 'UNBLOCK_WITHDRAWALS' : 'BLOCK_WITHDRAWALS', reason || 'Toggled withdrawal block state');
      return NextResponse.json({ success: true, blocked: !currentBlocked });
    }
    
    if (action === 'adjust-balance') {
      const amount = Number(value);
      if (isNaN(amount)) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      
      await prisma.user.update({
        where: { id: userId },
        data: { balance: amount }
      });
      
      await logAdminAction(payload.userId, userId, 'MANUAL_BALANCE_ADJUST', `Changed balance from ${user.balance} to ${amount}. Reason: ${reason}`);
      return NextResponse.json({ success: true, balance: amount });
    }
    
    if (action === 'reset-profits') {
      await prisma.user.update({
        where: { id: userId },
        data: { totalEarned: 0 }
      });
      await logAdminAction(payload.userId, userId, 'MANUAL_PROFIT_RESET', `Reset totalEarned to 0. Reason: ${reason}`);
      return NextResponse.json({ success: true });
    }

    if (action === 'release-support') {
      await prisma.user.update({
        where: { id: userId },
        data: { isSponsored: false, sponsoredGiftedAmount: 0 }
      });
      await logAdminAction(payload.userId, userId, 'MANUAL_SUPPORT_RELEASE', `Released support account status. Reason: ${reason}`);
      return NextResponse.json({ success: true });
    }

    if (action === 'change-email') {
      const email = value;
      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
      }
      const existing = await prisma.user.findFirst({ where: { email } });
      if (existing && existing.id !== userId) {
        return NextResponse.json({ error: 'Email already in use by another account' }, { status: 400 });
      }
      const oldEmail = user.email;
      await prisma.user.update({
        where: { id: userId },
        data: { email }
      });
      await logAdminAction(payload.userId, userId, 'ADMIN_CHANGE_EMAIL', `Changed email from ${oldEmail} to ${email}. Reason: ${reason}`);
      return NextResponse.json({ success: true, email });
    }

    if (action === 'set-temp-password') {
      const password = value;
      if (!password || password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      const { hashPassword } = require('@/lib/auth');
      const passwordHash = await hashPassword(password);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash }
      });
      await logAdminAction(payload.userId, userId, 'ADMIN_SET_TEMP_PASSWORD', `Set temporary password. Reason: ${reason}`);
      return NextResponse.json({ success: true });
    }

    if (action === 'set-withdrawal-unlock') {
      const { type, amount } = value;
      if (!['none', 'full', 'amount', 'permanent'].includes(type)) {
        return NextResponse.json({ error: 'Invalid unlock type' }, { status: 400 });
      }
      const unlockAmount = type === 'amount' ? Number(amount) : 0;
      if (type === 'amount' && (isNaN(unlockAmount) || unlockAmount <= 0)) {
        return NextResponse.json({ error: 'Invalid custom unlock amount' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          withdrawalUnlockType: type,
          withdrawalUnlockAmount: unlockAmount
        }
      });
      await logAdminAction(payload.userId, userId, 'ADMIN_SET_WITHDRAWAL_UNLOCK', `Set withdrawal unlock to type=${type}, amount=${unlockAmount}. Reason: ${reason}`);
      return NextResponse.json({ success: true });
    }

    if (action === 'reactivate-promotion') {
      const completedVirtualInv = await prisma.investment.findFirst({
        where: { userId, isVirtual: true, status: 'completed' },
        orderBy: { createdAt: 'desc' }
      });

      if (!completedVirtualInv) {
        return NextResponse.json({ error: 'No completed promotional investment found' }, { status: 400 });
      }

      const settings = await prisma.settings.findFirst();
      const duration = settings?.promoDuration ?? 40;
      const amount = completedVirtualInv.amount;
      const tierBonus = 0;
      const activeCapital = +(amount + tierBonus).toFixed(2);
      const maxPayout = +(amount * 2).toFixed(2);

      const startDate = new Date();
      const { addBusinessDays } = require('@/lib/roi-engine');
      const endDate = addBusinessDays(startDate, duration);

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            isSponsored: true,
            sponsoredGiftedAmount: amount,
            activeDeposit: amount,
            roiBlocked: false,
            operationalCapital: { increment: activeCapital }
          }
        });

        await tx.investment.update({
          where: { id: completedVirtualInv.id },
          data: {
            status: 'active',
            businessDaysElapsed: 0,
            totalEarned: 0,
            activeCapital,
            maxPayout,
            startDate,
            endDate,
            duration,
          }
        });

        await tx.transaction.create({
          data: {
            userId,
            type: 'deposit',
            amount,
            status: 'completed',
            description: `Reactivated promotional package (Virtual)`,
            reference: completedVirtualInv.id,
            isVirtual: true
          }
        });
      });

      await logAdminAction(payload.userId, userId, 'ADMIN_REACTIVATE_PROMOTION', `Reactivated promotion. Reason: ${reason}`);
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle-status') {
      const currentActive = user.isActive;
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: !currentActive }
      });
      await logAdminAction(payload.userId, userId, currentActive ? 'SUSPEND_USER' : 'ACTIVATE_USER', reason || 'Toggled user active status');
      return NextResponse.json({ success: true, isActive: !currentActive });
    }

    if (action === 'toggle-freeze-funds') {
      const currentFrozen = user.fundsFrozen;
      await prisma.user.update({
        where: { id: userId },
        data: { fundsFrozen: !currentFrozen }
      });
      await logAdminAction(payload.userId, userId, currentFrozen ? 'UNFREEZE_FUNDS' : 'FREEZE_FUNDS', reason || 'Toggled funds freeze status');
      return NextResponse.json({ success: true, fundsFrozen: !currentFrozen });
    }

    if (action === 'reset-otp-lock') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          otpAttempts: 0,
          otpLockedUntil: null
        }
      });
      await logAdminAction(payload.userId, userId, 'RESET_OTP_LOCKOUT', reason || 'Reset OTP attempts and lockout timer');
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle-verified') {
      const currentVerified = user.isVerified;
      await prisma.user.update({
        where: { id: userId },
        data: { isVerified: !currentVerified }
      });
      await logAdminAction(payload.userId, userId, currentVerified ? 'UNVERIFY_USER' : 'VERIFY_USER', reason || 'Toggled user verification status');
      return NextResponse.json({ success: true, isVerified: !currentVerified });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[AdminUserAction]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
