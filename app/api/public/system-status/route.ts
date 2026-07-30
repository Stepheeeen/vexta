import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let settings = null;
    try {
      settings = await prisma.settings.findFirst();
    } catch (err) {
      console.warn('[system-status] Unable to fetch settings from DB, using env fallback');
    }

    const envMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' || process.env.MAINTENANCE_MODE === 'true';
    const envDisableReg = process.env.NEXT_PUBLIC_DISABLE_REGISTRATION === 'true' || process.env.DISABLE_REGISTRATION === 'true';
    const envMigrationNotice = process.env.NEXT_PUBLIC_MIGRATION_NOTICE === 'true' || process.env.MIGRATION_NOTICE === 'true';

    const maintenanceMode = envMaintenance || Boolean(settings?.maintenanceMode);
    // Registrations allowed if NOT disabled by env AND settings.newRegistrations is true (default true)
    const newRegistrations = !envDisableReg && (settings?.newRegistrations ?? true);
    const migrationNotice = envMigrationNotice || maintenanceMode || !newRegistrations;

    return NextResponse.json({
      maintenanceMode,
      newRegistrations,
      migrationNotice,
      noticeText: {
        title: 'Official Server Migration Notice',
        message: 'VEXTA is currently being migrated to its official servers following the successful conclusion of our Beta Testing phase.',
        reassurance: 'All user accounts, balance records, and funds are 100% safe and secure.'
      }
    });
  } catch (error) {
    console.error('[system-status]', error);
    return NextResponse.json({
      maintenanceMode: false,
      newRegistrations: true,
      migrationNotice: false
    });
  }
}
