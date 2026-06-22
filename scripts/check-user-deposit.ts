import { prisma } from '../lib/prisma';

async function main() {
  const email = 'bzwane940@gmail.com';
  console.log(`Checking user and deposits for: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      plisioInvoices: true,
      transactions: true,
      investments: true,
    }
  });

  if (!user) {
    console.log('❌ User not found in database.');
    return;
  }

  console.log('\n=== USER RECORD ===');
  console.log(JSON.stringify({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isVerified: user.isVerified,
    balance: user.balance,
    activeDeposit: user.activeDeposit,
    operationalCapital: user.operationalCapital,
    createdAt: user.createdAt,
  }, null, 2));

  console.log('\n=== PLISIO INVOICES ===');
  if (user.plisioInvoices.length === 0) {
    console.log('No Plisio invoices found.');
  } else {
    user.plisioInvoices.forEach((inv, i) => {
      console.log(`[Invoice #${i + 1}]`);
      console.log(JSON.stringify(inv, null, 2));
    });
  }

  console.log('\n=== TRANSACTIONS ===');
  if (user.transactions.length === 0) {
    console.log('No transactions found.');
  } else {
    user.transactions.forEach((tx, i) => {
      console.log(`[Transaction #${i + 1}]`);
      console.log(JSON.stringify(tx, null, 2));
    });
  }

  console.log('\n=== INVESTMENTS ===');
  if (user.investments.length === 0) {
    console.log('No investments found.');
  } else {
    user.investments.forEach((inv, i) => {
      console.log(`[Investment #${i + 1}]`);
      console.log(JSON.stringify(inv, null, 2));
    });
  }
}

main()
  .catch((err) => console.error(err))
  .finally(() => prisma.$disconnect());
