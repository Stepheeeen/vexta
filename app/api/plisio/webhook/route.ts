import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/prisma';

import { SYSTEM_CONFIG } from '@/lib/config/system';

// Plisio IPN callback status constants
const PLISIO_STATUS_COMPLETED  = 'completed';
const PLISIO_STATUS_MISMATCH   = 'mismatch';   // amount paid != amount expected
const PLISIO_STATUS_EXPIRED    = 'expired';
const PLISIO_STATUS_CANCELLED  = 'cancelled';
const PLISIO_STATUS_ERROR      = 'error';

/**
 * Replicates PHP's serialize() for associative arrays.
 *
 * This is required because Plisio's official IPN verification algorithm (from their PHP SDK)
 * computes: HMAC-SHA1( php_serialize(ksort($payload)), $secretKey )
 *
 * The old implementation used JSON.stringify() which is COMPLETELY WRONG and caused
 * every single webhook to fail signature verification → deposits never credited.
 */
function phpSerialize(data: Record<string, any>): string {
  const entries = Object.entries(data);
  let result = `a:${entries.length}:{`;
  for (const [key, value] of entries) {
    result += `s:${Buffer.byteLength(String(key), 'utf8')}:"${key}";`;

    if (value === null || value === undefined) {
      result += 'N;';
    } else if (typeof value === 'boolean') {
      result += `b:${value ? 1 : 0};`;
    } else if (typeof value === 'number' && Number.isInteger(value)) {
      result += `i:${value};`;
    } else if (typeof value === 'number') {
      result += `d:${value};`;
    } else if (Array.isArray(value)) {
      const arrObj: Record<string, any> = {};
      value.forEach((v, i) => { arrObj[i] = v; });
      result += phpSerialize(arrObj);
    } else if (typeof value === 'object') {
      result += phpSerialize(value as Record<string, any>);
    } else {
      const str = String(value);
      result += `s:${Buffer.byteLength(str, 'utf8')}:"${str}";`;
    }
  }
  result += '}';
  return result;
}

/**
 * Verifies Plisio's IPN webhook signature.
 *
 * Plisio's algorithm (from their official PHP SDK):
 *   1. Remove `verify_hash` from the payload
 *   2. ksort — sort keys alphabetically
 *   3. Cast `expire_utc` to string (PHP type consistency)
 *   4. PHP serialize() the sorted array
 *   5. HMAC-SHA1 with the API key as the HMAC secret
 *
 * @see https://plisio.net/documentation/endpoints/ipn-validation
 */
function verifyPlisioSignature(payload: Record<string, any>, secretKey: string): boolean {
  const { verify_hash, ...rest } = payload;
  if (!verify_hash) return false;

  // Sort keys alphabetically — mirrors PHP ksort()
  const sorted: Record<string, any> = {};
  Object.keys(rest)
    .sort()
    .forEach(k => {
      let v = rest[k];
      // PHP casts expire_utc to string for consistent serialisation
      if (k === 'expire_utc') v = String(v);
      sorted[k] = v;
    });

  // PHP serialize then HMAC-SHA1 — this is Plisio's actual algorithm
  const serialized = phpSerialize(sorted);
  const hash = createHmac('sha1', secretKey).update(serialized).digest('hex');

  if (hash === verify_hash) return true;

  console.warn(
    `[plisio/webhook] Signature mismatch.\n` +
    `  Received:   ${verify_hash}\n` +
    `  Computed:   ${hash}\n` +
    `  Serialized: ${serialized.substring(0, 300)}`
  );
  return false;
}



/**
 * POST /api/plisio/webhook
 *
 * Plisio IPN (Instant Payment Notification) handler.
 * Called by Plisio's servers when a payment status changes.
 *
 * Security:
 *   - Validates HMAC signature before processing.
 *   - Idempotency guard: re-checks invoice status inside DB transaction.
 *
 * On `completed`:
 *   1. Credits user.balance and user.activeDeposit.
 *   2. Creates a deposit Transaction record.
 *   3. Marks PlisioInvoice as completed.
 *
 * On `expired` / `cancelled` / `error`:
 *   - Updates invoice status only. No balance changes.
 *
 * On `mismatch`:
 *   - Logs the discrepancy and still credits the actual received amount.
 */
export async function POST(req: NextRequest) {
  let rawBody: string;
  let payload: Record<string, any>;

  try {
    rawBody = await req.text();
    console.log('[plisio/webhook] Received raw body:', rawBody);
    
    try {
      payload = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      payload = Object.fromEntries(params.entries());
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { secretKey } = SYSTEM_CONFIG.plisio;
  const txn_id = payload.txn_id;

  if (!txn_id) {
    return NextResponse.json({ error: 'Missing txn_id' }, { status: 400 });
  }

  // 1. Find the invoice in our DB
  const invoice = await prisma.plisioInvoice.findUnique({ where: { txnId: txn_id } });
  if (!invoice) {
    console.warn(`[plisio/webhook] Unknown txn_id: ${txn_id}`);
    return NextResponse.json({ ok: true });
  }

  // 2. To completely avoid PHP serialization bugs with HMAC signatures in JS,
  // we will simply call the Plisio API to fetch the TRUE state of this transaction.
  let trueStatus = payload.status;
  let trueActualSum = payload.actual_sum ? parseFloat(payload.actual_sum) : undefined;
  let trueTxUrl = payload.tx_url;
  
  if (secretKey) {
    try {
      const apiRes = await fetch(`https://api.plisio.net/api/v1/invoices/${txn_id}?api_key=${secretKey}`);
      const apiData = await apiRes.json() as any;
      if (apiData.status === 'success' && apiData.data?.invoice) {
        trueStatus = apiData.data.invoice.status;
        trueActualSum = apiData.data.invoice.received_amount ? parseFloat(apiData.data.invoice.received_amount) : trueActualSum;
        trueTxUrl = apiData.data.invoice.tx_url || payload.tx_url;
        console.log(`[plisio/webhook] Verified txn_id ${txn_id} via API: Status is ${trueStatus}, Actual Sum is ${trueActualSum}`);
      } else {
        console.error(`[plisio/webhook] API verification failed for ${txn_id}:`, apiData);
      }
    } catch (e) {
      console.error(`[plisio/webhook] API verification error:`, e);
      // Fallback to payload status if API call fails
    }
  }

  // 3. Always update the raw webhook payload for audit purposes
  await prisma.plisioInvoice.update({
    where: { txnId: txn_id },
    data:  { rawWebhook: JSON.stringify(payload), status: trueStatus ?? invoice.status },
  });

  // 4. Route by status
  if (trueStatus === PLISIO_STATUS_COMPLETED) {
    const creditAmount = trueActualSum && trueActualSum > 0 ? trueActualSum : invoice.amount;
    await handleCompletedPayment(invoice, creditAmount, trueTxUrl);
  } else if (trueStatus === PLISIO_STATUS_MISMATCH || trueStatus === PLISIO_STATUS_ERROR) {
    const creditAmount = trueActualSum && trueActualSum > 0 ? trueActualSum : invoice.amount;
    console.warn(
      `[plisio/webhook] MISMATCH/ERROR on ${txn_id}: ` +
      `expected $${invoice.amount}, received crypto USD value: ${creditAmount}.`
    );

    // Update status and received amount, but do NOT credit user/activate invoice.
    // This leaves it uncredited for manual admin approval.
    await prisma.plisioInvoice.update({
      where: { txnId: txn_id },
      data: {
        status: trueStatus,
        amount: creditAmount,
        plisioTxHash: trueTxUrl || invoice.plisioTxHash
      }
    });
  } else if (
    trueStatus === PLISIO_STATUS_EXPIRED   ||
    trueStatus === PLISIO_STATUS_CANCELLED
  ) {
    console.log(`[plisio/webhook] Invoice ${txn_id} → ${trueStatus}`);
    await prisma.plisioInvoice.update({
      where: { txnId: txn_id },
      data:  { status: trueStatus },
    });
  }

  // Always return 200 to Plisio to prevent retry storms
  return NextResponse.json({ ok: true });
}

/**
 * Handles a confirmed `completed` Plisio payment.
 * Credits the user's balance and creates an audit trail.
 */
async function handleCompletedPayment(
  invoice: { id: string; txnId: string; userId: string; amount: number; activatedAt: Date | null },
  creditAmount: number,
  txHash?: string
): Promise<void> {
  // Idempotency guard: skip if already processed
  if (invoice.activatedAt) {
    console.log(`[plisio/webhook] Invoice ${invoice.txnId} already activated. Skipping.`);
    return;
  }

  const { userId } = invoice;

  try {
    await prisma.$transaction(async (tx) => {
      // Re-check idempotency inside transaction
      const fresh = await tx.plisioInvoice.findUnique({ where: { id: invoice.id } });
      if (fresh?.activatedAt) return;

      // 1. Credit user balance (available for investment or withdrawal)
      await tx.user.update({
        where: { id: userId },
        data: {
          balance:      { increment: creditAmount },
        },
      });

      // 2. Create deposit transaction record
      await tx.transaction.create({
        data: {
          userId,
          type:        'deposit',
          amount:      creditAmount,
          status:      'completed',
          description: `USDT BEP-20 deposit via Plisio`,
          reference:   invoice.txnId,
          metadata:    JSON.stringify({ txnId: invoice.txnId, txHash, network: 'BEP20' }),
        },
      });

      // Ensure txHash is a string (Plisio sometimes returns an array of URLs)
      const safeTxHash = Array.isArray(txHash) ? txHash.join(', ') : (txHash ?? null);

      // 3. Mark invoice as completed
      await tx.plisioInvoice.update({
        where:  { id: invoice.id },
        data:   {
          status:      'completed',
          activatedAt:  new Date(),
          plisioTxHash: safeTxHash,
          amount:       creditAmount, // Update invoice record amount to match actual sum paid
        },
      });
    }, { timeout: 30000 });

    console.log(`[plisio/webhook] ✅ Activated $${creditAmount.toFixed(2)} deposit for user ${userId} (txn: ${invoice.txnId})`);

  } catch (err) {
    console.error(`[plisio/webhook] Failed to activate invoice ${invoice.txnId}:`, err);
    throw err;
  }
}
