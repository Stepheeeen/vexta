import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SYSTEM_CONFIG } from '@/lib/config/system';
import { sendCronReportEmail } from '@/lib/mail';

/**
 * GET /api/plisio/cron-sync
 *
 * Plisio Deposit Safety Net — Vercel Cron Job (runs every 5 minutes)
 *
 * Problem it solves:
 *   Plisio sends a webhook (IPN) when a payment is completed. Very occasionally,
 *   that webhook gets lost in transit (network error, Plisio retry failure, etc.).
 *   When that happens the invoice stays stuck in "pending" and the user never sees
 *   their deposit — even though the funds arrived in our wallet.
 *
 * How it works:
 *   1. Finds every PlisioInvoice that has been "pending" for > 5 minutes
 *      (we give the webhook a fair chance to arrive on its own first).
 *   2. For each such invoice, queries the Plisio API directly to get the TRUE status.
 *   3. If Plisio says "completed", credits the user and closes the invoice using the
 *      same idempotent logic as the webhook handler.
 *   4. If Plisio says "expired" / "cancelled" / "error", marks the invoice accordingly.
 *   5. If Plisio says still "pending" / "new", leaves it alone for the next cycle.
 *
 * Security:
 *   Vercel Cron requests include an Authorization: Bearer <CRON_SECRET> header.
 *   We validate this before doing any work.
 */
export async function GET(req: NextRequest) {
  // ── Security: validate secret via Header or Query Parameter ───────────────
  const authHeader = req.headers.get('authorization');
  const querySecret = req.nextUrl.searchParams.get('secret');
  
  const cronSecret = process.env.CRON_SECRET;

  const isAuthorized = 
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (cronSecret && querySecret === cronSecret);

  if (!isAuthorized) {
    console.warn('[plisio/cron-sync] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { secretKey } = SYSTEM_CONFIG.plisio;

    if (!secretKey) {
      console.error('[plisio/cron-sync] PLISIO_SECRET_KEY is not configured.');
      return NextResponse.json({ error: 'Gateway not configured' }, { status: 503 });
    }

    // ── Check Plisio Master Wallet Balance ──────────────────────────────────────
    let walletBalance = -1;
    try {
      const balanceRes = await fetch(
        `https://api.plisio.net/api/v1/balances/USDT_BSC?api_key=${secretKey}`
      );
      const balanceData = await balanceRes.json();
      if (balanceData.status === 'success' && balanceData.data?.balance) {
        walletBalance = parseFloat(balanceData.data.balance);
        console.log(`[plisio/cron-sync] Plisio master wallet balance: ${walletBalance} USDT`);
        
        // Alert if balance is low (e.g. less than 100 USDT)
        if (walletBalance < 100.00) {
          console.warn(`[plisio/cron-sync] ⚠️ LOW BALANCE WARNING: Master wallet has only ${walletBalance} USDT left.`);
          await sendCronReportEmail(
            'stepheeeen@icloud.com',
            'Plisio Wallet Balance Alert',
            'FAILURE',
            `⚠️ WARNING: Your Plisio Master Wallet balance is running low!\n\nCurrent Balance: ${walletBalance.toFixed(2)} USDT\n\nPlease fund the wallet immediately to prevent automated withdrawal failures.`
          ).catch((e) => console.error('[plisio/cron-sync] Failed to send balance alert email:', e));
        }
      }
    } catch (balanceErr) {
      console.error('[plisio/cron-sync] Failed to query Plisio wallet balance:', balanceErr);
    }

    // ── Find invoices that have been pending/cancelled/expired long enough ──────
    // Grace period: 5 minutes. Gives the real-time webhook a chance to land first.
    // Limit to the last 7 days to avoid scanning infinite history.
    const gracePeriodMs = 5 * 60 * 1000;
    const cutoff = new Date(Date.now() - gracePeriodMs);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const stalePendingInvoices = await prisma.plisioInvoice.findMany({
      where: {
        status:    { in: ['pending', 'cancelled', 'expired'] },
        activatedAt: null,
        createdAt: { gte: sevenDaysAgo, lte: cutoff },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (stalePendingInvoices.length === 0) {
      console.log('[plisio/cron-sync] No stale pending/cancelled/expired invoices. All clear ✅');
      return NextResponse.json({ ok: true, processed: 0 });
    }

    console.log(`[plisio/cron-sync] Found ${stalePendingInvoices.length} stale pending/cancelled/expired invoice(s). Verifying with Plisio API...`);

    const results = { credited: 0, closed: 0, stillPending: 0, errors: 0 };

    for (const invoice of stalePendingInvoices) {
      try {
        // Query Plisio API for the true status of this invoice
        const apiRes = await fetch(
          `https://api.plisio.net/api/v1/operations/${invoice.txnId}?api_key=${secretKey}`
        );
        const apiData = await apiRes.json() as any;

        if (apiData.status !== 'success' || !apiData.data) {
          console.error(`[plisio/cron-sync] Plisio API error for ${invoice.txnId}:`, apiData);
          results.errors++;
          continue;
        }

        const { status: plisioStatus, actual_sum: plisioActualSum, tx_url: txUrl } = apiData.data;

        console.log(`[plisio/cron-sync] Invoice ${invoice.txnId} — Plisio status: ${plisioStatus}`);

        if (plisioStatus === 'completed' || plisioStatus === 'mismatch') {
          // ── Payment confirmed: credit the user ────────────────────────────
          const creditAmount = plisioActualSum ? parseFloat(plisioActualSum) : invoice.amount;
          await handleCompletedPayment(invoice, creditAmount, txUrl);
          results.credited++;
          console.log(`[plisio/cron-sync] ✅ Auto-recovered $${creditAmount} for user ${invoice.userId} (${invoice.txnId})`);

        } else if (['expired', 'cancelled', 'error'].includes(plisioStatus)) {
          // ── Terminal failure: close the invoice in our DB (if status changed) ──
          if (invoice.status !== plisioStatus) {
            await prisma.plisioInvoice.update({
              where: { id: invoice.id },
              data:  { status: plisioStatus },
            });
            results.closed++;
            console.log(`[plisio/cron-sync] ❌ Closed invoice ${invoice.txnId} with status: ${plisioStatus}`);
          } else {
            results.stillPending++;
          }

        } else {
          // ── Still pending/new — leave it for the next cycle ───────────────
          results.stillPending++;
        }

      } catch (err) {
        console.error(`[plisio/cron-sync] Error processing invoice ${invoice.txnId}:`, err);
        results.errors++;
      }
    }

    console.log('[plisio/cron-sync] Sweep complete.', results);

    const reportMsg = `Plisio Cron Sync executed.\nCredited: ${results.credited} invoice(s).\nClosed: ${results.closed} invoice(s).\nStill Pending: ${results.stillPending} invoice(s).\nErrors: ${results.errors}.`;

    // Log to Admin Audit Logs
    const firstAdmin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (firstAdmin) {
      await prisma.adminAuditLog.create({
        data: {
          adminId: firstAdmin.id,
          action: 'CRON_PLISIO_SYNC_SUCCESS',
          details: reportMsg,
        }
      });
    }

    // Send Email Report
    await sendCronReportEmail(
      'stepheeeen@icloud.com',
      'Plisio Cron Sync',
      'SUCCESS',
      reportMsg
    );

    return NextResponse.json({ ok: true, ...results });
  } catch (err: any) {
    console.error('[plisio/cron-sync]', err);

    const errMsg = err.message || 'Unknown error occurred.';
    const errStack = err.stack || 'No callstack available.';

    // Log to Admin Audit Logs
    const firstAdmin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (firstAdmin) {
      await prisma.adminAuditLog.create({
        data: {
          adminId: firstAdmin.id,
          action: 'CRON_PLISIO_SYNC_FAILURE',
          details: `Plisio Cron Sync failed: ${errMsg}`,
        }
      });
    }

    // Send Email Notification with Logs
    await sendCronReportEmail(
      'stepheeeen@icloud.com',
      'Plisio Cron Sync',
      'FAILURE',
      `Plisio Cron Sync failed to run: ${errMsg}`,
      errStack
    );

    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

/**
 * Credits a user for a completed Plisio invoice.
 * Idempotent: safe to call multiple times — re-checks activatedAt inside the transaction.
 * Mirrors the exact same logic as the webhook handler.
 */
async function handleCompletedPayment(
  invoice: { id: string; txnId: string; userId: string; amount: number; activatedAt: Date | null },
  creditAmount: number,
  txHash?: string | string[]
): Promise<void> {
  // Early idempotency guard (pre-transaction check)
  if (invoice.activatedAt) {
    console.log(`[plisio/cron-sync] Invoice ${invoice.txnId} already activated. Skipping.`);
    return;
  }

  const { userId } = invoice;

  await prisma.$transaction(async (tx) => {
    // Re-check inside the transaction to prevent race conditions
    const fresh = await tx.plisioInvoice.findUnique({ where: { id: invoice.id } });
    if (fresh?.activatedAt) {
      console.log(`[plisio/cron-sync] Invoice ${invoice.txnId} was activated by another process. Skipping.`);
      return;
    }

    // 1. Credit the user's balance
    await tx.user.update({
      where: { id: userId },
      data: {
        balance:       { increment: creditAmount },
      },
    });

    // 2. Create an audit-trail transaction record
    const safeTxHash = Array.isArray(txHash) ? txHash.join(', ') : (txHash ?? null);
    await tx.transaction.create({
      data: {
        userId,
        type:        'deposit',
        amount:      creditAmount,
        status:      'completed',
        description: 'USDT BEP-20 deposit via Plisio (auto-recovered)',
        reference:   invoice.txnId,
        metadata:    JSON.stringify({ txnId: invoice.txnId, txHash: safeTxHash, network: 'BEP20', source: 'cron_sync' }),
      },
    });

    // 3. Mark the invoice as activated
    await tx.plisioInvoice.update({
      where: { id: invoice.id },
      data:  {
        status:       'completed',
        activatedAt:  new Date(),
        plisioTxHash: safeTxHash,
        amount:       creditAmount,
      },
    });
  }, { timeout: 30000, maxWait: 15000 });
}
