/**
 * VEXTA v2 Investment Migration Script
 *
 * One-time migration that backfills the new compounding fields on existing investments:
 *   - Investment.activeCapital   = amount + bonusAmount (current field)
 *   - Investment.tierBonus       = bonusAmount (existing field copy)
 *   - Investment.businessDaysElapsed = count of business days since startDate
 *   - User.operationalCapital    = sum of all active investment activeCapitals
 *
 * Run with:
 *   npx ts-node --project tsconfig.json scripts/migrate-investments-v2.ts
 *
 * SAFE TO RUN MULTIPLE TIMES — idempotent.
 */

import { PrismaClient } from '@prisma/client';
import { countBusinessDaysBetween } from '../lib/roi-engine';

const prisma = new PrismaClient();

async function main() {
  console.log('=== VEXTA v2 Investment Migration ===');
  const startTime = Date.now();

  // 1. Migrate all investments
  const investments = await prisma.investment.findMany({
    where: { status: { in: ['active', 'completed'] } },
    include: { user: { select: { id: true } } },
  });

  console.log(`Found ${investments.length} investments to migrate.`);

  let migratedCount = 0;

  for (const inv of investments) {
    const tierBonus     = inv.bonusAmount ?? 0;
    const activeCapital = +(inv.amount + tierBonus).toFixed(2);

    // Count business days elapsed from startDate to today (or endDate if completed)
    const refDate = inv.status === 'completed' ? inv.endDate : new Date();
    const businessDaysElapsed = countBusinessDaysBetween(inv.startDate, refDate);

    // Only update if not already migrated (idempotency check on activeCapital)
    if (inv.activeCapital === 0) {
      await prisma.investment.update({
        where: { id: inv.id },
        data: {
          activeCapital,
          tierBonus,
          businessDaysElapsed: Math.min(businessDaysElapsed, 200),
        },
      });
      migratedCount++;
    } else {
      console.log(`  [SKIP] Investment ${inv.id} already has activeCapital=${inv.activeCapital}`);
    }
  }

  console.log(`Migrated ${migratedCount} investments.`);

  // 2. Recalculate operationalCapital for every user
  const users = await prisma.user.findMany({
    include: {
      investments: {
        where: { status: 'active' },
        select: { activeCapital: true },
      },
    },
  });

  console.log(`Recalculating operationalCapital for ${users.length} users...`);
  let userUpdated = 0;

  for (const user of users) {
    const operationalCapital = user.investments.reduce(
      (sum, inv) => sum + (inv.activeCapital ?? 0),
      0
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        operationalCapital: +operationalCapital.toFixed(2),
        pendingIntegration: 0, // Clean slate — existing investments get no pending queue history
      },
    });
    userUpdated++;
  }

  console.log(`Updated ${userUpdated} users.`);
  console.log(`\n✅ Migration complete in ${Date.now() - startTime}ms.`);
  console.log('\nNext steps:');
  console.log('  1. Run `npx prisma generate` to regenerate the Prisma client.');
  console.log('  2. Verify a few investments in Prisma Studio: `npm run db:studio`');
  console.log('  3. Deploy and monitor the first cron run.');
}

main()
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
