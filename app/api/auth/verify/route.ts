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
      return NextResponse.json({ error: 'Invalid verification code format' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Email already verified' }, { status: 200 });
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      return NextResponse.json({ error: 'Incorrect verification code' }, { status: 400 });
    }

    if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 });
    }

    // Mark as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    const { signToken } = require('@/lib/auth');
    const token = signToken({
      userId: user.id,
      email: user.email,
      isVerified: true,
      role: user.role,
    });

    const response = NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
    
    response.cookies.set('vexta_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[verify-email]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
