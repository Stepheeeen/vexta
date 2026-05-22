import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json({ error: 'Valid 6-digit OTP code is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify code and expiry
    if (!user.verificationCode || user.verificationCode !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (!user.verificationCodeExpires || new Date() > user.verificationCodeExpires) {
      return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    // Relational cleanup before deletion to avoid database constraints
    const userId = user.id;

    // 1. Clear upline associations
    await prisma.user.updateMany({
      where: { uplineId: userId },
      data: { uplineId: null },
    });

    // 2. Delete DailyROI entries connected to investments of this user
    await prisma.dailyROIEntry.deleteMany({
      where: {
        investment: {
          userId: userId,
        },
      },
    });

    // 3. Delete Investments
    await prisma.investment.deleteMany({
      where: { userId: userId },
    });

    // 4. Delete Commissions
    await prisma.commission.deleteMany({
      where: { userId: userId },
    });

    // 5. Delete Transactions
    await prisma.transaction.deleteMany({
      where: { userId: userId },
    });

    // 6. Delete Withdrawals
    await prisma.withdrawal.deleteMany({
      where: { userId: userId },
    });

    // 7. Delete ReferralLinks (where user is either referrer or referred)
    await prisma.referralLink.deleteMany({
      where: {
        OR: [
          { referrerId: userId },
          { referredId: userId },
        ],
      },
    });

    // 8. Finally delete the User record
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear the authentication cookie
    const response = NextResponse.json({ message: 'Account permanently deleted successfully' }, { status: 200 });
    response.cookies.delete('vexta_token');
    return response;
  } catch (err) {
    console.error('[delete-account-verify]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
