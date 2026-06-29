/**
 * earning-engine.ts
 *
 * Central helper that routes ANY earning (daily ROI, commission, bonus) through a
 * user's active investments in purchase order (oldest first), enforcing the 200%
 * maximum payout rule per investment.
 *
 * RULES:
 *  1. Each investment can earn at most `maxPayout` (= amount × 2) in total.
 *  2. Earnings fill the oldest active package first.
 *  3. If a package hits its cap, it is immediately marked `completed`.
 *  4. Overflow moves to the next package.
 *  5. Any amount that exceeds all remaining capacity is permanently forfeited.
 */

import { prisma } from './prisma';

export interface EarningEvent {
  investmentId: string;
  credited: number;
  completed: boolean;
}

export interface EarningResult {
  /** Total amount actually credited to user balance. */
  credited: number;
  /** Total amount permanently forfeited (exceeded all package capacity). */
  forfeited: number;
  /** Per-investment breakdown. */
  events: EarningEvent[];
}

/**
 * Apply an earning of `grossAmount` to a user's active investments (oldest first).
 *
 * Returns how much was credited (balance-eligible) and how much was forfeited.
 *
 * @param userId       - Recipient user ID
 * @param grossAmount  - The raw earning amount before capacity capping
 * @param tx           - Optional Prisma transaction client (pass when called inside $transaction)
 */
export async function applyEarningToInvestments(
  userId: string,
  grossAmount: number,
  tx?: any
): Promise<EarningResult> {
  const client = tx || prisma;

  if (grossAmount <= 0) {
    return { credited: 0, forfeited: 0, events: [] };
  }

  // Fetch active investments ordered oldest-first (priority order per spec)
  const activeInvestments = await client.investment.findMany({
    where: {
      userId,
      status: 'active',
      activeCapital: { gt: 0 },
    },
    orderBy: { createdAt: 'asc' },
  });

  let remaining = grossAmount;
  let totalCredited = 0;
  const events: EarningEvent[] = [];

  for (const inv of activeInvestments) {
    if (remaining <= 0) break;

    // Guard: skip investments that have no declared cap (legacy rows before migration)
    const maxPayout = inv.maxPayout > 0 ? inv.maxPayout : inv.amount * 2;
    const capacity = +(maxPayout - inv.totalEarned).toFixed(2);

    if (capacity <= 0) {
      // Package is already full — mark it completed if not already done
      await client.investment.update({
        where: { id: inv.id },
        data: { status: 'completed', activeCapital: 0 },
      });
      continue;
    }

    const credit = +(Math.min(remaining, capacity)).toFixed(2);
    const newTotalEarned = +(inv.totalEarned + credit).toFixed(2);
    const willComplete = newTotalEarned >= maxPayout - 0.001; // float tolerance

    await client.investment.update({
      where: { id: inv.id },
      data: {
        totalEarned: newTotalEarned,
        ...(willComplete
          ? { status: 'completed', activeCapital: 0 }
          : {}),
      },
    });

    if (willComplete) {
      // Also decrement operationalCapital and activeDeposit on the user since this investment is now dead
      await client.user.update({
        where: { id: userId },
        data: {
          operationalCapital: { decrement: inv.activeCapital },
          activeDeposit: { decrement: inv.amount },
        },
      });
    }

    events.push({ investmentId: inv.id, credited: credit, completed: willComplete });
    totalCredited = +(totalCredited + credit).toFixed(2);
    remaining = +(remaining - credit).toFixed(2);
  }

  const forfeited = +(grossAmount - totalCredited).toFixed(2);

  if (forfeited > 0) {
    console.log(
      `[EARNING-ENGINE] User ${userId}: $${forfeited.toFixed(2)} forfeited — ` +
      `no remaining package capacity.`
    );
  }

  return { credited: totalCredited, forfeited, events };
}
