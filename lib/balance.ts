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
  const totalDailyRoi = dailyRoiTxns._sum.amount ?? 0;
  const totalEarned = totalDailyRoi;

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

  // 4. Withdrawals: approved & pending
  const withdrawnResult = await client.withdrawal.aggregate({
    where: { userId, status: { in: ['approved', 'pending'] } },
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
  //    These are tracked as 'p2p_activation' transactions
  //    NOT included here because they affect p2pBalance, not Internal Wallet

  // Internal Wallet = inflows - outflows (P2P received is EXCLUDED)
  const balance = (totalDeposits + totalEarned + totalCommissions) - (totalInvested + totalWithdrawn + totalP2pSent);
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
export async function getWithdrawableBalances(userId: string, tx?: any) {
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
    }
  });
  
  const totalBalance = await getAvailableBalance(userId, client);
  const p2pBalance = Math.max(0, Number((user?.p2pBalance ?? 0).toFixed(2)));
  
  if (!user) return { totalBalance, availablePassive: 0, availableNetwork: 0, blockedPassive: 0, p2pBalance: 0, fundsFrozen: false };
  
  if (user.fundsFrozen) {
    return { totalBalance, availablePassive: 0, availableNetwork: 0, blockedPassive: 0, p2pBalance, fundsFrozen: true };
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
    where: { userId, status: { in: ['approved', 'pending'] }, type: 'all' },
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
    where: { userId, status: { in: ['approved', 'pending'] }, type: { in: ['commission', 'network'] } },
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
  const totalDailyRoi = dailyRoiTxns._sum.amount ?? 0;
  const totalRoiEarned = totalDailyRoi;

  // Support both old 'roi' type and new 'passive' type withdrawals
  const roiWithdrawnResult = await client.withdrawal.aggregate({
    where: { userId, status: { in: ['approved', 'pending'] }, type: { in: ['roi', 'passive'] } },
    _sum: { amount: true }
  });
  const totalRoiWithdrawn = (roiWithdrawnResult._sum.amount ?? 0) + allPassiveWithdrawn;

  // Available Passive = ROI - ROI Withdrawn (capped by total available balance)
  const rawAvailablePassive = Math.max(0, totalRoiEarned - totalRoiWithdrawn);
  
  // ── Gifted Leader Restrictions ─────────────────────────────────────────────
  // Simplified: if roiBlocked → block ALL passive earnings
  // Network earnings are ALWAYS available (earned through own work)
  let blockedPassive = 0;
  if (user.isSponsored) {
    let isFullyBlocked = user.roiBlocked;
    if (user.sponsoredType === 'goal_locked') {
      const goalMet = sponsoredDirectSales >= user.sponsoredGoalAmount;
      if (!goalMet) isFullyBlocked = true;
    }
    
    if (isFullyBlocked) {
      blockedPassive = rawAvailablePassive;
    } else {
      // Goal met or not fully blocked. Apply percentage restriction.
      const allowedPercentage = user.sponsoredWithdrawalPercentage ?? 100;
      const blockedPercentage = Math.max(0, 100 - allowedPercentage);
      blockedPassive = rawAvailablePassive * (blockedPercentage / 100);
    }
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
