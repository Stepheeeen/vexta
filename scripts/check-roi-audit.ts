import { prisma } from '../lib/prisma';

async function main() {
  console.log('=== INVESTIGATING CRON & ROI FAILURES ===\n');

  // Check Settings table
  const settings = await prisma.settings.findFirst();
  console.log('Settings State:', JSON.stringify(settings, null, 2));

  // Check AdminAuditLog for ROI actions
  const logs = await prisma.adminAuditLog.findMany({
    where: {
      action: { in: ['CRON_DAILY_ROI_SUCCESS', 'CRON_DAILY_ROI_FAILURE', 'DAILY_ROI'] }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  console.log(`\nFound ${logs.length} ROI Audit Log Entries:`);
  logs.forEach(log => {
    console.log(`[${log.createdAt.toISOString()}] Action: ${log.action} | Details: ${log.details}`);
  });

  // Check recent DailyROIEntry records
  const recentRoiEntries = await prisma.dailyROIEntry.findMany({
    orderBy: { date: 'desc' },
    take: 10,
    include: { investment: { select: { id: true, userId: true, amount: true } } }
  });

  console.log(`\nRecent DailyROIEntry Records (${recentRoiEntries.length}):`);
  recentRoiEntries.forEach(entry => {
    console.log(`[${entry.date.toISOString()}] Amount: $${entry.amount} | InvID: ${entry.investmentId} (User: ${entry.investment?.userId})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
