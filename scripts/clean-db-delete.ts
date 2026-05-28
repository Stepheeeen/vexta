import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const unverified = await prisma.user.deleteMany({
    where: { isVerified: false }
  });
  console.log(`Deleted ${unverified.count} unverified accounts.`);

  const testAccounts = await prisma.user.deleteMany({
    where: {
      email: {
        endsWith: '@test.com'
      }
    }
  });
  console.log(`Deleted ${testAccounts.count} @test.com accounts.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
