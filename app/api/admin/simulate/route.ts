import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { runSimulation, resetSimulation } from '@/lib/simulation';
import { processDailyROI, upsertPlans } from '@/lib/roi-engine';

// POST /api/admin/simulate — run or reset simulation
export async function POST(req: NextRequest) {
  // Simple admin key check (replace with proper admin role in production)
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== (process.env.ADMIN_KEY ?? 'vexta-admin-dev')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') ?? 'run';

  try {
    if (action === 'reset') {
      const result = await resetSimulation();
      return NextResponse.json(result);
    }

    if (action === 'roi') {
      const result = await processDailyROI();
      return NextResponse.json(result);
    }

    if (action === 'seed-plans') {
      await upsertPlans();
      return NextResponse.json({ message: 'Plans seeded' });
    }

    // Default: full simulation
    const days = parseInt(searchParams.get('days') ?? '30');
    const result = await runSimulation(days);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
