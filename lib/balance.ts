import { prisma } from './prisma';

/**
 * Calculates a user's available balance in real time using the formula:
 * balance = (deposits + roi + commission + p2pReceived) - (investments + withdrawals + p2pSent)
 *
 * @param userId - The ID of the user
 * @param tx - Optional Prisma transaction client
 * @returns The calculated available balance rounded to 2 decimal places, with a minimum of 0
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

  // Daily ROI from transaction table (since production daily ROI is created as a transaction of type 'daily_roi')
  const dailyRoiTxns = await client.transaction.aggregate({
    where: {
      userId,
      type: 'daily_roi',
      status: 'completed'
    },
    _sum: { amount: true }
  });
  const totalDailyRoi = dailyRoiTxns._sum.amount ?? 0;
  const totalEarned = totalInvestmentEarned + totalDailyRoi;

  // 3. Commissions: from transactions table to include all deposit & investment commission types
  const commissionTxns = await client.transaction.aggregate({
    where: {
      userId,
      type: 'commission',
      status: 'completed'
    },
    _sum: { amount: true }
  });
  const totalCommissions = commissionTxns._sum.amount ?? 0;

  // 4. Withdrawals: approved & pending withdrawals from Withdrawal table
  const withdrawnResult = await client.withdrawal.aggregate({
    where: { userId, status: { in: ['approved', 'pending'] } },
    _sum: { amount: true },
  });
  const totalWithdrawn = withdrawnResult._sum.amount ?? 0;

  // 5. P2P Sent
  const p2pSentTxns = await client.transaction.aggregate({
    where: {
      userId,
      type: 'p2p_sent',
      status: 'completed'
    },
    _sum: { amount: true }
  });
  const totalP2pSent = p2pSentTxns._sum.amount ?? 0;

  // 6. P2P Received
  const p2pReceivedTxns = await client.transaction.aggregate({
    where: {
      userId,
      type: 'p2p_received',
      status: 'completed'
    },
    _sum: { amount: true }
  });
  const totalP2pReceived = p2pReceivedTxns._sum.amount ?? 0;

  // Calculate available balance
  const balance = (totalDeposits + totalEarned + totalCommissions + totalP2pReceived) - (totalInvested + totalWithdrawn + totalP2pSent);
  return Math.max(0, Number(balance.toFixed(2)));
}

/**
 * Calculates separate available pools for ROI and Commissions,
 * enforcing freeze and goal-locked block rules for sponsored users.
 */
export async function getWithdrawableBalances(userId: string, tx?: any) {
  const client = tx || prisma;
  const user = await client.user.findUnique({
    where: { id: userId },
    select: {
      isSponsored: true,
      sponsoredType: true,
      sponsoredGoalAmount: true,
      sponsoredDirectSales: true,
      roiBlocked: true,
      fundsFrozen: true,
    }
  });
  
  const totalBalance = await getAvailableBalance(userId, client);
  if (!user) return { totalBalance, availableRoi: 0, availableCommission: 0, blockedRoi: 0, fundsFrozen: false };
  
  if (user.fundsFrozen) {
    return { totalBalance, availableRoi: 0, availableCommission: 0, blockedRoi: 0, fundsFrozen: true };
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

  // Fetch all commissions
  const commissionTxns = await client.transaction.aggregate({
    where: { userId, type: 'commission', status: 'completed' },
    _sum: { amount: true }
  });
  const totalCommissions = commissionTxns._sum.amount ?? 0;

  const commissionWithdrawnResult = await client.withdrawal.aggregate({
    where: { userId, status: { in: ['approved', 'pending'] }, type: 'commission' },
    _sum: { amount: true }
  });
  const totalCommissionWithdrawn = commissionWithdrawnResult._sum.amount ?? 0;
  
  // Available Commission = Commissions - Commission Withdrawn (capped by total available balance)
  const availableCommission = Math.max(0, Math.min(totalBalance, totalCommissions - totalCommissionWithdrawn));

  // Calculate all ROI earned
  const investments = await client.investment.findMany({ where: { userId } });
  const totalInvestmentEarned = investments.reduce((sum: number, inv: any) => sum + inv.totalEarned, 0);

  const dailyRoiTxns = await client.transaction.aggregate({
    where: { userId, type: 'daily_roi', status: 'completed' },
    _sum: { amount: true }
  });
  const totalDailyRoi = dailyRoiTxns._sum.amount ?? 0;
  const totalRoiEarned = totalInvestmentEarned + totalDailyRoi;

  // Calculate virtual ROI earned (from virtual investments or virtual daily_roi)
  const virtualInvestmentEarned = investments.filter((i: any) => i.isVirtual).reduce((sum: number, inv: any) => sum + inv.totalEarned, 0);
  const virtualDailyRoiTxns = await client.transaction.aggregate({
    where: { userId, type: 'daily_roi', status: 'completed', isVirtual: true } as any,
    _sum: { amount: true }
  });
  const totalVirtualRoiEarned = virtualInvestmentEarned + (virtualDailyRoiTxns._sum.amount ?? 0);

  const roiWithdrawnResult = await client.withdrawal.aggregate({
    where: { userId, status: { in: ['approved', 'pending'] }, type: 'roi' },
    _sum: { amount: true }
  });
  const totalRoiWithdrawn = roiWithdrawnResult._sum.amount ?? 0;

  // Available ROI = ROI - ROI Withdrawn (capped by total available balance)
  const rawAvailableRoi = Math.max(0, totalRoiEarned - totalRoiWithdrawn);
  
  // Determine if ROI is blocked or if there is any blocked virtual ROI
  let blockedRoi = 0;
  if (user.isSponsored) {
    if (user.sponsoredType === 'goal_locked') {
      const goalMet = sponsoredDirectSales >= user.sponsoredGoalAmount;
      if (!goalMet || user.roiBlocked) {
        blockedRoi = Math.max(0, totalVirtualRoiEarned - totalRoiWithdrawn);
      }
    } else if (user.sponsoredType === 'free') {
      if (user.roiBlocked || (totalRoiWithdrawn >= 12 && sponsoredDirectSales < 10)) {
        blockedRoi = rawAvailableRoi;
      }
    }
  }

  const availableRoi = Math.max(0, Math.min(totalBalance - blockedRoi, rawAvailableRoi - blockedRoi));

  return {
    totalBalance,
    availableRoi: Number(availableRoi.toFixed(2)),
    availableCommission: Number(availableCommission.toFixed(2)),
    blockedRoi: Number(blockedRoi.toFixed(2)),
    fundsFrozen: false,
  };
}

