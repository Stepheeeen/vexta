import { prisma } from '../lib/prisma';

async function main() {
  const email = 'bzwane940@gmail.com';
  const txnId = '6a38c14233fb4c0895003214';
  const txHash = '0xc55adf9715b944b2efee006fc5858eeb41cb2e9eb6d781594c8614beeeb4d819';
  const amount = 19.00; // Expected invoice amount

  console.log(`Manually crediting mismatch deposit of $${amount} for ${email}...`);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('❌ User not found.');
    return;
  }

  const invoice = await prisma.plisioInvoice.findUnique({ where: { txnId } });
  if (!invoice) {
    console.error('❌ Plisio invoice not found.');
    return;
  }

  if (invoice.activatedAt) {
    console.log('⚠️ Invoice is already activated. Skipping.');
    return;
  }

  // Perform database update inside transaction to ensure consistency
  await prisma.$transaction(async (tx) => {
    // 1. Credit user balance and activeDeposit
    await tx.user.update({
      where: { id: user.id },
      data: {
        balance: { increment: amount },
        activeDeposit: { increment: amount }
      }
    });

    // 2. Create Transaction record
    await tx.transaction.create({
      data: {
        userId: user.id,
        type: 'deposit',
        amount: amount,
        status: 'completed',
        description: 'USDT BEP-20 deposit via Plisio (Manual Mismatch Resolution)',
        reference: txnId,
        metadata: JSON.stringify({ txnId, txHash, network: 'BEP20', actual_received: 19.01 })
      }
    });

    // 3. Update PlisioInvoice
    await tx.plisioInvoice.update({
      where: { id: invoice.id },
      data: {
        status: 'completed',
        activatedAt: new Date(),
        plisioTxHash: txHash
      }
    });
  });

  console.log(`\n✅ Successfully manually resolved and credited $${amount} to user ${email}!`);
  
  // Verify final user state
  const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
  console.log('Updated User State:', JSON.stringify({
    email: updatedUser?.email,
    balance: updatedUser?.balance,
    activeDeposit: updatedUser?.activeDeposit
  }, null, 2));
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
