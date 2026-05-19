import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getReferralTree, getTotalCommissions } from '@/lib/referral-engine';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [tree, totals, commissions] = await Promise.all([
    getReferralTree(payload.userId),
    getTotalCommissions(payload.userId),
    prisma.commission.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const byLevel = [1, 2, 3, 4, 5].map((level) => {
    const levelCommissions = commissions.filter((c) => c.level === level);
    const earned = levelCommissions.reduce((s, c) => s + c.amount, 0);
    const count = tree.find((t) => t.level === level)?.users.length ?? 0;
    return { level, count, earned: +earned.toFixed(2) };
  });

  return NextResponse.json({
    referralCode: (await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { referralCode: true },
    }))?.referralCode,
    totals,
    byLevel,
    tree,
    recentCommissions: commissions,
  });
}
