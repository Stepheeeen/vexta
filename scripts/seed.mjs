// Standalone seed script — run with: node scripts/seed.mjs

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const dotenv = require('dotenv');
dotenv.config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const plans = [
  { name: 'Plan A', tag: 'Starter',  minDeposit: 100,  dailyROI: 0.015, duration: 30 },
  { name: 'Plan B', tag: 'Popular',  minDeposit: 500,  dailyROI: 0.020, duration: 45 },
  { name: 'Plan C', tag: 'Advanced', minDeposit: 2000, dailyROI: 0.025, duration: 60 },
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
  console.log('  ✓ Plans seeded (Plan A / B / C)');

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
    },
  });
  console.log('  ✓ Demo:  john@vexta.demo  /  Demo@1234');

  // ── Demo investments for John ─────────────────────────────────────────────
  const planB = seededPlans.find(p => p.name === 'Plan B');
  const planC = seededPlans.find(p => p.name === 'Plan C');

  if (john && planB && planC) {
    const existing = await prisma.investment.findFirst({ where: { userId: john.id } });
    if (!existing) {
      const startB = new Date(); startB.setDate(startB.getDate() - 15);
      const endB   = new Date(startB); endB.setDate(endB.getDate() + planB.duration);
      const invB = await prisma.investment.create({
        data: { userId: john.id, planId: planB.id, amount: 5000, startDate: startB, endDate: endB, status: 'active', totalEarned: 1500 },
      });
      await prisma.transaction.create({ data: { userId: john.id, type: 'deposit', amount: 5000, status: 'completed', description: 'Investment — Plan B', reference: invB.id } });
      await prisma.transaction.create({ data: { userId: john.id, type: 'roi',     amount: 1500, status: 'completed', description: 'Accumulated ROI — Plan B', reference: invB.id } });

      const startC = new Date(); startC.setDate(startC.getDate() - 8);
      const endC   = new Date(startC); endC.setDate(endC.getDate() + planC.duration);
      const invC = await prisma.investment.create({
        data: { userId: john.id, planId: planC.id, amount: 20000, startDate: startC, endDate: endC, status: 'active', totalEarned: 4000 },
      });
      await prisma.transaction.create({ data: { userId: john.id, type: 'deposit', amount: 20000, status: 'completed', description: 'Investment — Plan C', reference: invC.id } });
      await prisma.transaction.create({ data: { userId: john.id, type: 'roi',     amount: 4000,  status: 'completed', description: 'Accumulated ROI — Plan C', reference: invC.id } });

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
