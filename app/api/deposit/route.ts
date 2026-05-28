import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { distributeUnilevelCommission } from '@/server/services/commission.service';

const schema = z.object({
  amount: z.number().positive().min(10, 'Minimum deposit is $10'),
  network: z.enum(['USDT BEP20']).optional().default('USDT BEP20'),
  txHash: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const { amount, network, txHash } = parsed.data;

    // Check system maintenance mode
    const settings = await prisma.settings.findFirst();
    if (settings?.maintenanceMode && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'System is currently undergoing maintenance. Deposits are temporarily disabled.' },
        { status: 503 }
      );
    }


    // 2. Manual Blockchain Deposit Request
    if (!network || !txHash) {
      return NextResponse.json({ error: 'Network and transaction hash are required for manual deposit' }, { status: 400 });
    }

    // Create a pending deposit transaction
    const txn = await prisma.transaction.create({
      data: {
        userId: payload.userId,
        type: 'deposit',
        amount,
        status: 'pending',
        description: `Manual Deposit Request (${network})`,
        reference: txHash,
        metadata: JSON.stringify({ network, txHash }),
      },
    });

    return NextResponse.json({
      message: 'Manual deposit request submitted successfully. Awaiting administrator review.',
      transaction: txn
    }, { status: 201 });

  } catch (err) {
    console.error('[deposit/POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


