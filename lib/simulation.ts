/**
 * Simulation Engine
 * Generates realistic mock data for testing and demo purposes.
 * Call POST /api/admin/simulate to run.
 */

import { prisma } from './prisma';
import { hashPassword, generateReferralCode } from './auth';
import { propagateCommissions } from './referral-engine';
import { processDailyROI } from './roi-engine';

const DEMO_USERS = [
  { firstName: 'John',    lastName: 'Doe',     email: 'john@vexta.demo',    password: 'Demo@1234' },
  { firstName: 'Marcus',  lastName: 'Osei',    email: 'marcus@vexta.demo',  password: 'Demo@1234' },
  { firstName: 'Fatima',  lastName: 'Abubakar',email: 'fatima@vexta.demo',  password: 'Demo@1234' },
  { firstName: 'Liam',    lastName: 'Kim',     email: 'liam@vexta.demo',    password: 'Demo@1234' },
  { firstName: 'Amira',   lastName: 'Saleh',   email: 'amira@vexta.demo',   password: 'Demo@1234' },
  { firstName: 'Carlos',  lastName: 'Vega',    email: 'carlos@vexta.demo',  password: 'Demo@1234' },
];

export async function runSimulation(days = 30): Promise<{ message: string; stats: Record<string, number> }> {
  console.log('[Simulation] Starting...');

  // 1. Create demo users
  const createdUsers: { id: string; referralCode: string }[] = [];
  for (const u of DEMO_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      createdUsers.push({ id: existing.id, referralCode: existing.referralCode });
      continue;
    }
    const code = generateReferralCode(u.firstName, u.lastName);
    const user = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash: await hashPassword(u.password),
        firstName: u.firstName,
        lastName: u.lastName,
        referralCode: code,
        isVerified: true,
        country: 'United States',
        whatsappOrTelegram: '+1234567890',
      },
    });
    createdUsers.push({ id: user.id, referralCode: user.referralCode });
  }

  // 2. Create referral chain: john → marcus → fatima → liam → amira → carlos
  const referralChain = [
    { referrerId: createdUsers[0].id, referredId: createdUsers[1].id },
    { referrerId: createdUsers[1].id, referredId: createdUsers[2].id },
    { referrerId: createdUsers[2].id, referredId: createdUsers[3].id },
    { referrerId: createdUsers[3].id, referredId: createdUsers[4].id },
    { referrerId: createdUsers[4].id, referredId: createdUsers[5].id },
  ];
  for (const link of referralChain) {
    await prisma.referralLink.upsert({
      where: { referredId: link.referredId },
      update: {},
      create: link,
    });
    await prisma.user.update({
      where: { id: link.referredId },
      data: {
        uplineId: link.referrerId,
        referredById: link.referrerId,
      },
    });
  }

  // 3. Get plans
  const plans = await prisma.plan.findMany();
  if (!plans.length) throw new Error('No plans found. Run upsertPlans() first.');

  // 4. Create investments for each user
  const planA = plans.find((p) => p.name === 'Starter Plan')!;
  const planB = plans.find((p) => p.name === 'Prime Plan')!;
  const planC = plans.find((p) => p.name === 'Ultra Plan')!;

  const investmentConfig = [
    { userId: createdUsers[0].id, plan: planC, amount: 20000 }, // John — Ultra Plan
    { userId: createdUsers[1].id, plan: planC, amount: 5000 },  // Marcus — Ultra Plan
    { userId: createdUsers[2].id, plan: planB, amount: 2000 },  // Fatima — Prime Plan
    { userId: createdUsers[3].id, plan: planA, amount: 500 },   // Liam — Starter Plan
    { userId: createdUsers[4].id, plan: planA, amount: 200 },   // Amira — Starter Plan
    { userId: createdUsers[5].id, plan: planA, amount: 100 },   // Carlos — Starter Plan
  ];

  let investmentsCreated = 0;
  let commissionsProcessed = 0;

  for (const cfg of investmentConfig) {
    const existing = await prisma.investment.findFirst({ where: { userId: cfg.userId } });
    if (existing) continue;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * days));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + cfg.plan.duration);

    let bonusAmount = 0;
    if (cfg.amount >= 3000) {
      bonusAmount = cfg.amount * 0.30;
    } else if (cfg.amount >= 1000) {
      bonusAmount = cfg.amount * 0.10;
    }

    const investment = await prisma.investment.create({
      data: {
        userId: cfg.userId,
        planId: cfg.plan.id,
        amount: cfg.amount,
        bonusAmount,
        startDate,
        endDate,
        status: new Date() > endDate ? 'completed' : 'active',
      },
    });

    // Record deposit transaction
    await prisma.transaction.create({
      data: {
        userId: cfg.userId,
        type: 'deposit',
        amount: cfg.amount,
        status: 'completed',
        description: `Investment — ${cfg.plan.name}`,
        reference: investment.id,
      },
    });

    investmentsCreated++;

    // Propagate commissions from this investment
    const commissions = await propagateCommissions(cfg.userId, investment.id, cfg.amount);
    commissionsProcessed += commissions.length;
  }

  // 5. Simulate daily ROI for the past `days` days
  const { processed: roiProcessed, totalPaid } = await processDailyROI();

  console.log('[Simulation] Complete.');
  return {
    message: `Simulation complete (${days} days simulated)`,
    stats: {
      usersCreated: createdUsers.length,
      investmentsCreated,
      commissionsDistributed: commissionsProcessed,
      dailyROIEntriesProcessed: roiProcessed,
      totalROIPaid: totalPaid,
    },
  };
}

export async function resetSimulation() {
  // Wipe in correct dependency order
  await prisma.dailyROIEntry.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.referralLink.deleteMany();
  await prisma.user.deleteMany({ where: { email: { endsWith: '@vexta.demo' } } });
  return { message: 'Simulation data cleared' };
}
