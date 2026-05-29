import { prisma } from './prisma';

export async function logAdminAction(
  adminId: string,
  userId: string | null,
  action: string,
  details?: string
) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        userId,
        action,
        details,
      },
    });
  } catch (error) {
    console.error('[AuditLogger] Failed to log admin action:', error);
  }
}
