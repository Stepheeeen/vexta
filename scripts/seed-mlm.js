const dotenv = require('dotenv');
dotenv.config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Seeding MLM upline chain (User A > B > C > D > E > F)...');

  const emails = [
    'usera@test.com',
    'userb@test.com',
    'userc@test.com',
    'userd@test.com',
    'usere@test.com',
    'userf@test.com',
  ];

  // Cleanup existing transactions and users in the chain
  await prisma.transaction.deleteMany({
    where: { user: { email: { in: emails } } }
  });
  await prisma.referralLink.deleteMany({
    where: { referred: { email: { in: emails } } }
  });
  // Disconnect uplines to prevent referential integrity check failures on delete
  await prisma.user.updateMany({
    where: { email: { in: emails } },
    data: { uplineId: null }
  });
  await prisma.user.deleteMany({
    where: { email: { in: emails } }
  });

  const passwordHash = await bcrypt.hash('Password@123', 12);

  const createUser = async (email, firstName, lastName, referralCode, uplineId = null) => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        referralCode,
        uplineId,
        referredById: uplineId,
        isVerified: true,
        balance: 0.0,
        activeDeposit: 0.0,
        planRate: 1.0, // 1.0% daily profit
        totalEarned: 0.0,
        totalCommission: 0.0,
      }
    });

    if (uplineId) {
      await prisma.referralLink.create({
        data: {
          referrerId: uplineId,
          referredId: user.id
        }
      });
    }

    return user;
  };

  // Create chain
  const userA = await createUser('usera@test.com', 'User', 'A', 'REF_A');
  const userB = await createUser('userb@test.com', 'User', 'B', 'REF_B', userA.id);
  const userC = await createUser('userc@test.com', 'User', 'C', 'REF_C', userB.id);
  const userD = await createUser('userd@test.com', 'User', 'D', 'REF_D', userC.id);
  const userE = await createUser('usere@test.com', 'User', 'E', 'REF_E', userD.id);
  const userF = await createUser('userf@test.com', 'User', 'F', 'REF_F', userE.id);

  console.log('  ✓ User A created (Top Level):', userA.id);
  console.log('  ✓ User B created (Referred by A):', userB.id, '-> upline:', userB.uplineId);
  console.log('  ✓ User C created (Referred by B):', userC.id, '-> upline:', userC.uplineId);
  console.log('  ✓ User D created (Referred by C):', userD.id, '-> upline:', userD.uplineId);
  console.log('  ✓ User E created (Referred by D):', userE.id, '-> upline:', userE.uplineId);
  console.log('  ✓ User F created (Referred by E):', userF.id, '-> upline:', userF.uplineId);

  // Initialize Settings model if empty
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    await prisma.settings.create({
      data: { lastDailyRun: null }
    });
    console.log('  ✓ Global Settings record initialized.');
  }

  console.log('✅ MLM Seeding completed!');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
