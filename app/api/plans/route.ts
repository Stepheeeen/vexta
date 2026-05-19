import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let plans = await prisma.plan.findMany({
      where: { isActive: true },
    });

    // If database has no plans seeded yet, return a seed fallback template or force seeding
    if (plans.length === 0) {
      const { upsertPlans } = require('@/lib/roi-engine');
      await upsertPlans();
      plans = await prisma.plan.findMany({
        where: { isActive: true },
      });
    }

    return NextResponse.json({ plans });
  } catch (err) {
    console.error('[plans/GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
