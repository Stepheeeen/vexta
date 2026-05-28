import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { distributeUnilevelCommission } from '@/server/services/commission.service';
import { SYSTEM_CONFIG } from '@/lib/config/system';

// Plisio IPN callback status constants
const PLISIO_STATUS_COMPLETED  = 'completed';
const PLISIO_STATUS_MISMATCH   = 'mismatch';   // amount paid != amount expected
const PLISIO_STATUS_EXPIRED    = 'expired';
const PLISIO_STATUS_CANCELLED  = 'cancelled';
const PLISIO_STATUS_ERROR      = 'error';

/**
 * Verifies Plisio's webhook signature.
 *
 * Plisio sends a `verify_hash` field in the POST body.
 * To verify: remove `verify_hash` from the payload, sort remaining keys
 * alphabetically, serialize to JSON, append the secret key, then SHA1 hash.
 *
 * @see https://plisio.net/documentation/endpoints/ipn-validation
 */
function verifyPlisioSignature(payload: Record<string, any>, secretKey: string): boolean {
  const { verify_hash, ...rest } = payload;
  if (!verify_hash) return false;

  // Sort keys alphabetically and rebuild object
  const sorted: Record<string, any> = {};
  Object.keys(rest)
    .sort()
    .forEach(k => { sorted[k] = rest[k]; });

  const hash = createHash('sha1')
    .update(JSON.stringify(sorted) + secretKey)
    .digest('hex');

  return hash === verify_hash;
}

/**
 * Calculates the instant tier bonus for a deposit amount.
 * Mirrors the logic in /api/investments/route.ts.
 */
function computeTierBonus(amount: number, planBonus: number): number {
  return +(amount * planBonus).toFixed(2);
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
 *   1. Credits user.balance and user.operationalCapital.
 *   2. Creates a deposit Transaction record.
 *   3. Distributes unilevel commissions.
 *   4. Marks PlisioInvoice as completed.
 *
 * On `expired` / `cancelled` / `error`:
 *   - Updates invoice status only. No balance changes.
 *
 * On `mismatch`:
 *   - Logs the discrepancy. Admin should review manually.
 *   - Does NOT credit balance (amount paid != amount expected).
 */
export async function POST(req: NextRequest) {
  let rawBody: string;
  let payload: Record<string, any>;

  try {
    rawBody = await req.text();
    // Plisio sends URL-encoded form data
    const params = new URLSearchParams(rawBody);
    payload = Object.fromEntries(params.entries());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { secretKey } = SYSTEM_CONFIG.plisio;

  // 1. Verify HMAC signature
  if (secretKey && !verifyPlisioSignature(payload, secretKey)) {
    console.warn('[plisio/webhook] Signature verification FAILED. Possible spoofed request.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const {
    txn_id,
    status,
    source_amount,    // Amount in USD (what user was expected to pay)
    invoice_total_sum, // Actual amount received in crypto
    tx_url,           // Blockchain explorer URL
  } = payload;

  if (!txn_id) {
    return NextResponse.json({ error: 'Missing txn_id' }, { status: 400 });
  }

  // 2. Find the invoice in our DB
  const invoice = await prisma.plisioInvoice.findUnique({ where: { txnId: txn_id } });
  if (!invoice) {
    // Could be a test ping — log and acknowledge
    console.warn(`[plisio/webhook] Unknown txn_id: ${txn_id}`);
    return NextResponse.json({ ok: true });
  }

  // Always update the raw webhook payload for audit purposes
  await prisma.plisioInvoice.update({
    where: { txnId: txn_id },
    data:  { rawWebhook: JSON.stringify(payload), status: status ?? invoice.status },
  });

  // 3. Route by status
  if (status === PLISIO_STATUS_COMPLETED) {
    await handleCompletedPayment(invoice, tx_url);
  } else if (status === PLISIO_STATUS_MISMATCH) {
    console.error(
      `[plisio/webhook] MISMATCH on ${txn_id}: ` +
      `expected $${source_amount}, received ${invoice_total_sum}. Manual review required.`
    );
  } else if (
    status === PLISIO_STATUS_EXPIRED   ||
    status === PLISIO_STATUS_CANCELLED ||
    status === PLISIO_STATUS_ERROR
  ) {
    console.log(`[plisio/webhook] Invoice ${txn_id} → ${status}`);
    await prisma.plisioInvoice.update({
      where: { txnId: txn_id },
      data:  { status },
    });
  }

  // Always return 200 to Plisio to prevent retry storms
  return NextResponse.json({ ok: true });
}

/**
 * Handles a confirmed `completed` Plisio payment.
 * Activates the user's balance and initialises their operational capital.
 */
async function handleCompletedPayment(
  invoice: { id: string; txnId: string; userId: string; amount: number; activatedAt: Date | null },
  txHash?: string
): Promise<void> {
  // Idempotency guard: skip if already processed
  if (invoice.activatedAt) {
    console.log(`[plisio/webhook] Invoice ${invoice.txnId} already activated. Skipping.`);
    return;
  }

  const { amount, userId } = invoice;

  // Determine tier bonus based on deposit amount
  // We apply the bonus here too so the credited balance already includes it
  // NOTE: The bonus is NOT added to user.balance — it applies to activeCapital only
  // when the user subsequently creates an investment via /api/investments.
  // Here we simply credit the raw deposit amount.

  try {
    await prisma.$transaction(async (tx) => {
      // Re-check idempotency inside transaction
      const fresh = await tx.plisioInvoice.findUnique({ where: { id: invoice.id } });
      if (fresh?.activatedAt) return;

      // 1. Credit user balance (available for investment or withdrawal)
      await tx.user.update({
        where: { id: userId },
        data: {
          balance:      { increment: amount },
          activeDeposit: { increment: amount }, // kept for dashboard compat
        },
      });

      // 2. Create deposit transaction record
      await tx.transaction.create({
        data: {
          userId,
          type:        'deposit',
          amount,
          status:      'completed',
          description: `USDT BEP-20 deposit via Plisio`,
          reference:   invoice.txnId,
          metadata:    JSON.stringify({ txnId: invoice.txnId, txHash, network: 'BEP20' }),
        },
      });

      // 3. Mark invoice as completed
      await tx.plisioInvoice.update({
        where:  { id: invoice.id },
        data:   {
          status:      'completed',
          activatedAt:  new Date(),
          plisioTxHash: txHash ?? null,
        },
      });
    });

    // 4. Distribute unilevel commissions (outside main transaction for fail-silent behaviour)
    await distributeUnilevelCommission(userId, amount);

    console.log(`[plisio/webhook] ✅ Activated $${amount.toFixed(2)} deposit for user ${userId} (txn: ${invoice.txnId})`);
  } catch (err) {
    console.error(`[plisio/webhook] Failed to activate invoice ${invoice.txnId}:`, err);
    throw err;
  }
}
