import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, generateReferralCode } from '@/lib/auth';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName:  z.string().min(1, 'Last name is required').max(50),
  email:     z.string().email('Invalid email address'),
  country:   z.string().min(1, 'Country is required'),
  whatsappOrTelegram: z.string().optional(),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, country, whatsappOrTelegram, password, referralCode } = parsed.data;

    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Resolve referrer
    let referredById: string | undefined;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } });
      if (!referrer) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
      }
      referredById = referrer.id;
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        country,
        whatsappOrTelegram,
        passwordHash: await hashPassword(password),
        referralCode: generateReferralCode(firstName, lastName),
        referredById,
        isVerified: false,
        verificationCode,
        verificationCodeExpires,
      },
    });

    // Import sendVerificationEmail dynamically or inline
    const { sendVerificationEmail } = require('@/lib/mail');
    await sendVerificationEmail(email, firstName, verificationCode);

    // Create referral link
    if (referredById) {
      await prisma.referralLink.create({
        data: { referrerId: referredById, referredId: user.id },
      });
    }

    // Sign JWT
    const token = signToken({ userId: user.id, email: user.email, isVerified: false });

    const response = NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          referralCode: user.referralCode,
        },
      },
      { status: 201 }
    );

    response.cookies.set('vexta_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
