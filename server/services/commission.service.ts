import { prisma } from '../../lib/prisma';

/**
 * Distributes unilevel commissions up to 16 levels for a given deposit.
 * 
 * @param depositUserId The ID of the user who made the deposit
 * @param depositAmount The amount of the deposit
 */
export async function distributeUnilevelCommission(depositUserId: string, depositAmount: number): Promise<void> {
  console.log(`[UNILEVEL] Starting commission distribution for user ${depositUserId}, amount: ${depositAmount}`);

  const rates = [
    0.08, 0.04, 0.02, 0.01, 0.01,         // L1 - L5
    0.005, 0.005, 0.005, 0.005, 0.005,    // L6 - L10
    0.0025, 0.0025, 0.0025, 0.0025, 0.0025, 0.0025 // L11 - L16
  ];

  // 1. Fetch the depositing user to get the upline ID
  const depositor = await prisma.user.findUnique({
    where: { id: depositUserId },
    select: { uplineId: true, email: true }
  });

  if (!depositor) {
    console.warn(`[UNILEVEL] Depositing user ${depositUserId} not found. Skipping commission.`);
    return;
  }

  let currentUplineId = depositor.uplineId;

  // 2. Distribute commissions through the upline chain
  for (let i = 0; i < rates.length; i++) {
    if (!currentUplineId) {
      console.log(`[UNILEVEL] Upline chain ended at level ${i + 1}.`);
      break;
    }

    const rate = rates[i];
    const commissionAmount = Number((depositAmount * rate).toFixed(2));

    try {
      // Find the upline user details
      const uplineUser = await prisma.user.findUnique({
        where: { id: currentUplineId },
        select: { id: true, firstName: true, lastName: true, email: true, uplineId: true }
      });

      if (!uplineUser) {
        console.warn(`[UNILEVEL] Upline user ID ${currentUplineId} at level ${i + 1} not found. Skipping level.`);
        // Note: do not break here, just move to next if uplineUser.uplineId exists, though normally if user is not found, we can't find their upline either.
        break;
      }

      if (commissionAmount > 0) {
        // Increment upline balance and totalCommission
        await prisma.user.update({
          where: { id: uplineUser.id },
          data: {
            balance: { increment: commissionAmount },
            totalCommission: { increment: commissionAmount }
          }
        });

        // Create transaction history
        await prisma.transaction.create({
          data: {
            userId: uplineUser.id,
            type: 'commission',
            amount: commissionAmount,
            status: 'completed',
            fromUserId: depositUserId,
            level: i + 1,
            description: `Level ${i + 1} commission from deposit`
          }
        });

        console.log(`UNILEVEL: Level ${i + 1} | Paid $${commissionAmount.toFixed(2)} to ${uplineUser.firstName} ${uplineUser.lastName} (${uplineUser.email})`);
      }

      // Move up to the next level
      currentUplineId = uplineUser.uplineId;
    } catch (err) {
      console.error(`[UNILEVEL] Failed to process level ${i + 1} for upline ${currentUplineId}:`, err);
      // Fail-silent constraint: do not halt the entire process if one level fails
      break;
    }
  }
}
