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

