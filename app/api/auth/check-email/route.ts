import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email query parameter is required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true }
    });

    return NextResponse.json({ exists: !!existing }, { status: 200 });
  } catch (err) {
    console.error('[check-email]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
