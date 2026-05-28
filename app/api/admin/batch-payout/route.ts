import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('generate') }),
  z.object({
    action:  z.literal('execute'),
    runId:   z.string().min(1),
    otpCode: z.string().length(6),
  }),
]);

// ─── GET /api/admin/batch-payout — preview pending withdrawals ─────────────────

export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const pendingWithdrawals = await prisma.withdrawal.findMany({
    where: { status: 'pending' },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const totalAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  // Fetch last 5 batch runs for audit log
  const history = await prisma.batchPayoutRun.findMany({
    orderBy: { generatedAt: 'desc' },
    take: 10,
    select: {
      id:             true,
      generatedAt:    true,
      totalAmount:    true,
      withdrawalCount: true,
      status:         true,
      executedAt:     true,
      executedByAdminId: true,
    },
  });

  return NextResponse.json({
    pendingCount:  pendingWithdrawals.length,
    totalAmount:   +totalAmount.toFixed(2),
    withdrawals:   pendingWithdrawals.map(w => ({
      id:            w.id,
      userId:        w.userId,
      userName:      `${w.user.firstName} ${w.user.lastName}`,
      email:         w.user.email,
      amount:        w.amount,
      walletAddress: w.walletAddress,
      network:       w.network,
      type:          w.type,
      createdAt:     w.createdAt,
    })),
    history,
  });
}

// ─── POST /api/admin/batch-payout ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.action === 'generate') {
    return handleGenerate(payload.userId);
  }

  if (parsed.data.action === 'execute') {
    return handleExecute(parsed.data.runId, parsed.data.otpCode, payload.userId);
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

// ─── Generate batch export ───────────────────────────────────────────────────

async function handleGenerate(adminId: string): Promise<NextResponse> {
  // Fetch all pending withdrawals at this moment
  const pendingWithdrawals = await prisma.withdrawal.findMany({
    where:   { status: 'pending' },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  });

  if (pendingWithdrawals.length === 0) {
    return NextResponse.json({ error: 'No pending withdrawals to export' }, { status: 400 });
  }

  const totalAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  // Build Plisio mass-payment CSV
  // Plisio format: address,amount,currency (one row per payout)
  const csvLines = [
    'address,amount,currency', // header
    ...pendingWithdrawals.map(w =>
      `${w.walletAddress},${w.amount.toFixed(2)},USDT`
    ),
  ];
  const csvData = csvLines.join('\n');

  // Persist the batch run
  const batchRun = await prisma.batchPayoutRun.create({
    data: {
      totalAmount:       +totalAmount.toFixed(2),
      withdrawalCount:   pendingWithdrawals.length,
      csvData,
      status:            'generated',
      executedByAdminId: adminId,
    },
  });

  console.log(
    `[BatchPayout] Admin ${adminId} generated batch run ${batchRun.id}: ` +
    `${pendingWithdrawals.length} withdrawals, $${totalAmount.toFixed(2)} USDT`
  );

  return NextResponse.json({
    message:        'Batch report generated',
    runId:          batchRun.id,
    totalAmount:    +totalAmount.toFixed(2),
    withdrawalCount: pendingWithdrawals.length,
    csvData,
    withdrawals:    pendingWithdrawals.map(w => ({
      id:            w.id,
      userName:      `${w.user.firstName} ${w.user.lastName}`,
      email:         w.user.email,
      walletAddress: w.walletAddress,
      amount:        w.amount,
    })),
  }, { status: 201 });
}

// ─── Execute batch (OTP-gated) ───────────────────────────────────────────────

async function handleExecute(runId: string, otpCode: string, adminId: string): Promise<NextResponse> {
  // Verify OTP via email — look up the admin user's verification code
  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: {
      verificationCode:        true,
      verificationCodeExpires: true,
      role:                    true,
    },
  });

  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now = new Date();
  if (
    !admin.verificationCode ||
    admin.verificationCode !== otpCode ||
    !admin.verificationCodeExpires ||
    admin.verificationCodeExpires < now
  ) {
    return NextResponse.json({ error: 'Invalid or expired OTP code' }, { status: 401 });
  }

  // Fetch the batch run
  const batchRun = await prisma.batchPayoutRun.findUnique({ where: { id: runId } });
  if (!batchRun) {
    return NextResponse.json({ error: 'Batch run not found' }, { status: 404 });
  }
  if (batchRun.status === 'executed' || batchRun.status === 'completed') {
    return NextResponse.json({ error: 'Batch run already executed' }, { status: 409 });
  }

  // Mark all pending withdrawals as approved and link to this batch run
  const updateResult = await prisma.withdrawal.updateMany({
    where: { status: 'pending' },
    data: {
      status:      'approved',
      processedAt: now,
      batchRunId:  runId,
    },
  });

  // Update batch run status
  await prisma.batchPayoutRun.update({
    where: { id: runId },
    data: {
      status:            'executed',
      executedAt:        now,
      executedByAdminId: adminId,
      notes:             `Executed by admin ${adminId}. ${updateResult.count} withdrawals approved.`,
    },
  });

  // Consume the OTP so it can't be reused
  await prisma.user.update({
    where: { id: adminId },
    data:  { verificationCode: null, verificationCodeExpires: null },
  });

  console.log(
    `[BatchPayout] ✅ Admin ${adminId} executed batch run ${runId}: ` +
    `${updateResult.count} withdrawals approved.`
  );

  return NextResponse.json({
    message:          'Batch executed successfully',
    approvedCount:    updateResult.count,
    runId,
  });
}
