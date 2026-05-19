/**
 * Prisma seed file
 * Run: npx prisma db seed
 * Or:  ts-node --project tsconfig.json prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword, generateReferralCode } from '../lib/auth';
import { upsertPlans } from '../lib/roi-engine';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Seed plans
  await upsertPlans();
  console.log('  ✓ Plans seeded');

  // 2. Admin / demo user
  const adminEmail = 'admin@vexta.app';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await hashPassword('Admin@1234!'),
        firstName: 'Vexta',
        lastName: 'Admin',
        referralCode: generateReferralCode('Vexta', 'Admin'),
        isVerified: true,
      },
    });
    console.log('  ✓ Admin user created — admin@vexta.app / Admin@1234!');
  } else {
    console.log('  ↩ Admin user already exists');
  }

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
