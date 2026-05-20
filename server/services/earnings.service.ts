import { prisma } from '../../lib/prisma';

/**
 * Runs the daily arbitrage profit / ROI distribution for active users.
 * 
 * @param bypassWeekendCheck If true, bypasses the Monday-Friday day-of-week validation
 * @returns {Promise<{usersPaid: number, totalDistributed: number}>} Summary of run
 */
export async function runDailyRoiDistribution(bypassWeekendCheck = false): Promise<{ usersPaid: number; totalDistributed: number }> {
  console.log('[ROI] Starting daily arbitrage distribution...');

  // 1. Check if weekend (Monday-Friday only)
  if (!bypassWeekendCheck) {
    const dayOfWeek = new Date().getDay(); // 0 is Sunday, 6 is Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new Error('ROI distribution only runs Monday through Friday');
    }
  }

  // 2. Get or create settings document
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({
      data: { lastDailyRun: null }
    });
  }

  // 3. Check if already run today
  if (settings.lastDailyRun) {
    const lastRun = new Date(settings.lastDailyRun);
    const today = new Date();
    
    const isSameDay =
      lastRun.getFullYear() === today.getFullYear() &&
      lastRun.getMonth() === today.getMonth() &&
      lastRun.getDate() === today.getDate();

    if (isSameDay) {
      throw new Error('Already ran today');
    }
  }

  // 4. Find active users with active deposits
  const activeUsers = await prisma.user.findMany({
    where: {
      activeDeposit: { gt: 0 },
      isActive: true
    }
  });

  console.log(`[ROI] Found ${activeUsers.length} active users eligible for ROI.`);

  let usersPaid = 0;
  let totalDistributed = 0;

  for (const user of activeUsers) {
    try {
      const maxEarnings = Number((user.activeDeposit * 3.0).toFixed(2));
      
      // If user has already reached 300% ROI, skip
      if (user.totalEarned >= maxEarnings) {
        console.log(`ROI: User ${user.email} has reached the 300% ROI limit ($${user.totalEarned.toFixed(2)} / $${maxEarnings.toFixed(2)}). Skipping.`);
        continue;
      }

      let dailyProfit = Number((user.activeDeposit * (user.planRate / 100)).toFixed(2));
      
      // Cap at 300% if the next payment would exceed the limit
      if (user.totalEarned + dailyProfit > maxEarnings) {
        dailyProfit = Number((maxEarnings - user.totalEarned).toFixed(2));
      }

      if (dailyProfit <= 0) continue;

      // Increment user balance and totalEarned
      await prisma.user.update({
        where: { id: user.id },
        data: {
          balance: { increment: dailyProfit },
          totalEarned: { increment: dailyProfit }
        }
      });

      // Create Transaction
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'daily_roi',
          amount: dailyProfit,
          status: 'completed',
          description: 'Daily arbitrage profit'
        }
      });

      console.log(`ROI: Paid $${dailyProfit.toFixed(2)} to ${user.firstName} ${user.lastName} (${user.email})`);
      
      usersPaid++;
      totalDistributed = Number((totalDistributed + dailyProfit).toFixed(2));
    } catch (userErr) {
      console.error(`[ROI] Failed to process user ${user.id}:`, userErr);
    }
  }

  // 4. Update last daily run settings
  await prisma.settings.update({
    where: { id: settings.id },
    data: { lastDailyRun: new Date() }
  });

  console.log(`[ROI] Daily distribution complete. Paid ${usersPaid} users. Total: $${totalDistributed.toFixed(2)}`);

  return {
    usersPaid,
    totalDistributed
  };
}
