import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ resources });
  } catch (err) {
    console.error('[resources-get]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
