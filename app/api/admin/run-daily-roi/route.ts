import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { runDailyRoiDistribution } from '@/server/services/earnings.service';

export async function POST(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const bypassWeekendCheck = body.bypassWeekendCheck === true;

    const result = await runDailyRoiDistribution(bypassWeekendCheck);
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    console.error('[admin/run-daily-roi]', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: err.message === 'Already ran today' ? 400 : 500 }
    );
  }
}
