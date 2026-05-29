const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const deps = await prisma.transaction.findMany({ where: { type: 'deposit' }});
  console.log('Total deposits:', deps.length);
  if (deps.length > 0) {
    console.log('Sample deposit:', deps[0]);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
