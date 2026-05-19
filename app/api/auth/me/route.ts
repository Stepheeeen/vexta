import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      referralCode: true, isVerified: true, createdAt: true, role: true,
    },
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ user });
}

export async function DELETE() {
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.delete('vexta_token');
  return response;
}

export async function PATCH(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { firstName, lastName } = await req.json();
    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and Last name are required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: { firstName, lastName },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        referralCode: true, isVerified: true, createdAt: true, role: true,
      },
    });

    return NextResponse.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('[auth/me/PATCH]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
