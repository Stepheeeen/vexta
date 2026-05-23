import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getAvailableBalance, getWithdrawableBalances } from '@/lib/balance';

const transferSchema = z.object({
  recipientIdentifier: z.string().min(1, 'Recipient email or referral code is required'),
  amount: z.number().positive('Amount must be positive'),
});

export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check maintenance mode
  const settings = await prisma.settings.findFirst();
  if (settings?.maintenanceMode && payload.role !== 'admin') {
    return NextResponse.json(
      { error: 'System is currently undergoing maintenance. Transfers are temporarily disabled.' },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const parsed = transferSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { recipientIdentifier, amount } = parsed.data;
    const senderId = payload.userId;

    // Fetch sender details
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { email: true }
    });

    if (!sender) {
      return NextResponse.json({ error: 'Sender account not found' }, { status: 404 });
    }

    // Find recipient by email or referralCode (case-insensitive)
    const recipient = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: recipientIdentifier.trim(), mode: 'insensitive' } },
          { referralCode: { equals: recipientIdentifier.trim(), mode: 'insensitive' } },
        ],
      },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found. Check the email or referral code.' },
        { status: 404 }
      );
    }

    if (recipient.id === senderId) {
      return NextResponse.json(
        { error: 'You cannot transfer balance to yourself' },
        { status: 400 }
      );
    }

    // Sort user IDs lexicographically for deterministic locking order
    const userIds = [senderId, recipient.id].sort();

    // Execute transfer in a transaction with pessimistic locking
    await prisma.$transaction(async (tx) => {
      // 1. Lock sender and recipient documents deterministically to prevent deadlock
      let senderUser;
      for (const id of userIds) {
        const u = await tx.user.update({
          where: { id },
          data: { updatedAt: new Date() }
        });
        if (id === senderId) senderUser = u;
      }

      if (senderUser?.fundsFrozen) {
        throw new Error('FUNDS_FROZEN');
      }

      // 2. Verify sufficient transferable balance inside the transaction
      const pools = await getWithdrawableBalances(senderId, tx);
      const availableTransferable = pools.availableRoi + pools.availableCommission;

      if (amount > availableTransferable) {
        throw new Error('INSUFFICIENT_TRANSFERABLE_BALANCE');
      }

      // 3. Sender transaction record
      await tx.transaction.create({
        data: {
          userId: senderId,
          type: 'p2p_sent',
          amount: amount, // Positive amount, will be subtracted by balance formula
          status: 'completed',
          description: `Transfer to ${recipient.email}`,
          reference: recipient.id,
        },
      });

      // 4. Recipient transaction record
      await tx.transaction.create({
        data: {
          userId: recipient.id,
          type: 'p2p_received',
          amount: amount,
          status: 'completed',
          description: `Transfer from ${sender.email}`,
          fromUserId: senderId,
          reference: senderId,
        },
      });

      // 5. Update sender balance column
      await tx.user.update({
        where: { id: senderId },
        data: { balance: { decrement: amount } },
      });

      // 6. Update recipient balance column
      await tx.user.update({
        where: { id: recipient.id },
        data: { balance: { increment: amount } },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Successfully transferred $${amount.toFixed(2)} to ${recipient.firstName} ${recipient.lastName}`
    });
  } catch (err: any) {
    if (err.message === 'FUNDS_FROZEN') {
      return NextResponse.json(
        { error: 'Your account funds are temporarily frozen. P2P transfers are disabled.' },
        { status: 400 }
      );
    }
    if (err.message === 'INSUFFICIENT_TRANSFERABLE_BALANCE') {
      return NextResponse.json(
        { error: 'Insufficient transferable balance. Blocked sponsored ROI funds cannot be transferred.' },
        { status: 400 }
      );
    }
    console.error('[p2p-transfer-post]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
