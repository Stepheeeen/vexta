import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  amount: z.number().positive().min(1, 'Minimum deposit is $1'),
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

    const { amount } = parsed.data;

    // Create deposit transaction
    const txn = await prisma.transaction.create({
      data: {
        userId: payload.userId,
        type: 'deposit',
        amount,
        status: 'completed',
        description: 'Simulated USD Deposit',
      },
    });

    return NextResponse.json({ message: 'Simulated deposit successful', transaction: txn }, { status: 201 });
  } catch (err) {
    console.error('[deposit/POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
