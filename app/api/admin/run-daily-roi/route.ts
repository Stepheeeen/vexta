import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { runDailyRoiDistribution } from '@/server/services/earnings.service';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit-logger';
import { sendCronReportEmail } from '@/lib/mail';

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
async function handleRun(req: NextRequest) {
  // ─── Auth: accept admin JWT or cron secret (Header or Query param) ────
  const cronSecret = process.env.CRON_SECRET;
  const cronHeader = req.headers.get('x-cron-key');
  const authHeader = req.headers.get('authorization');
  const querySecret = req.nextUrl.searchParams.get('secret');

  const isCronCall = 
    (cronSecret && cronHeader === cronSecret) ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (cronSecret && querySecret === cronSecret);

  try {
    if (!isCronCall) {
      const userPayload = getUserFromRequest(req);
      if (!userPayload || userPayload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    let bypassWeekendCheck = false;
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      bypassWeekendCheck = body.bypassWeekendCheck === true;
    } else {
      bypassWeekendCheck = req.nextUrl.searchParams.get('bypassWeekendCheck') === 'true';
    }

    const result = await runDailyRoiDistribution(bypassWeekendCheck);

    const reportMsg = `Daily ROI payout executed successfully.\nProcessed ${result.usersPaid} active investments.\nTotal Distributed: $${result.totalDistributed.toFixed(2)}`;

    // Log to Admin Audit Logs
    const firstAdmin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (firstAdmin) {
      await logAdminAction(firstAdmin.id, null, 'CRON_DAILY_ROI_SUCCESS', reportMsg);
    }

    // Send Email Report
    await sendCronReportEmail(
      'stepheeeen@icloud.com',
      'Daily ROI Payout',
      'SUCCESS',
      reportMsg
    );

    return NextResponse.json({
      success:         true,
      usersPaid:       result.usersPaid,
      totalDistributed: result.totalDistributed,
    });
  } catch (err: any) {
    console.error('[admin/run-daily-roi]', err);

    const errMsg = err.message || 'Unknown error occurred.';
    const errStack = err.stack || 'No callstack available.';

    // Graceful skip if already run today
    if (err.message === 'Already ran today') {
      if (isCronCall) {
        return NextResponse.json({
          success:         true,
          message:         'Already ran today',
          usersPaid:       0,
          totalDistributed: 0,
        });
      } else {
        return NextResponse.json(
          { error: errMsg },
          { status: 400 }
        );
      }
    }

    // Log to Admin Audit Logs
    const firstAdmin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (firstAdmin) {
      await logAdminAction(firstAdmin.id, null, 'CRON_DAILY_ROI_FAILURE', `Daily ROI failed: ${errMsg}`);
    }

    // Send Email Notification with Logs
    await sendCronReportEmail(
      'stepheeeen@icloud.com',
      'Daily ROI Payout',
      'FAILURE',
      `Daily ROI payout failed to run: ${errMsg}`,
      errStack
    );

    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleRun(req);
}

export async function POST(req: NextRequest) {
  return handleRun(req);
}

