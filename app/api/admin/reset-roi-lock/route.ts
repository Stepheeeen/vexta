import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/reset-roi-lock
 *
 * Emergency endpoint to reset a stuck isRoiRunning = true lock.
 * Use when the daily ROI cron crashes mid-run and the next run is blocked.
 *
 * Auth: Admin only.
 */
export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    const wasRunning = (settings as any).isRoiRunning;

    await (prisma.settings as any).update({
      where: { id: settings.id },
      data: { isRoiRunning: false },
    });

    // Audit log
    await prisma.adminAuditLog.create({
      data: {
        adminId: payload.userId,
        action: 'reset_roi_lock',
        details: `Manually reset isRoiRunning from ${wasRunning} to false. lastDailyRun was: ${settings.lastDailyRun?.toISOString() ?? 'never'}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `ROI lock reset. isRoiRunning was: ${wasRunning}`,
      lastDailyRun: settings.lastDailyRun,
    });
  } catch (err: any) {
    console.error('[admin/reset-roi-lock]', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
