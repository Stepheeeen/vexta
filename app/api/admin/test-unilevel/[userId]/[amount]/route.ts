import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { distributeUnilevelCommission } from '@/server/services/commission.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; amount: string }> }
) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, amount } = await params;
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    await distributeUnilevelCommission(userId, parsedAmount);

    return NextResponse.json({
      success: true,
      message: `Successfully triggered unilevel commission distribution of $${parsedAmount} for user ID ${userId}`
    });
  } catch (err: any) {
    console.error('[admin/test-unilevel]', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
