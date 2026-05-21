import { prisma } from '../lib/prisma';

async function main() {
  const email = 'stephenon56@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.error(`User ${email} not found.`);
    return;
  }

  console.log(`Found user: ${user.firstName} ${user.lastName} (ID: ${user.id})`);
  console.log(`Current persisted balance: $${user.balance}`);

  // Create system balance correction transaction
  const txn = await prisma.transaction.create({
    data: {
      userId: user.id,
      type: 'deposit',
      amount: 2000,
      status: 'completed',
      description: 'System Balance Correction',
    }
  });
  console.log(`Created transaction: ${txn.id}`);

  // Increment user's persisted balance
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      balance: { increment: 2000 }
    }
  });

  console.log(`New persisted balance: $${updatedUser.balance}`);
  console.log('Balance correction completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
