import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { runDailyRoiDistribution } from '@/server/services/earnings.service';
import { promotePendingProfits } from '@/lib/roi-engine';

/**
 * POST /api/admin/run-daily-roi
 *
 * Runs the two-phase daily ROI distribution:
 *   Phase A — Promotes matured pending profit entries into activeCapital.
 *   Phase B — Generates today's 1% returns on current activeCapital.
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
      promoted:        result.promoted,
      amountPromoted:  result.amountPromoted,
    });
  } catch (err: any) {
    console.error('[admin/run-daily-roi]', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: err.message === 'Already ran today' ? 400 : 500 }
    );
  }
}

/**
 * POST /api/admin/run-daily-roi?phase=a
 *
 * Run ONLY Phase A (promote pending profits) independently.
 * Useful for testing or emergency promotion without generating new returns.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const cronHeader = req.headers.get('x-cron-key');
  const isCronCall = cronSecret && cronHeader === cronSecret;

  if (!isCronCall) {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get('phase') === 'a') {
    const result = await promotePendingProfits();
    return NextResponse.json({ success: true, ...result });
  }

  return NextResponse.json({ error: 'Specify ?phase=a for Phase A only' }, { status: 400 });
}
