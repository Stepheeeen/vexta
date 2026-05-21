import { prisma } from './lib/prisma';
import { getAvailableBalance } from './lib/balance';

async function main() {
  const users = await prisma.user.findMany();
  console.log("--------------------------------------------------------------------------------");
  console.log("USER BALANCE AUDIT:");
  console.log("--------------------------------------------------------------------------------");
  for (const u of users) {
    const dynamicBalance = await getAvailableBalance(u.id);
    console.log(`User: ${u.email} (${u.firstName} ${u.lastName})`);
    console.log(`  ID: ${u.id}`);
    console.log(`  Persisted field (user.balance): $${u.balance}`);
    console.log(`  Dynamic field (getAvailableBalance): $${dynamicBalance}`);
    console.log(`  Active Deposit field: $${u.activeDeposit}`);
    
    // Check their transaction logs to see what has happened
    const txns = await prisma.transaction.findMany({
      where: { userId: u.id },
      orderBy: { createdAt: 'asc' }
    });
    console.log(`  Transactions (${txns.length}):`);
    for (const t of txns) {
      console.log(`    - [${t.type}] [${t.status}] $${t.amount} | ${t.description} (${t.createdAt.toISOString()})`);
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: u.id },
      orderBy: { createdAt: 'asc' }
    });
    console.log(`  Withdrawals (${withdrawals.length}):`);
    for (const w of withdrawals) {
      console.log(`    - [${w.status}] $${w.amount} | ${w.note} (${w.createdAt.toISOString()})`);
    }

    const investments = await prisma.investment.findMany({
      where: { userId: u.id },
      orderBy: { createdAt: 'asc' }
    });
    console.log(`  Investments (${investments.length}):`);
    for (const i of investments) {
      console.log(`    - [${i.status}] $${i.amount} (bonus: $${i.bonusAmount}, earned: $${i.totalEarned}) (${i.createdAt.toISOString()})`);
    }
    console.log("--------------------------------------------------------------------------------");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
