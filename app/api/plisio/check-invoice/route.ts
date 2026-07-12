import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SYSTEM_CONFIG } from '@/lib/config/system';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 });
    }

    const userId = payload.userId;

    // 1. Fetch the invoice from our DB
    const invoice = await prisma.plisioInvoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Security: Check that the invoice belongs to the requesting user
    if (invoice.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If already activated, return success immediately
    if (invoice.activatedAt) {
      return NextResponse.json({
        success: true,
        status: invoice.status,
        message: 'Deposit already processed and credited'
      });
    }

    const { secretKey } = SYSTEM_CONFIG.plisio;
    if (!secretKey) {
      return NextResponse.json({ error: 'Plisio gateway integration is misconfigured' }, { status: 500 });
    }

    // 2. Fetch the true status from the Plisio API
    const apiRes = await fetch(`https://api.plisio.net/api/v1/invoices/${invoice.txnId}?api_key=${secretKey}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(6000)
    });
    const apiData = await apiRes.json() as any;

    if (apiData.status !== 'success' || !apiData.data?.invoice) {
      return NextResponse.json({ error: 'Failed to verify invoice with Plisio API' }, { status: 400 });
    }

    const { status: plisioStatus, received_amount: plisioActualSum, tx_url: txUrl } = apiData.data.invoice;

    let updatedStatus = invoice.status;

    if (plisioStatus === 'completed' || plisioStatus === 'mismatch') {
      const creditAmount = plisioActualSum ? parseFloat(plisioActualSum) : invoice.amount;
      
      // Perform database updates and credit balance
      await prisma.$transaction(async (tx) => {
        // Double check inside transaction
        const fresh = await tx.plisioInvoice.findUnique({ where: { id: invoice.id } });
        if (fresh?.activatedAt) return;

        // A. Credit user's available balance
        await tx.user.update({
          where: { id: userId },
          data: {
            balance: { increment: creditAmount },
          },
        });

        // B. Create a completed deposit transaction record
        const safeTxHash = Array.isArray(txUrl) ? txUrl.join(', ') : (txUrl ?? null);
        await tx.transaction.create({
          data: {
            userId,
            type: 'deposit',
            amount: creditAmount,
            status: 'completed',
            description: `USDT BEP-20 deposit via Plisio (manually synced)`,
            reference: invoice.txnId,
            metadata: JSON.stringify({
              txnId: invoice.txnId,
              txHash: safeTxHash,
              network: 'BEP20',
              source: 'manual_user_sync'
            }),
          },
        });

        // C. Update PlisioInvoice status and activatedAt
        await tx.plisioInvoice.update({
          where: { id: invoice.id },
          data: {
            status: plisioStatus,
            activatedAt: new Date(),
            plisioTxHash: safeTxHash,
            amount: creditAmount,
          },
        });
      }, { timeout: 30000 });

      updatedStatus = plisioStatus;
    } else if (['expired', 'cancelled', 'error'].includes(plisioStatus)) {
      // Just update status to expired/cancelled/error
      await prisma.plisioInvoice.update({
        where: { id: invoice.id },
        data: { status: plisioStatus }
      });
      updatedStatus = plisioStatus;
    }

    return NextResponse.json({
      success: true,
      status: updatedStatus,
      message: updatedStatus === 'completed' || updatedStatus === 'mismatch'
        ? 'Deposit processed and balance credited successfully'
        : `Deposit status is currently: ${updatedStatus}`
    });
  } catch (err: any) {
    console.error('[plisio/check-invoice]', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
