import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { SYSTEM_CONFIG } from '@/lib/config/system';

export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { minDeposit: 'asc' },
    });

    // Sync plans if database has no plans seeded yet, or if they are out of sync with config
    const needsSync = plans.length === 0 || plans.some(p => {
      const configPlan = Object.values(SYSTEM_CONFIG.plans).find(cp => cp.name === p.name);
      return configPlan && (configPlan.bonus !== p.bonus || configPlan.dailyROI !== p.dailyROI || configPlan.minDeposit !== p.minDeposit);
    });

    if (needsSync) {
      const { upsertPlans } = require('@/lib/roi-engine');
      await upsertPlans();
      plans = await prisma.plan.findMany({
        where: { isActive: true },
        orderBy: { minDeposit: 'asc' },
      });
    }

    return NextResponse.json({ plans });
  } catch (err) {
    console.error('[plans/GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
