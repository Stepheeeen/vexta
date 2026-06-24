import { prisma } from '../../lib/prisma';
import { processDailyROI } from '../../lib/roi-engine';

/**
 * Runs the full daily ROI distribution for active investments.
 *
 * This is the main entry-point called by the /api/admin/run-daily-roi cron route.
 *
 * Delegates to lib/roi-engine.ts which generates today's 1% daily returns on current activeCapital.
 *
 * @param bypassWeekendCheck If true, bypasses the Monday–Friday day-of-week validation.
 */
export async function runDailyRoiDistribution(
  bypassWeekendCheck = false
): Promise<{ usersPaid: number; totalDistributed: number }> {
  console.log('[EarningsService] Starting daily ROI distribution...');

  // Guard: check day-of-week (Monday–Friday only)
  if (!bypassWeekendCheck) {
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new Error('ROI distribution only runs Monday through Friday');
    }
  }

  // Guard: check settings to prevent double-run on same calendar day
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({ data: { lastDailyRun: null } });
  }

  if (settings.lastDailyRun) {
    const lastRun = new Date(settings.lastDailyRun);
    const today = new Date();
    // ← Use UTC dates to avoid timezone-related double-run or skip bugs
    const isSameDay =
      lastRun.getUTCFullYear() === today.getUTCFullYear() &&
      lastRun.getUTCMonth()    === today.getUTCMonth()    &&
      lastRun.getUTCDate()     === today.getUTCDate();

    if (isSameDay) {
      throw new Error('Already ran today');
    }
  }

  // Dead-man switch: if isRoiRunning has been true for > 2 hours, the previous
  // run crashed mid-way. Auto-reset the lock so today's run can proceed.
  if ((settings as any).isRoiRunning) {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const lastRunTime = settings.lastDailyRun ? new Date(settings.lastDailyRun) : null;
    const isStale = !lastRunTime || lastRunTime < twoHoursAgo;

    if (isStale) {
      console.warn('[EarningsService] ⚠️  Dead-man switch triggered: resetting stale isRoiRunning lock (was stuck > 2 hours)');
      await (prisma.settings as any).update({
        where: { id: settings.id },
        data: { isRoiRunning: false }
      });
      (settings as any).isRoiRunning = false; // update local reference
    } else {
      throw new Error('ROI distribution is already running. Please wait.');
    }
  }

  // Attempt to acquire lock atomically
  const locked = await (prisma.settings as any).updateMany({
    where: { id: settings.id, isRoiRunning: false },
    data: { isRoiRunning: true }
  });

  if (locked.count === 0) {
    throw new Error('Failed to acquire ROI distribution lock. Another process may be running.');
  }

  let result: { processed: number, totalPaid: number };
  try {
    // Run the ROI engine
    result = await processDailyROI(bypassWeekendCheck);
  } finally {
    // Always release the lock, even if the engine throws
    await (prisma.settings as any).update({
      where: { id: settings.id },
      data:  { lastDailyRun: new Date(), isRoiRunning: false },
    });
  }

  console.log(
    `[EarningsService] Complete. ` +
    `Paid ${result.processed} investments ($${result.totalPaid.toFixed(2)}).`
  );

  return {
    usersPaid:       result.processed,
    totalDistributed: result.totalPaid,
  };
}
