import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    data: {
      balance: 0,
    }
  });
  console.log('Reset all user balances to 0.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
