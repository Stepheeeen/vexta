import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting data reset...');

  // 1. Delete all unverified accounts (except admin)
  const deletedUsers = await prisma.user.deleteMany({
    where: { isVerified: false, role: { not: 'admin' } }
  });
  console.log(`Deleted ${deletedUsers.count} unverified accounts.`);

  // 2. Return all balances to 0 for remaining accounts
  const updatedUsers = await prisma.user.updateMany({
    data: {
      balance: 0,
      activeDeposit: 0,
      totalEarned: 0,
      totalCommission: 0,
      operationalCapital: 0,
      pendingIntegration: 0,
      sponsoredGoalAmount: 0,
      sponsoredGiftedAmount: 0,
      sponsoredDirectSales: 0
    }
  });
  console.log(`Reset balances for ${updatedUsers.count} users.`);

  // 3. Clear all mock financial records so the dashboard is clean
  const delTx = await prisma.transaction.deleteMany({});
  const delInv = await prisma.investment.deleteMany({});
  const delRoi = await prisma.dailyROIEntry.deleteMany({});
  const delPending = await prisma.pendingProfitEntry.deleteMany({});
  const delWd = await prisma.withdrawal.deleteMany({});
  const delComm = await prisma.commission.deleteMany({});
  const delPlisio = await prisma.plisioInvoice.deleteMany({});

  console.log('Cleared all financial transactions and investments.');
  console.log('Done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
