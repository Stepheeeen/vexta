import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('=== Restoring Mismatched Active Capital ===');

  const activeInvestments = await prisma.investment.findMany({
    where: { status: 'active' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          operationalCapital: true
        }
      }
    }
  });

  for (const inv of activeInvestments) {
    const expectedCapital = +(inv.amount + inv.tierBonus).toFixed(2);
    if (inv.activeCapital < expectedCapital) {
      console.log(`Fixing mismatch for ${inv.user.firstName} ${inv.user.lastName} (${inv.user.email}):`);
      console.log(`  - Investment ID: ${inv.id}`);
      console.log(`  - Changing activeCapital from ${inv.activeCapital} to ${expectedCapital}`);

      // Update investment activeCapital
      await prisma.investment.update({
        where: { id: inv.id },
        data: { activeCapital: expectedCapital }
      });
    }
  }

  // Recalculate operationalCapital for all affected users
  const users = await prisma.user.findMany({
    include: {
      investments: {
        where: { status: 'active' },
        select: { activeCapital: true },
      },
    },
  });

  console.log('\nRecalculating operationalCapital for users...');
  for (const user of users) {
    const operationalCapital = user.investments.reduce(
      (sum, inv) => sum + (inv.activeCapital ?? 0),
      0
    );

    if (user.operationalCapital !== operationalCapital) {
      console.log(`Updating operationalCapital for ${user.firstName} ${user.lastName}:`);
      console.log(`  - Old: ${user.operationalCapital} | New: ${operationalCapital}`);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          operationalCapital: +operationalCapital.toFixed(2),
        },
      });
    }
  }

  console.log('\n✅ Restore and recalculation completed.');
}

main()
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
