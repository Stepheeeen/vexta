import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/mail';

const schema = z.object({
  email: z.string().email('Invalid email address').transform(val => val.trim().toLowerCase()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' }
        }
      });
    }

    // Generate reset code if user exists
    if (user && user.isActive !== false) {
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordCode: resetCode,
          resetPasswordExpires: resetExpires,
        },
      });

      const emailSent = await sendPasswordResetEmail(user.email, user.firstName, resetCode);
      if (!emailSent) {
        console.error(`[forgot-password] Failed to deliver password reset email to ${user.email}`);
      } else {
        console.log(`[forgot-password] Password reset code sent successfully to ${user.email}`);
      }
    } else {
      console.warn(`[forgot-password] User not found or inactive for email: ${email}`);
    }

    // Always return generic success message to prevent user enumeration
    return NextResponse.json({
      message: 'If an account exists with that email, a password reset code has been sent.',
    });
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
