const dotenv = require('dotenv');
dotenv.config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { propagateCommissions } = require('../dist/lib/referral-engine'); // We will build or call the logic directly since we have the Prisma instance

// Helper to assert
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✓ Passed: ${message}`);
}

async function main() {
  console.log('🧪 Starting Sponsorship & Virtual Package Integration Tests...');

  const emails = [
    'test-sponsor@vexta.com',
    'test-leader@vexta.com',
    'test-downline@vexta.com'
  ];

  // Cleanup test users
  await prisma.transaction.deleteMany({ where: { user: { email: { in: emails } } } });
  await prisma.withdrawal.deleteMany({ where: { user: { email: { in: emails } } } });
  await prisma.investment.deleteMany({ where: { user: { email: { in: emails } } } });
  await prisma.referralLink.deleteMany({ where: { referred: { email: { in: emails } } } });
  await prisma.user.updateMany({ where: { email: { in: emails } }, data: { uplineId: null } });
  await prisma.user.deleteMany({ where: { email: { in: emails } } });

  // 1. Create a chain: sponsor -> leader -> downline
  const sponsor = await prisma.user.create({
    data: {
      email: 'test-sponsor@vexta.com',
      passwordHash: 'dummy',
      firstName: 'Sponsor',
      lastName: 'User',
      referralCode: 'TEST_SPONSOR',
      isVerified: true
    }
  });

  const leader = await prisma.user.create({
    data: {
      email: 'test-leader@vexta.com',
      passwordHash: 'dummy',
      firstName: 'Leader',
      lastName: 'User',
      referralCode: 'TEST_LEADER',
      uplineId: sponsor.id,
      referredById: sponsor.id,
      isVerified: true
    }
  });

  await prisma.referralLink.create({
    data: { referrerId: sponsor.id, referredId: leader.id }
  });

  const downline = await prisma.user.create({
    data: {
      email: 'test-downline@vexta.com',
      passwordHash: 'dummy',
      firstName: 'Downline',
      lastName: 'User',
      referralCode: 'TEST_DOWNLINE',
      uplineId: leader.id,
      referredById: leader.id,
      isVerified: true
    }
  });

  await prisma.referralLink.create({
    data: { referrerId: leader.id, referredId: downline.id }
  });

  // Ensure there is at least one active plan in DB
  let plan = await prisma.plan.findFirst({ where: { isActive: true } });
  if (!plan) {
    plan = await prisma.plan.create({
      data: {
        name: 'Test Starter',
        minDeposit: 10,
        maxDeposit: 10000,
        dailyROI: 0.01,
        duration: 365,
        isActive: true
      }
    });
  }

  // ---------------------------------------------------------------------------
  // TEST CASE 1: Virtual Investment does not generate commission
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Case 1: Unilevel Commission Exclusion for Virtual ---');
  
  // Gift virtual package to leader via Prisma logic equivalent to the API
  const giftAmount = 1000;
  const sponsoredGoalAmount = giftAmount * 2; // Goal locked type has goal = 2x gifted
  
  const virtualInv = await prisma.investment.create({
    data: {
      userId: leader.id,
      planId: plan.id,
      amount: giftAmount,
      startDate: new Date(),
      endDate: new Date(),
      status: 'active',
      isVirtual: true
    }
  });

  await prisma.transaction.create({
    data: {
      userId: leader.id,
      type: 'deposit',
      amount: giftAmount,
      status: 'completed',
      description: 'Gifted sponsored package (Virtual)',
      reference: virtualInv.id,
      isVirtual: true
    }
  });

  await prisma.user.update({
    where: { id: leader.id },
    data: {
      isSponsored: true,
      sponsoredType: 'goal_locked',
      sponsoredGiftedAmount: giftAmount,
      sponsoredGoalAmount: sponsoredGoalAmount,
      activeDeposit: giftAmount,
      planRate: plan.dailyROI * 100,
      roiBlocked: true
    }
  });

  // Try propagating commissions
  const { propagateCommissions: localPropagate } = require('../lib/referral-engine');
  const commissions = await localPropagate(leader.id, giftAmount, virtualInv.id);
  assert(commissions.length === 0, 'Virtual investments should generate 0 commissions');

  // Verify that sponsor has received no commission records
  const sponsorTxns = await prisma.transaction.findMany({
    where: { userId: sponsor.id, type: 'commission' }
  });
  assert(sponsorTxns.length === 0, 'Sponsor should have received no commissions from virtual investment');

  // ---------------------------------------------------------------------------
  // TEST CASE 2: Available balances and locks for Goal-Locked Accounts
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Case 2: Balance Pools and Locks (Goal-Locked) ---');
  const { getWithdrawableBalances } = require('../lib/balance');

  // Let's simulate daily ROI profit of $15 generated for leader (Virtual daily_roi)
  await prisma.user.update({
    where: { id: leader.id },
    data: { balance: { increment: 15 } }
  });
  await prisma.transaction.create({
    data: {
      userId: leader.id,
      type: 'daily_roi',
      amount: 15,
      status: 'completed',
      description: 'Daily profit (Virtual)',
      isVirtual: true
    }
  });

  // Fetch balances
  let pools = await getWithdrawableBalances(leader.id);
  assert(pools.availableRoi === 0, 'ROI balance should be locked for goal_locked user below goal');
  assert(pools.blockedRoi === 15, 'Virtual ROI should be blocked');

  // Let's add some commission earnings of $30 (Commissions are real and withdrawable)
  await prisma.user.update({
    where: { id: leader.id },
    data: { balance: { increment: 30 } }
  });
  await prisma.transaction.create({
    data: {
      userId: leader.id,
      type: 'commission',
      amount: 30,
      status: 'completed',
      description: 'Referral commission'
    }
  });

  pools = await getWithdrawableBalances(leader.id);
  assert(pools.availableCommission === 30, 'Referral commission should be fully withdrawable');
  assert(pools.availableRoi === 0, 'ROI balance should still be 0');

  // ---------------------------------------------------------------------------
  // TEST CASE 3: Goal progress increment on real referred downline investments
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Case 3: Direct Sales Goal Progress ---');

  // Create a real investment for downline
  const realInv = await prisma.investment.create({
    data: {
      userId: downline.id,
      planId: plan.id,
      amount: 2500, // Meets the goal of 2000
      startDate: new Date(),
      endDate: new Date(),
      status: 'active',
      isVirtual: false
    }
  });

  await prisma.transaction.create({
    data: {
      userId: downline.id,
      type: 'deposit',
      amount: 2500,
      status: 'completed',
      description: 'Real deposit',
      reference: realInv.id,
      isVirtual: false
    }
  });

  // Call getWithdrawableBalances which will dynamically update the direct sales and check if goal is met
  pools = await getWithdrawableBalances(leader.id);
  
  // Re-fetch leader details
  const updatedLeader = await prisma.user.findUnique({ where: { id: leader.id } });
  assert(updatedLeader.sponsoredDirectSales === 2500, 'Direct sales cache should be dynamically updated to 2500');
  assert(pools.availableRoi === 15, 'ROI balance should now be unlocked since direct sales (2500) >= goal (2000)');
  assert(pools.blockedRoi === 0, 'Blocked ROI should now be 0');

  // ---------------------------------------------------------------------------
  // TEST CASE 4: Free Account restrictions
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Case 4: Free Account restrictions ($12 limit) ---');
  
  // Reset leader status to sponsored type "free"
  await prisma.user.update({
    where: { id: leader.id },
    data: {
      sponsoredType: 'free',
      sponsoredDirectSales: 0,
      sponsoredGoalAmount: 0,
      roiBlocked: false
    }
  });

  // Fetch balances
  pools = await getWithdrawableBalances(leader.id);
  assert(pools.availableRoi === 15, 'Free account ROI available initially before any ROI withdrawals');

  // Simulate historical approved/pending ROI withdrawal of $12
  await prisma.withdrawal.create({
    data: {
      userId: leader.id,
      amount: 12,
      walletAddress: '0x1234567890abcdef',
      network: 'BEP20',
      status: 'approved',
      type: 'roi'
    }
  });

  // Now available ROI should be 0 because ROI withdrawn >= 12 and direct sales < 10
  pools = await getWithdrawableBalances(leader.id);
  assert(pools.availableRoi === 0, 'ROI available should be 0 for Free account after withdrawing $12 with $0 direct sales');

  // Add $15 direct sales by referring an investment (already exists from downline)
  // Let's update leader's direct sales cache by running the query
  await prisma.user.update({
    where: { id: leader.id },
    data: { sponsoredDirectSales: 2500 }
  });

  pools = await getWithdrawableBalances(leader.id);
  assert(pools.availableRoi === 15, 'ROI available should be unlocked after direct sales (2500) >= $10 threshold');

  // ---------------------------------------------------------------------------
  // TEST CASE 5: Funds Freezing
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Case 5: Funds Freezing ---');
  
  // Freeze funds
  await prisma.user.update({
    where: { id: leader.id },
    data: { fundsFrozen: true }
  });

  pools = await getWithdrawableBalances(leader.id);
  assert(pools.availableRoi === 0, 'ROI should be 0 when frozen');
  assert(pools.availableCommission === 0, 'Commission should be 0 when frozen');
  assert(pools.fundsFrozen === true, 'Funds should indicate frozen status');

  // Clean up and disconnect
  await prisma.transaction.deleteMany({ where: { user: { email: { in: emails } } } });
  await prisma.withdrawal.deleteMany({ where: { user: { email: { in: emails } } } });
  await prisma.investment.deleteMany({ where: { user: { email: { in: emails } } } });
  await prisma.referralLink.deleteMany({ where: { referred: { email: { in: emails } } } });
  await prisma.user.updateMany({ where: { email: { in: emails } }, data: { uplineId: null } });
  await prisma.user.deleteMany({ where: { email: { in: emails } } });

  console.log('\n✅ All Sponsorship & Leadership tests passed successfully!');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Error during testing:', err);
  prisma.$disconnect();
  process.exit(1);
});
