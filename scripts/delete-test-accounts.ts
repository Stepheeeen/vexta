import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting deletion of @test.com accounts...');

  const usersToDelete = await prisma.user.findMany({
    where: { email: { endsWith: '@test.com' } },
    select: { id: true }
  });
  
  if (usersToDelete.length === 0) {
    console.log('No @test.com accounts found.');
    return;
  }

  const userIds = usersToDelete.map(u => u.id);

  // Manually delete related ReferralLinks first
  await prisma.referralLink.deleteMany({
    where: {
      OR: [
        { referrerId: { in: userIds } },
        { referredId: { in: userIds } }
      ]
    }
  });

  // Nullify any downline's uplineId that references the users being deleted
  await prisma.user.updateMany({
    where: { uplineId: { in: userIds } },
    data: { uplineId: null }
  });

  // Now delete the users
  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { in: userIds } }
  });
  
  console.log(`Deleted ${deletedUsers.count} accounts ending with @test.com.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
