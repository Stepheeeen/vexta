// Standalone seed script — run with: node scripts/seed.mjs

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const dotenv = require('dotenv');
dotenv.config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const plans = [
  { name: 'STARTER PLAN', tag: 'STARTER PLAN', minDeposit: 10,   dailyROI: 0.010, duration: 9999 },
];

async function seed() {
  console.log('\n🌱  Seeding Vexta MongoDB database...\n');

  // ── Plans ─────────────────────────────────────────────────────────────────
  const seededPlans = [];
  for (const p of plans) {
    const res = await prisma.plan.upsert({
      where: { name: p.name },
      update: { minDeposit: p.minDeposit, dailyROI: p.dailyROI, duration: p.duration },
      create: p
    });
    seededPlans.push(res);
  }
  console.log('  ✓ Plans seeded (STARTER)');

  // ── Admin user ────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vexta.app' },
    update: { role: 'admin' },
    create: {
      email: 'admin@vexta.app',
      passwordHash: await require('bcryptjs').hash('Admin@1234!', 12),
      firstName: 'Vexta',
      lastName: 'Admin',
      referralCode: 'VXT_VA_ADMIN',
      isVerified: true,
      role: 'admin',
      country: 'United States',
      whatsappOrTelegram: '+1234567890',
    },
  });
  console.log('  ✓ Admin: admin@vexta.app  /  Admin@1234!');

  // ── Demo user ─────────────────────────────────────────────────────────────
  const john = await prisma.user.upsert({
    where: { email: 'john@vexta.demo' },
    update: {},
    create: {
      email: 'john@vexta.demo',
      passwordHash: await require('bcryptjs').hash('Demo@1234', 12),
      firstName: 'John',
      lastName: 'Doe',
      referralCode: 'VXT_JD_DEMO1',
      isVerified: true,
      country: 'United States',
      whatsappOrTelegram: '+19876543210',
    },
  });
  console.log('  ✓ Demo:  john@vexta.demo  /  Demo@1234');

  // ── Demo investments for John ─────────────────────────────────────────────
  const starterPlan = seededPlans.find(p => p.name === 'STARTER PLAN');

  if (john && starterPlan) {
    const existing = await prisma.investment.findFirst({ where: { userId: john.id } });
    if (!existing) {
      const startB = new Date(); startB.setDate(startB.getDate() - 15);
      const endB   = new Date(startB); endB.setDate(endB.getDate() + starterPlan.duration);
      const invB = await prisma.investment.create({
        data: { userId: john.id, planId: starterPlan.id, amount: 5000, bonusAmount: 500, startDate: startB, endDate: endB, status: 'active', totalEarned: 1500 },
      });
      await prisma.transaction.create({ data: { userId: john.id, type: 'deposit', amount: 5000, status: 'completed', description: 'Investment — STARTER PLAN', reference: invB.id } });
      await prisma.transaction.create({ data: { userId: john.id, type: 'roi',     amount: 1500, status: 'completed', description: 'Accumulated ROI — STARTER PLAN', reference: invB.id } });

      const startC = new Date(); startC.setDate(startC.getDate() - 8);
      const endC   = new Date(startC); endC.setDate(endC.getDate() + starterPlan.duration);
      const invC = await prisma.investment.create({
        data: { userId: john.id, planId: starterPlan.id, amount: 20000, bonusAmount: 2000, startDate: startC, endDate: endC, status: 'active', totalEarned: 4000 },
      });
      await prisma.transaction.create({ data: { userId: john.id, type: 'deposit', amount: 20000, status: 'completed', description: 'Investment — STARTER PLAN', reference: invC.id } });
      await prisma.transaction.create({ data: { userId: john.id, type: 'roi',     amount: 4000,  status: 'completed', description: 'Accumulated ROI — STARTER PLAN', reference: invC.id } });

      // Simulated referral commission
      await prisma.transaction.create({ data: { userId: john.id, type: 'commission', amount: 1320, status: 'completed', description: 'Level 1 referral commission' } });

      console.log('  ✓ John\'s demo investments created');
    } else {
      console.log('  ↩ John\'s investments already exist');
    }
  }

  await prisma.$disconnect();
  console.log('\n✅  Seed complete\n');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
