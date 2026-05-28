import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendBatchPayoutOTPEmail } from '@/lib/mail';

/**
 * POST /api/admin/batch-payout/send-otp
 *
 * Generates a 6-digit OTP and emails it to the requesting admin.
 * Must be called before /api/admin/batch-payout (execute action).
 */
export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch pending withdrawal totals for the email context
  const pending = await prisma.withdrawal.aggregate({
    where:  { status: 'pending' },
    _count: { id: true },
    _sum:   { amount: true },
  });

  const totalAmount     = pending._sum.amount ?? 0;
  const withdrawalCount = pending._count.id ?? 0;

  if (withdrawalCount === 0) {
    return NextResponse.json({ error: 'No pending withdrawals' }, { status: 400 });
  }

  // Generate 6-digit OTP
  const otp     = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Fetch admin user details
  const admin = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { firstName: true, email: true },
  });
  if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

  // Store OTP on admin user record
  await prisma.user.update({
    where: { id: payload.userId },
    data:  { verificationCode: otp, verificationCodeExpires: expires },
  });

  // Send OTP email
  await sendBatchPayoutOTPEmail(
    admin.email,
    admin.firstName,
    otp,
    totalAmount,
    withdrawalCount
  );

  return NextResponse.json({
    message: `OTP sent to ${admin.email}. Valid for 15 minutes.`,
    // In development, log the OTP to console (handled in sendBatchPayoutOTPEmail)
  });
}
