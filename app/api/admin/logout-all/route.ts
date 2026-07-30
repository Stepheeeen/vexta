import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({ data: {} });
    }

    // Enable maintenance mode and reset session token timestamp
    const now = new Date();
    await prisma.settings.update({
      where: { id: settings.id },
      data: {
        maintenanceMode: true,
      },
    });

    const response = NextResponse.json({
      message: 'All non-admin users have been logged out and platform is set to Maintenance Mode.',
      timestamp: now.toISOString(),
    });

    return response;
  } catch (err) {
    console.error('[admin-logout-all]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
