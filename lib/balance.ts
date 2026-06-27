import { prisma } from './prisma';

/**
 * Calculates a user's INTERNAL WALLET balance in real time.
 *
 * Internal Wallet = (deposits + roi + commission) - (investments + withdrawals + p2pSent)
 *
 * NOTE: p2p_received is EXCLUDED — those funds go to the separate P2P Wallet
 * (user.p2pBalance) and can only be used for package activation (max 50%).
 *
 * @param userId - The ID of the user
 * @param tx - Optional Prisma transaction client
 * @returns The calculated available Internal Wallet balance (min 0)
 */
export async function getAvailableBalance(userId: string, tx?: any): Promise<number> {
  const client = tx || prisma;

  // 1. Deposits: completed deposits only, excluding investment activation transactions
  const depositTxns = await client.transaction.aggregate({
    where: {
      userId,
      type: 'deposit',
      status: 'completed',
      description: { not: { contains: 'Investment activated' } }
    },
    _sum: { amount: true }
  });
  const totalDeposits = depositTxns._sum.amount ?? 0;

  // 2. Earnings and Investments
  const investments = await client.investment.findMany({
    where: { userId },
  });
  const totalInvested = investments.reduce((sum: number, inv: any) => sum + inv.amount, 0);
  const totalInvestmentEarned = investments.reduce((sum: number, inv: any) => sum + inv.totalEarned, 0);

  // Daily ROI from transaction table
  const dailyRoiTxns = await client.transaction.aggregate({
    where: {
      userId,
      type: 'daily_roi',
      status: 'completed'
    },
    _sum: { amount: true }
  });
  // System resets (negative amounts wiping support account profits)
  const systemResetTxns = await client.transaction.aggregate({
    where: {
      userId,
      type: 'system_reset',
      status: 'completed'
    },
    _sum: { amount: true }
  });
  const totalDailyRoi = dailyRoiTxns._sum.amount ?? 0;
  const totalSystemReset = systemResetTxns._sum.amount ?? 0;
  const totalEarned = totalDailyRoi + totalSystemReset;

  // 3. Commissions
  const commissionTxns = await client.transaction.aggregate({
    where: {
      userId,
      type: 'commission',
      status: 'completed'
    },
    _sum: { amount: true }
  });
  const totalCommissions = commissionTxns._sum.amount ?? 0;

  // 4. Withdrawals: approved, pending & completed
  const withdrawnResult = await client.withdrawal.aggregate({
    where: { userId, status: { in: ['approved', 'pending', 'completed'] } },
    _sum: { amount: true },
  });
  const totalWithdrawn = withdrawnResult._sum.amount ?? 0;

  // 5. P2P Sent (deducted from Internal Wallet)
  const p2pSentTxns = await client.transaction.aggregate({
    where: {
      userId,
      type: 'p2p_sent',
      status: 'completed'
    },
    _sum: { amount: true }
  });
  const totalP2pSent = p2pSentTxns._sum.amount ?? 0;

  // 6. P2P used for package activation (deducted from P2P wallet, NOT Internal Wallet)
  //    These are tracked as 'p2p_activation' transactions.
  //    We aggregate them here because they offset the totalInvested outflow.
  const p2pActivationTxns = await client.transaction.aggregate({
    where: {
      userId,
      type: 'p2p_activation',
      status: 'completed'
    },
    _sum: { amount: true }
  });
  const totalP2pActivations = p2pActivationTxns._sum.amount ?? 0;

  // Internal Wallet = inflows - outflows (P2P received is EXCLUDED)
  const balance = (totalDeposits + totalEarned + totalCommissions + totalP2pActivations) - (totalInvested + totalWithdrawn + totalP2pSent);
  return Math.max(0, Number(balance.toFixed(2)));
}

/**
 * Returns the user's P2P Wallet balance.
 * P2P Wallet funds are non-withdrawable and can only be used for package activation (max 50%).
 * Reads from the user.p2pBalance field which is updated atomically during P2P transfers and activations.
 */
export async function getP2pBalance(userId: string, tx?: any): Promise<number> {
  const client = tx || prisma;
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { p2pBalance: true }
  });
  return Math.max(0, Number((user?.p2pBalance ?? 0).toFixed(2)));
}

/**
 * Calculates separate withdrawable pools:
 *  - Passive Earnings (daily ROI) → may be blocked for gifted leaders
 *  - Network Earnings (commissions) → always withdrawable
 *
 * Also returns the P2P Wallet balance for display.
 *
 * Gifted Leader Logic (simplified):
 *  - If user.isSponsored && user.roiBlocked → ALL passive earnings are blocked
 *  - Network earnings are always available regardless of sponsored status
 *  - Admin can toggle roiBlocked to approve/block passive withdrawals
 *  - Goal-based auto-unlock still supported for goal_locked type
 */
export async function getWithdrawableBalances(
  userId: string,
  tx?: any,
  /** Optional pre-computed balance to avoid a second getAvailableBalance call.
   *  Pass this when you have already called getAvailableBalance() in the same request. */
  precomputedBalance?: number
) {
  const client = tx || prisma;
  const user = await client.user.findUnique({
    where: { id: userId },
    select: {
      p2pBalance: true,
      isSponsored: true,
      sponsoredType: true,
      sponsoredGoalAmount: true,
      sponsoredDirectSales: true,
      sponsoredWithdrawalPercentage: true,
      roiBlocked: true,
      fundsFrozen: true,
      withdrawalUnlockType: true,
      withdrawalUnlockAmount: true,
    }
  });
  
  // Use pre-computed balance if provided — avoids duplicate 7-query aggregate on the same request
  const totalBalance = precomputedBalance !== undefined
    ? precomputedBalance
    : await getAvailableBalance(userId, client);
  const p2pBalance = Math.max(0, Number((user?.p2pBalance ?? 0).toFixed(2)));
  
  if (!user) return { totalBalance, availablePassive: 0, availableNetwork: 0, blockedPassive: 0, p2pBalance: 0, fundsFrozen: false };
  
  if (user.fundsFrozen) {
    return {
      totalBalance,
      availablePassive: 0,
      availableNetwork: 0,
      blockedPassive: 0,
      p2pBalance,
      fundsFrozen: true,
      availableRoi: 0,
      availableCommission: 0,
      blockedRoi: 0,
    };
  }

  // Dynamically calculate and sync direct sales for sponsored accounts
  let sponsoredDirectSales = user.sponsoredDirectSales;
  if (user.isSponsored) {
    const referrals = await client.referralLink.findMany({
      where: { referrerId: userId },
      select: { referredId: true }
    });
    const referredIds = referrals.map((r: any) => r.referredId);
    if (referredIds.length > 0) {
      const directRealInvestments = await client.investment.findMany({
        where: { userId: { in: referredIds }, isVirtual: false } as any,
        select: { amount: true }
      });
      sponsoredDirectSales = directRealInvestments.reduce((sum: number, inv: any) => sum + inv.amount, 0);
    } else {
      sponsoredDirectSales = 0;
    }
    
    // Update cache in DB if it changed
    if (sponsoredDirectSales !== user.sponsoredDirectSales) {
      await client.user.update({
        where: { id: userId },
        data: { sponsoredDirectSales }
      });
    }
  }

  // ── Consolidated Withdrawals (type 'all') ────────────────────────────────
  // These contain a split between passive and network amounts in their note
  const allWithdrawals = await client.withdrawal.findMany({
    where: { userId, status: { in: ['approved', 'pending', 'completed'] }, type: 'all' },
    select: { note: true }
  });
  let allPassiveWithdrawn = 0;
  let allNetworkWithdrawn = 0;
  for (const w of allWithdrawals) {
    const splitMatch = w.note?.match(/\[ALL:P=([0-9.]+),N=([0-9.]+)\]/);
    if (splitMatch) {
      allPassiveWithdrawn += parseFloat(splitMatch[1]);
      allNetworkWithdrawn += parseFloat(splitMatch[2]);
    }
  }

  // ── Network Earnings (Commissions) ─────────────────────────────────────────
  const commissionTxns = await client.transaction.aggregate({
    where: { userId, type: 'commission', status: 'completed' },
    _sum: { amount: true }
  });
  const totalCommissions = commissionTxns._sum.amount ?? 0;

  // Support both old 'commission' type and new 'network' type withdrawals
  const commissionWithdrawnResult = await client.withdrawal.aggregate({
    where: { userId, status: { in: ['approved', 'pending', 'completed'] }, type: { in: ['commission', 'network'] } },
    _sum: { amount: true }
  });
  const totalCommissionWithdrawn = (commissionWithdrawnResult._sum.amount ?? 0) + allNetworkWithdrawn;
  
  // Available Network = Commissions - Commission Withdrawn (capped by total available balance)
  const availableNetwork = Math.max(0, Math.min(totalBalance, totalCommissions - totalCommissionWithdrawn));

  // ── Passive Earnings (Daily ROI) ───────────────────────────────────────────
  const investments = await client.investment.findMany({ where: { userId } });
  const totalInvestmentEarned = investments.reduce((sum: number, inv: any) => sum + inv.totalEarned, 0);

  const dailyRoiTxns = await client.transaction.aggregate({
    where: { userId, type: 'daily_roi', status: 'completed' },
    _sum: { amount: true }
  });
  const systemResetTxns = await client.transaction.aggregate({
    where: { userId, type: 'system_reset', status: 'completed' },
    _sum: { amount: true }
  });
  const totalDailyRoi = dailyRoiTxns._sum.amount ?? 0;
  const totalSystemReset = systemResetTxns._sum.amount ?? 0;
  const totalRoiEarned = totalDailyRoi + totalSystemReset;

  // Support both old 'roi' type and new 'passive' type withdrawals
  const roiWithdrawnResult = await client.withdrawal.aggregate({
    where: { userId, status: { in: ['approved', 'pending', 'completed'] }, type: { in: ['roi', 'passive'] } },
    _sum: { amount: true }
  });
  const totalRoiWithdrawn = (roiWithdrawnResult._sum.amount ?? 0) + allPassiveWithdrawn;

  // Available Passive = ROI - ROI Withdrawn (capped by total available balance)
  const rawAvailablePassive = Math.max(0, totalRoiEarned - totalRoiWithdrawn);
  
  // ── Gifted Leader Restrictions ─────────────────────────────────────────────
  // Simplified: if roiBlocked → block ALL passive earnings
  // Network earnings are ALWAYS available (earned through own work)
  let blockedPassive = 0;
  let standardBlockedPassive = 0;
  if (user.isSponsored) {
    let isFullyBlocked = user.roiBlocked;
    let goalMet = false;

    if (user.sponsoredType === 'goal_locked') {
      goalMet = sponsoredDirectSales >= user.sponsoredGoalAmount;
      if (!goalMet) isFullyBlocked = true;
    } else if (user.sponsoredType === 'free') {
      const hasWithdrawnThreshold = totalRoiWithdrawn >= 12;
      const hasReferredThreshold = sponsoredDirectSales >= 10;
      if (hasWithdrawnThreshold && !hasReferredThreshold) {
        isFullyBlocked = true;
      }
    }
    
    if (isFullyBlocked) {
      standardBlockedPassive = rawAvailablePassive;
    } else if (user.sponsoredType === 'goal_locked' && goalMet) {
      // If goal met, do not apply any withdrawal percentage limits
      standardBlockedPassive = 0;
    } else {
      // Goal met or not fully blocked. Apply percentage restriction.
      const allowedPercentage = user.sponsoredWithdrawalPercentage ?? 100;
      const blockedPercentage = Math.max(0, 100 - allowedPercentage);
      standardBlockedPassive = rawAvailablePassive * (blockedPercentage / 100);
    }
  }

  // Apply custom withdrawal overrides
  const unlockType = (user as any).withdrawalUnlockType ?? 'none';
  const unlockAmount = (user as any).withdrawalUnlockAmount ?? 0;

  if (unlockType === 'permanent' || unlockType === 'full') {
    blockedPassive = 0;
  } else if (unlockType === 'amount') {
    blockedPassive = Math.max(0, standardBlockedPassive - unlockAmount);
  } else {
    blockedPassive = standardBlockedPassive;
  }

  const availablePassive = Math.max(0, Math.min(totalBalance - blockedPassive, rawAvailablePassive - blockedPassive));

  return {
    totalBalance,
    availablePassive: Number(availablePassive.toFixed(2)),
    availableNetwork: Number(availableNetwork.toFixed(2)),
    blockedPassive: Number(blockedPassive.toFixed(2)),
    p2pBalance,
    fundsFrozen: false,
    // Legacy compatibility aliases
    availableRoi: Number(availablePassive.toFixed(2)),
    availableCommission: Number(availableNetwork.toFixed(2)),
    blockedRoi: Number(blockedPassive.toFixed(2)),
  };
}

/**
 * Safely decrement a user's balance, clamping at zero.
 *
 * This prevents race conditions or edge cases from pushing `user.balance`
 * negative in the database. Logs a warning if clamping was required (means
 * the caller had stale balance information — worth investigating).
 *
 * @param userId - Target user
 * @param amount - Amount to deduct (must be positive)
 * @param tx     - Prisma transaction client (required when called inside $transaction)
 */
export async function safeDecrementBalance(userId: string, amount: number, tx: any): Promise<void> {
  // Read current persisted balance inside the same transaction context
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { balance: true },
  });

  const currentBalance = user?.balance ?? 0;
  const safeDecrement = Math.min(amount, currentBalance);

  if (safeDecrement < amount) {
    console.warn(
      `[safeDecrementBalance] ⚠️  Balance clamp triggered for user ${userId}. ` +
      `Tried to deduct $${amount.toFixed(2)} but only $${currentBalance.toFixed(2)} available. ` +
      `Deducting $${safeDecrement.toFixed(2)} instead. Investigate stale balance read.`
    );
  }

  if (safeDecrement > 0) {
    await tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: safeDecrement } },
    });
  }
}

