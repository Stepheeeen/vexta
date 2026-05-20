import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await params;

    const tree = [];
    let currentLevelUserIds = [userId];

    for (let level = 1; level <= 5; level++) {
      const downlines = await prisma.user.findMany({
        where: {
          uplineId: { in: currentLevelUserIds }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          activeDeposit: true,
          balance: true,
          totalCommission: true,
          totalEarned: true,
          uplineId: true,
          createdAt: true
        }
      });

      if (downlines.length === 0) {
        break;
      }

      tree.push({
        level,
        users: downlines.map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          activeDeposit: u.activeDeposit,
          balance: u.balance,
          totalCommission: u.totalCommission,
          totalEarned: u.totalEarned,
          uplineId: u.uplineId,
          joinedAt: u.createdAt
        }))
      });

      currentLevelUserIds = downlines.map(u => u.id);
    }

    return NextResponse.json({ tree });
  } catch (err: any) {
    console.error('[admin/downline]', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
