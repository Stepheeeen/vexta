import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { runDailyRoiDistribution } from '@/server/services/earnings.service';

/**
 * POST /api/admin/run-daily-roi
 *
 * Runs the daily ROI distribution:
 *   Generates today's 1% returns on current activeCapital.
 *
 * Can be called by:
 *   - Vercel Cron (configured in vercel.json, Mon–Fri 09:00 UTC)
 *   - Admin manually via the admin dashboard
 *
 * Auth: Requires either a valid admin JWT token OR the CRON_SECRET header.
 */
export async function POST(req: NextRequest) {
  try {
    // ─── Auth: accept admin JWT or cron secret header ─────────────────────
    const cronSecret = process.env.CRON_SECRET;
    const cronHeader = req.headers.get('x-cron-key');
    const isCronCall = cronSecret && cronHeader === cronSecret;

    if (!isCronCall) {
      const userPayload = getUserFromRequest(req);
      if (!userPayload || userPayload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const bypassWeekendCheck = body.bypassWeekendCheck === true;

    const result = await runDailyRoiDistribution(bypassWeekendCheck);

    return NextResponse.json({
      success:         true,
      usersPaid:       result.usersPaid,
      totalDistributed: result.totalDistributed,
    });
  } catch (err: any) {
    console.error('[admin/run-daily-roi]', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: err.message === 'Already ran today' ? 400 : 500 }
    );
  }
}
