import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { propagateCommissions } from '@/lib/referral-engine';

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
  // Accept admin JWT or cron secret
  const cronSecret = process.env.CRON_SECRET;
  const cronHeader = req.headers.get('x-cron-key');
  const isCronCall = cronSecret && cronHeader === cronSecret;

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

    return NextResponse.json({
      success:      true,
      found:        stuckInvestments.length,
      retried:      successCount,
      failed:       failedCount,
      results,
    });
  } catch (err: any) {
    console.error('[admin/retry-commissions]', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
