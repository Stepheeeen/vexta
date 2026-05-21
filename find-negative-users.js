const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { balance: { lt: 0 } },
        { activeDeposit: { lt: 0 } }
      ]
    }
  });
  console.log("Users with negative/invalid balances:");
  for (const u of users) {
    console.log(`User: ${u.email} (ID: ${u.id})`);
    console.log(`  Persisted Balance Field: ${u.balance}`);
    console.log(`  Active Deposit Field: ${u.activeDeposit}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
