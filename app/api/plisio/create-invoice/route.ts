import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SYSTEM_CONFIG } from '@/lib/config/system';

const schema = z.object({
  amount: z.number().positive().min(10, 'Minimum deposit is $10'),
});

/**
 * POST /api/plisio/create-invoice
 *
 * Creates a Plisio USDT BEP-20 invoice for the authenticated user.
 * Returns the Plisio-hosted payment URL to redirect the user to.
 *
 * Plisio auto-forwarding must be configured on the Plisio dashboard
 * to forward all received USDT to PLISIO_MASTER_WALLET immediately.
 */
export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const { amount } = parsed.data;
  const { secretKey, currency, callbackUrl } = SYSTEM_CONFIG.plisio;

  if (!secretKey) {
    console.error('[plisio/create-invoice] PLISIO_SECRET_KEY is not configured.');
    return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 503 });
  }

  // Fetch user for display name on invoice
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { firstName: true, lastName: true, email: true },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Check maintenance mode
  const settings = await prisma.settings.findFirst();
  if (settings?.maintenanceMode && payload.role !== 'admin') {
    return NextResponse.json(
      { error: 'System is under maintenance. Deposits temporarily disabled.' },
      { status: 503 }
    );
  }

  try {
    // Build Plisio invoice creation request
    // Docs: https://plisio.net/documentation/endpoints/create-invoice
    const orderNumber = `VEXTA-${payload.userId.slice(-8).toUpperCase()}-${Date.now()}`;

    const appUrl = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'https://vexta.network';

    const plisioParams = new URLSearchParams({
      api_key:         secretKey,
      currency:       currency,          // USDT_BSC
      source_amount:  amount.toFixed(2),
      source_currency: 'USD',
      order_number:   orderNumber,
      order_name:     `VEXTA Deposit — ${user.firstName} ${user.lastName}`,
      description:    `USDT BEP-20 deposit for ${user.email}`,
      callback_url:   callbackUrl,
      success_url:    `${appUrl}/dashboard?deposit=success`,
      cancel_url:     `${appUrl}/dashboard/deposit?deposit=cancelled`,
      email:          user.email,
      // Plugins for auto-send must be configured on Plisio dashboard, not via API
    });

    const plisioRes = await fetch(
      `https://plisio.net/api/v1/invoices/new?${plisioParams.toString()}`,
      { method: 'GET' }
    );

    const plisioData = await plisioRes.json();

    if (plisioData.status !== 'success' || !plisioData.data?.txn_id) {
      console.error('[plisio/create-invoice] Plisio API error:', plisioData);
      return NextResponse.json(
        { error: plisioData.data?.message || 'Failed to create payment invoice' },
        { status: 502 }
      );
    }

    const { txn_id, invoice_url } = plisioData.data;

    // Persist the invoice record in our DB
    const invoice = await prisma.plisioInvoice.create({
      data: {
        userId:     payload.userId,
        txnId:      txn_id,
        amount,
        currency:   'USDT',
        network:    'BEP20',
        status:     'pending',
        invoiceUrl: invoice_url,
      },
    });

    return NextResponse.json({
      message:    'Invoice created',
      invoiceUrl: invoice_url,
      txnId:      txn_id,
      invoiceId:  invoice.id,
    }, { status: 201 });

  } catch (err) {
    console.error('[plisio/create-invoice]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
