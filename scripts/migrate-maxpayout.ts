/**
 * migrate-maxpayout.ts
 *
 * One-time migration: sets maxPayout = amount * 2 for every existing
 * Investment that has maxPayout = 0 (i.e., was created before the field existed).
 *
 * Also marks any investment where totalEarned >= maxPayout as 'completed'
 * and zeros its activeCapital so the ROI engine skips it going forward.
 *
 * Run with:
 *   npx ts-node --project tsconfig.json scripts/migrate-maxpayout.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[MIGRATE] Starting maxPayout backfill...');

  // 1. Fetch all investments that need the cap set
  const investments = await prisma.investment.findMany({
    where: { maxPayout: 0 },
    select: { id: true, amount: true, totalEarned: true, status: true, activeCapital: true, userId: true },
  });

  console.log(`[MIGRATE] Found ${investments.length} investments without maxPayout.`);

  let updated = 0;
  let completed = 0;

  for (const inv of investments) {
    const maxPayout = +(inv.amount * 2).toFixed(2);
    const alreadyExceeded = inv.totalEarned >= maxPayout && inv.status === 'active';

    await prisma.investment.update({
      where: { id: inv.id },
      data: {
        maxPayout,
        ...(alreadyExceeded ? { status: 'completed', activeCapital: 0 } : {}),
      },
    });

    if (alreadyExceeded) {
      // Decrement operationalCapital and activeDeposit for user since this package is now expired
      await prisma.user.update({
        where: { id: inv.userId },
        data: {
          operationalCapital: { decrement: inv.activeCapital },
          activeDeposit: { decrement: inv.amount },
        },
      });
      console.log(
        `[MIGRATE] Investment ${inv.id} — maxPayout $${maxPayout}, ` +
        `totalEarned $${inv.totalEarned} — COMPLETED (200% already reached)`
      );
      completed++;
    } else {
      console.log(`[MIGRATE] Investment ${inv.id} — maxPayout set to $${maxPayout}`);
    }

    updated++;
  }

  console.log(`\n[MIGRATE] Done. ${updated} investments updated, ${completed} immediately completed (200% already reached).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
