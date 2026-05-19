import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // roi | commission | deposit | withdrawal
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);

  const where = {
    userId: payload.userId,
    ...(type ? { type } : {}),
  };

  const [transactions, totals] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.transaction.groupBy({
      by: ['type'],
      where: { userId: payload.userId, status: 'completed', amount: { gt: 0 } },
      _sum: { amount: true },
    }),
  ]);

  const summary = Object.fromEntries(
    totals.map((t) => [t.type, +(t._sum.amount ?? 0).toFixed(2)])
  );

  return NextResponse.json({ transactions, summary });
}
