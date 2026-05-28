import { prisma } from '../../lib/prisma';
import { processDailyROI } from '../../lib/roi-engine';

/**
 * Runs the full daily ROI distribution for active investments.
 *
 * This is the main entry-point called by the /api/admin/run-daily-roi cron route.
 *
 * Delegates to lib/roi-engine.ts which executes in two phases:
 *   Phase A — Promote pending profits whose 48-business-hour lock has expired.
 *   Phase B — Generate today's 1% daily returns on current activeCapital.
 *
 * @param bypassWeekendCheck If true, bypasses the Monday–Friday day-of-week validation.
 */
export async function runDailyRoiDistribution(
  bypassWeekendCheck = false
): Promise<{ usersPaid: number; totalDistributed: number; promoted: number; amountPromoted: number }> {
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
    const isSameDay =
      lastRun.getFullYear() === today.getFullYear() &&
      lastRun.getMonth()    === today.getMonth()    &&
      lastRun.getDate()     === today.getDate();

    if (isSameDay) {
      throw new Error('Already ran today');
    }
  }

  // Atomic lock check to prevent TOCTOU race condition
  if ((settings as any).isRoiRunning) {
    throw new Error('ROI distribution is already running. Please wait.');
  }

  // Attempt to acquire lock atomically
  const locked = await (prisma.settings as any).updateMany({
    where: { id: settings.id, isRoiRunning: false },
    data: { isRoiRunning: true }
  });

  if (locked.count === 0) {
    throw new Error('Failed to acquire ROI distribution lock. Another process may be running.');
  }

  let result;
  try {
    // Run the two-phase engine
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
    `Phase A promoted ${result.promoted} entries ($${result.amountPromoted.toFixed(2)}). ` +
    `Phase B paid ${result.processed} investments ($${result.totalPaid.toFixed(2)}).`
  );

  return {
    usersPaid:       result.processed,
    totalDistributed: result.totalPaid,
    promoted:        result.promoted,
    amountPromoted:  result.amountPromoted,
  };
}
