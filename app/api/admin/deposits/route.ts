import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { SYSTEM_CONFIG } from '@/lib/config/system';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    // ─── Live Sync with Plisio ───────────────────────────────────────────────
    // Only check invoices created in the last 7 days to prevent rate limits & timeouts
    const secretKey = SYSTEM_CONFIG.plisio.secretKey;
    if (secretKey) {
      try {
        const fortyEightHoursAgo = new Date();
        fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

        const unactivatedInvoices = await prisma.plisioInvoice.findMany({
          where: {
            AND: [
              {
                OR: [
                  { activatedAt: null },
                  { activatedAt: { isSet: false } }
                ]
              },
              {
                status: { in: ['pending', 'cancelled', 'expired'] },
                createdAt: { gte: fortyEightHoursAgo }
              }
            ]
          }
        });

        await Promise.all(
          unactivatedInvoices.map(async (inv) => {
            try {
              const opUrl = `https://plisio.net/api/v1/invoices/${inv.txnId}?api_key=${secretKey}`;
              const res = await fetch(opUrl, { 
                cache: 'no-store', 
                signal: AbortSignal.timeout(3000) 
              });
              const data = await res.json() as any;
              if (data.status === 'success' && data.data?.invoice) {
                const plisioStatus = data.data.invoice.status;
                const receivedAmount = data.data.invoice.received_amount ? parseFloat(data.data.invoice.received_amount) : 0;
                const txHash = data.data.invoice.tx_id;
                
                if (plisioStatus !== inv.status && ['completed', 'mismatch', 'expired', 'failed'].includes(plisioStatus)) {
                  await prisma.plisioInvoice.update({
                    where: { id: inv.id },
                    data: {
                      status: plisioStatus,
                      plisioTxHash: txHash || inv.plisioTxHash,
                      amount: plisioStatus === 'mismatch' && receivedAmount > 0 ? receivedAmount : inv.amount
                    }
                  });
                }
              }
            } catch (e) {
              console.error(`Sync error for invoice ${inv.txnId}:`, e);
            }
          })
        );
      } catch (syncErr) {
        console.error('[admin-deposits-sync]', syncErr);
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    let deposits: any[] = [];

    if (statusFilter === 'mismatched') {
      const rawMismatches = await prisma.plisioInvoice.findMany({
        where: {
          status: { in: ['mismatch', 'completed'] },
          OR: [
            { activatedAt: null },
            { activatedAt: { isSet: false } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });

      deposits = rawMismatches.map(d => {
        return {
          id: d.id,
          userId: d.userId,
          user: d.user ? `${d.user.firstName} ${d.user.lastName}` : 'Unknown User',
          email: d.user ? d.user.email : 'Unknown Email',
          amount: d.amount,
          network: `${d.currency} (${d.network})`,
          txHash: d.plisioTxHash || d.txnId,
          date: d.createdAt.toISOString().split('T')[0],
          status: d.status,
          description: d.status === 'mismatch' ? 'Plisio Payment Mismatch' : 'Plisio Uncredited Payment',
          isPlisio: true
        };
      });
    } else {
      const whereClause: any = { type: 'deposit' };
      if (statusFilter && statusFilter !== 'all') {
        whereClause.status = statusFilter;
      }

      const rawDeposits = await prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });

      deposits = rawDeposits.map(d => {
        let network = 'USDT (BEP20)';
        let txHash = d.reference || '';
        try {
          if (d.metadata) {
            const meta = JSON.parse(d.metadata);
            if (meta.network) network = meta.network;
            if (meta.txHash) txHash = meta.txHash;
          }
        } catch {}

        return {
          id: d.id,
          userId: d.userId,
          user: d.user ? `${d.user.firstName} ${d.user.lastName}` : 'Unknown User',
          email: d.user ? d.user.email : 'Unknown Email',
          amount: d.amount,
          network,
          txHash,
          date: d.createdAt.toISOString().split('T')[0],
          status: d.status,
          description: d.description || 'Deposit Request',
        };
      });
    }

    const pendingCount = await prisma.transaction.count({
      where: { type: 'deposit', status: 'pending' }
    });

    const mismatchedCount = await prisma.plisioInvoice.count({
      where: {
        status: { in: ['mismatch', 'completed'] },
        OR: [
          { activatedAt: null },
          { activatedAt: { isSet: false } }
        ]
      }
    });

    return NextResponse.json({ deposits, pendingCount, mismatchedCount });
  } catch (err) {
    console.error('[admin-deposits-get]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, action, isPlisio } = await req.json();
    if (!id || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (isPlisio) {
      const invoice = await prisma.plisioInvoice.findUnique({
        where: { id }
      });

      if (!invoice) {
        return NextResponse.json({ error: 'Plisio invoice not found' }, { status: 404 });
      }

      if (invoice.activatedAt) {
        return NextResponse.json({ error: 'Deposit has already been processed' }, { status: 400 });
      }

      if (action === 'approve') {
        await prisma.$transaction(async (tx) => {
          // Double check inside transaction
          const freshInvoice = await tx.plisioInvoice.findUnique({
            where: { id }
          });
          if (freshInvoice?.activatedAt) {
            throw new Error('ALREADY_PROCESSED');
          }

          // 1. Credit user balance
          await tx.user.update({
            where: { id: invoice.userId },
            data: {
              balance: { increment: invoice.amount },
            }
          });

          // 2. Create completed Transaction record
          await tx.transaction.create({
            data: {
              userId: invoice.userId,
              type: 'deposit',
              amount: invoice.amount,
              status: 'completed',
              description: 'USDT BEP-20 deposit via Plisio (Manual Mismatch Resolution)',
              reference: invoice.txnId,
              metadata: JSON.stringify({
                txnId: invoice.txnId,
                txHash: invoice.plisioTxHash,
                network: invoice.network || 'BEP20',
                source: 'admin_manual_approval'
              })
            }
          });

          // 3. Mark PlisioInvoice as completed and activated
          await tx.plisioInvoice.update({
            where: { id },
            data: {
              status: 'completed',
              activatedAt: new Date()
            }
          });
        }, { timeout: 30000 });

        return NextResponse.json({ message: 'Plisio deposit approved and credited successfully' });
      }

      if (action === 'reject') {
        await prisma.$transaction(async (tx) => {
          // Verify status inside transaction
          const freshInvoice = await tx.plisioInvoice.findUnique({
            where: { id }
          });
          if (freshInvoice?.activatedAt) {
            throw new Error('ALREADY_PROCESSED');
          }

          // Mark PlisioInvoice as failed (rejected)
          await tx.plisioInvoice.update({
            where: { id },
            data: {
              status: 'failed'
            }
          });
        }, { timeout: 30000 });

        return NextResponse.json({ message: 'Plisio deposit rejected successfully' });
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Default manual deposit approval logic
    const txn = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!txn || txn.type !== 'deposit') {
      return NextResponse.json({ error: 'Deposit request not found' }, { status: 404 });
    }

    if (txn.status !== 'pending') {
      return NextResponse.json({ error: 'Deposit has already been processed' }, { status: 400 });
    }

    if (action === 'approve') {
      await prisma.$transaction(async (tx) => {
        // 1. Lock user document
        await tx.user.update({
          where: { id: txn.userId },
          data: { updatedAt: new Date() }
        });

        // 2. Verify pending status inside transaction
        const currentTxn = await tx.transaction.findUnique({
          where: { id }
        });

        if (!currentTxn || currentTxn.status !== 'pending') {
          throw new Error('ALREADY_PROCESSED');
        }

        // 3. Mark transaction as completed
        await tx.transaction.update({
          where: { id },
          data: {
            status: 'completed',
            description: currentTxn.description ? currentTxn.description.replace('Pending', 'Approved') : 'Approved Deposit'
          }
        });

        // 4. Update user balance
        await tx.user.update({
          where: { id: currentTxn.userId },
          data: {
            balance: { increment: currentTxn.amount },
          }
        });
      }, { timeout: 30000 });

      return NextResponse.json({ message: 'Deposit approved successfully' });
    }

    if (action === 'reject') {
      await prisma.$transaction(async (tx) => {
        // 1. Verify pending status inside transaction
        const currentTxn = await tx.transaction.findUnique({
          where: { id }
        });

        if (!currentTxn || currentTxn.status !== 'pending') {
          throw new Error('ALREADY_PROCESSED');
        }

        // 2. Mark transaction as failed
        await tx.transaction.update({
          where: { id },
          data: {
            status: 'failed',
            description: currentTxn.description ? currentTxn.description.replace('Pending', 'Rejected') : 'Rejected Deposit'
          }
        });
      }, { timeout: 30000 });

      return NextResponse.json({ message: 'Deposit rejected successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    if (err.message === 'ALREADY_PROCESSED') {
      return NextResponse.json({ error: 'Deposit has already been processed' }, { status: 400 });
    }
    console.error('[admin-deposits-post]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
