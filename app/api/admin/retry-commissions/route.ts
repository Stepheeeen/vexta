import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { propagateCommissions } from '@/lib/referral-engine';
import { logAdminAction } from '@/lib/audit-logger';
import { sendCronReportEmail } from '@/lib/mail';

/**
 * POST /api/admin/retry-commissions
 *
 * Finds all investments with commissionStatus = 'pending' that are older than
 * 30 minutes (allowing normal in-flight propagation to complete first) and
 * re-runs propagateCommissions for each.
 *
 * Idempotent: Commission records have a unique constraint on (investmentId, level),
 * so re-running will upsert-skip any level already paid and only fill gaps.
 *
 * Auth: Admin only or CRON_SECRET header.
 */
export async function POST(req: NextRequest) {
  // Accept admin JWT or cron secret (Header or Query param)
  const cronSecret = process.env.CRON_SECRET;
  const cronHeader = req.headers.get('x-cron-key');
  const authHeader = req.headers.get('authorization');
  const querySecret = req.nextUrl.searchParams.get('secret');

  const isCronCall = 
    (cronSecret && cronHeader === cronSecret) ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (cronSecret && querySecret === cronSecret);

  if (!isCronCall) {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  try {
    // Find investments stuck in 'pending' commission status for > 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const stuckInvestments = await prisma.investment.findMany({
      where: {
        commissionStatus: 'pending',
        createdAt: { lt: thirtyMinutesAgo },
        // Only real (non-virtual) investments generate commissions
        isVirtual: false,
      } as any,
      select: {
        id: true,
        userId: true,
        amount: true,
        createdAt: true,
        commissionStatus: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`[retry-commissions] Found ${stuckInvestments.length} investment(s) with pending commissions.`);

    const results: { investmentId: string; status: 'retried' | 'failed'; levels: number; error?: string }[] = [];

    for (const inv of stuckInvestments) {
      try {
        const levels = await propagateCommissions(inv.userId, inv.id, inv.amount);

        // Mark as completed
        await prisma.investment.update({
          where: { id: inv.id },
          data:  { commissionStatus: 'completed' } as any,
        });

        console.log(`[retry-commissions] ✅ Investment ${inv.id}: ${levels.length} commission level(s) processed.`);
        results.push({ investmentId: inv.id, status: 'retried', levels: levels.length });
      } catch (err: any) {
        console.error(`[retry-commissions] ❌ Investment ${inv.id} failed:`, err.message);
        results.push({ investmentId: inv.id, status: 'failed', levels: 0, error: err.message });
      }
    }

    const successCount = results.filter(r => r.status === 'retried').length;
    const failedCount  = results.filter(r => r.status === 'failed').length;

    const reportMsg = `Retry Commissions executed.\nFound: ${stuckInvestments.length} stuck investments.\nSuccessfully retried: ${successCount}.\nFailed: ${failedCount}.`;

    // Log to Admin Audit Logs
    const firstAdmin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (firstAdmin) {
      await logAdminAction(firstAdmin.id, null, 'CRON_RETRY_COMMISSIONS_SUCCESS', reportMsg);
    }

    // Send Email Report
    await sendCronReportEmail(
      'stepheeeen@icloud.com',
      'Retry Commissions',
      'SUCCESS',
      reportMsg
    );

    return NextResponse.json({
      success:      true,
      found:        stuckInvestments.length,
      retried:      successCount,
      failed:       failedCount,
      results,
    });
  } catch (err: any) {
    console.error('[admin/retry-commissions]', err);

    const errMsg = err.message || 'Unknown error occurred.';
    const errStack = err.stack || 'No callstack available.';

    // Log to Admin Audit Logs
    const firstAdmin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (firstAdmin) {
      await logAdminAction(firstAdmin.id, null, 'CRON_RETRY_COMMISSIONS_FAILURE', `Retry Commissions failed: ${errMsg}`);
    }

    // Send Email Notification with Logs
    await sendCronReportEmail(
      'stepheeeen@icloud.com',
      'Retry Commissions',
      'FAILURE',
      `Retry Commissions failed to run: ${errMsg}`,
      errStack
    );

    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

