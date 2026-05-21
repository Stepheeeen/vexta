/**
 * Referral Commission Engine
 * Propagates commissions up the referral chain — up to 5 levels deep.
 */

import { prisma } from './prisma';

export const COMMISSION_RATES: Record<number, number> = {
  1: 0.10,   // 10%
  2: 0.06,   // 6%
  3: 0.03,   // 3%
  4: 0.02,   // 2%
  5: 0.02,   // 2%
  6: 0.01,   // 1%
  7: 0.01,   // 1%
  8: 0.0025, // 0.25%
  9: 0.0025, // 0.25%
  10: 0.0025,// 0.25%
  11: 0.0025,// 0.25%
  12: 0.0025,// 0.25%
  13: 0.0025,// 0.25%
};

export const MAX_LEVELS = 13;

/**
 * Walk up the referral chain from a given userId and distribute commissions
 * based on the investment amount that triggered the event.
 *
 * Called whenever a new investment is activated.
 */
export async function propagateCommissions(
  investorId: string,
  investmentId: string,
  investmentAmount: number,
  tx?: any
): Promise<{ level: number; recipientId: string; amount: number }[]> {
  const results: { level: number; recipientId: string; amount: number }[] = [];
  const client = tx || prisma;

  let currentUserId = investorId;

  for (let level = 1; level <= MAX_LEVELS; level++) {
    // Find who referred the current user
    const link = await client.referralLink.findUnique({
      where: { referredId: currentUserId },
    });

    if (!link) break; // No more referrers in chain

    const rate = COMMISSION_RATES[level];
    const amount = +(investmentAmount * rate).toFixed(2);

    // Record commission
    await client.commission.create({
      data: {
        userId: link.referrerId,
        sourceUserId: investorId,
        investmentId,
        level,
        rate,
        amount,
      },
    });

    // Record transaction for recipient
    await client.transaction.create({
      data: {
        userId: link.referrerId,
        type: 'commission',
        amount,
        status: 'completed',
        description: `Level ${level} referral commission`,
        reference: investmentId,
        metadata: JSON.stringify({ level, sourceUserId: investorId, rate }),
      },
    });

    // Update referrer's User.balance and User.totalCommission fields
    await client.user.update({
      where: { id: link.referrerId },
      data: {
        balance: { increment: amount },
        totalCommission: { increment: amount },
      },
    });

    results.push({ level, recipientId: link.referrerId, amount });

    // Walk up one level
    currentUserId = link.referrerId;
  }

  return results;
}

/**
 * Get the full referral tree for a given user (up to 5 levels).
 */
export async function getReferralTree(userId: string) {
  const tree: { level: number; users: { id: string; firstName: string; lastName: string; email: string; joinedAt: Date }[] }[] = [];

  let currentLevelIds = [userId];

  for (let level = 1; level <= MAX_LEVELS; level++) {
    const links = await prisma.referralLink.findMany({
      where: { referrerId: { in: currentLevelIds } },
      include: {
        referred: {
          select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
        },
      },
    });

    if (links.length === 0) break;

    tree.push({
      level,
      users: links.map((l) => ({
        id: l.referred.id,
        firstName: l.referred.firstName,
        lastName: l.referred.lastName,
        email: l.referred.email,
        joinedAt: l.referred.createdAt,
      })),
    });

    currentLevelIds = links.map((l) => l.referredId);
  }

  return tree;
}

/**
 * Total commission earned by a user — optionally filtered by level.
 */
export async function getTotalCommissions(userId: string, level?: number) {
  const where = level ? { userId, level } : { userId };
  const result = await prisma.commission.aggregate({
    where,
    _sum: { amount: true },
    _count: true,
  });
  return {
    total: +(result._sum.amount ?? 0).toFixed(2),
    count: result._count,
  };
}
