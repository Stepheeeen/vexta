import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/admin/users — Retrieve all users with active balances and referral counts
export async function GET(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';
    const statusFilter = searchParams.get('status') ?? 'All';

    // Find users with optional search filter
    const rawUsers = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
      include: {
        transactions: {
          select: {
            type: true,
            amount: true,
            status: true,
            description: true,
          }
        },
        referralsAsReferrer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUsers = rawUsers
      .map(u => {
        // Calculate user balance dynamically
        let balance = 0;
        u.transactions.forEach(t => {
          if (t.status !== 'failed' && t.status !== 'rejected') {
            const desc = t.description || '';
            const isInvestment = t.type === 'deposit' && desc.includes('Investment activated');

            if (t.type === 'deposit' && !isInvestment) {
              if (t.status === 'completed') {
                balance += t.amount;
              }
            } else if (isInvestment) {
              balance -= t.amount; // Subtract investment principal
            } else if (t.type === 'commission' && t.status === 'completed') {
              balance += t.amount;
            } else if ((t.type === 'roi' || t.type === 'daily_roi') && t.status === 'completed') {
              balance += t.amount;
            } else if (t.type === 'p2p_received' && t.status === 'completed') {
              balance += t.amount;
            } else if (t.type === 'p2p_sent' && t.status === 'completed') {
              balance -= t.amount;
            } else if (t.type === 'withdrawal') {
              if (t.status === 'pending' || t.status === 'completed' || t.status === 'approved') {
                balance -= Math.abs(t.amount);
              }
            }
          }
        });

        // Determine user display status
        let status = 'Active';
        if (!u.isActive) status = 'Suspended';
        else if (!u.isVerified) status = 'Pending';

        return {
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          joined: u.createdAt.toISOString().split('T')[0],
          status,
          balance: `$${Math.max(0, balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          referrals: u.referralsAsReferrer.length,
        };
      })
      .filter(u => {
        if (statusFilter === 'All') return true;
        return u.status === statusFilter;
      });

    return NextResponse.json({ users: formattedUsers });
  } catch (err) {
    console.error('[admin-users-get]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/users — Perform administrative action (e.g. toggle active/suspend status)
export async function POST(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, action } = await req.json();
    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'toggle-active') {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isActive: !targetUser.isActive },
      });
      return NextResponse.json({
        message: `User status updated to ${updated.isActive ? 'Active' : 'Suspended'}`
      });
    }

    if (action === 'promote-admin') {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'admin' },
      });
      return NextResponse.json({ message: 'User successfully promoted to administrator' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[admin-users-post]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
