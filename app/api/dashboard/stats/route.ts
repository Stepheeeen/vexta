import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAvailableBalance, getWithdrawableBalances, getP2pBalance } from '@/lib/balance';
import { SYSTEM_CONFIG } from '@/lib/config/system';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check maintenance mode
  const settings = await prisma.settings.findFirst();
  if (settings?.maintenanceMode && payload.role !== 'admin') {
    return NextResponse.json({ error: 'Maintenance', maintenanceMode: true }, { status: 503 });
  }

  const userId = payload.userId;

  // Investments
  const investments = await prisma.investment.findMany({
    where: { userId },
    include: { plan: true },
  });

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const totalEarned = investments.reduce((s, i) => s + i.totalEarned, 0);
  const activeInvestments = investments.filter((i) => i.status === 'active').length;

  // ── Passive Earnings (Daily ROI) ───────────────────────────────────────────
  const dailyRoiTxns = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'daily_roi',
      status: 'completed'
    },
    _sum: { amount: true }
  });
  const totalDailyRoi = dailyRoiTxns._sum.amount ?? 0;
  const passiveEarnings = +(totalDailyRoi).toFixed(2);

  // ── Network Earnings (Commissions) ─────────────────────────────────────────
  const commissionTxns = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'commission',
      status: 'completed'
    },
    _sum: { amount: true }
  });
  const networkEarnings = +(commissionTxns._sum.amount ?? 0).toFixed(2);

  // ── Total Earnings ─────────────────────────────────────────────────────────
  const totalEarnings = +(passiveEarnings + networkEarnings).toFixed(2);

  // Referrals count (direct)
  const directReferrals = await prisma.referralLink.count({ where: { referrerId: userId } });

  // Total network count (all levels BFS)
  let totalNetworkCount = 0;
  let currentLevelIds = [userId];
  for (let level = 1; level <= 13; level++) {
    const links = await prisma.referralLink.findMany({
      where: { referrerId: { in: currentLevelIds } },
      select: { referredId: true },
    });
    if (links.length === 0) break;
    totalNetworkCount += links.length;
    currentLevelIds = links.map((l) => l.referredId);
  }

  const fortyEightHoursAgo = new Date();
  fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

  // Fetch pending Plisio deposits (not yet confirmed by the network)
  let pendingPlisioInvoices = await prisma.plisioInvoice.findMany({
    where: { 
      userId, 
      status: 'pending',
      createdAt: { gte: fortyEightHoursAgo }
    },
    orderBy: { createdAt: 'desc' },
  });

  // ── Real-Time Plisio Fast-Track Sync ───────────────────────────────────────
  const { secretKey } = SYSTEM_CONFIG.plisio;
  if (secretKey && pendingPlisioInvoices.length > 0) {
    let hasUpdated = false;
    for (const invoice of pendingPlisioInvoices) {
      try {
        const apiRes = await fetch(`https://api.plisio.net/api/v1/invoices/${invoice.txnId}?api_key=${secretKey}`);
        const apiData = await apiRes.json() as any;
        if (apiData.status === 'success' && apiData.data?.invoice) {
          const { status: plisioStatus, received_amount: plisioActualSum, tx_url: txUrl } = apiData.data.invoice;
          
          if (plisioStatus === 'completed' || plisioStatus === 'mismatch') {
            const creditAmount = plisioActualSum ? parseFloat(plisioActualSum) : invoice.amount;
            await handleCompletedPayment(invoice, creditAmount, txUrl);
            hasUpdated = true;
          } else if (['expired', 'cancelled', 'error'].includes(plisioStatus)) {
            await prisma.plisioInvoice.update({
              where: { id: invoice.id },
              data: { status: plisioStatus }
            });
            hasUpdated = true;
          }
        }
      } catch (e) {
        console.error(`[stats/pending-sync] Error checking invoice ${invoice.txnId}:`, e);
      }
    }

    if (hasUpdated) {
      // Re-fetch pending invoices since some have been activated/closed
      pendingPlisioInvoices = await prisma.plisioInvoice.findMany({
        where: { userId, status: 'pending' },
        orderBy: { createdAt: 'desc' },
      });
    }
  }

  // Recent transactions
  const recentTxns = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Inject pending invoices as virtual transactions so the UI displays them while waiting for network confirmation
  const virtualPendingTxns = pendingPlisioInvoices.map((inv) => ({
    id: `plisio-pending-${inv.id}`,
    userId: inv.userId,
    type: 'deposit',
    amount: inv.amount,
    status: 'pending',
    description: `Deposit waiting for network confirmation`,
    reference: inv.txnId,
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
  }));

  // Merge and sort them
  const combinedTxns = [...virtualPendingTxns, ...recentTxns].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  ).slice(0, 10);

  // Dynamic available balance (Internal Wallet) — computed ONCE and reused below.
  // Passing it into getWithdrawableBalances avoids a duplicate 7-query aggregate call.
  const availableBalance = await getAvailableBalance(userId);
  const pools = await getWithdrawableBalances(userId, undefined, availableBalance);
  const p2pBalance = await getP2pBalance(userId);

  
  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      operationalCapital: true,
      isSponsored: true,
      sponsoredType: true,
      sponsoredGoalAmount: true,
      sponsoredDirectSales: true,
      roiBlocked: true,
      fundsFrozen: true,
      withdrawalsBlocked: true,
    } as any
  });

  return NextResponse.json({
    stats: {
      totalInvested: +totalInvested.toFixed(2),
      // ── Earnings Breakdown ────────────────────────────────────────────────
      totalEarnings,       // Passive + Network combined
      passiveEarnings,     // Daily ROI only
      networkEarnings,     // Commissions only
      // Legacy aliases (backwards compatibility)
      totalEarned: passiveEarnings,
      totalCommissions: networkEarnings,
      // ── Wallet Balances ───────────────────────────────────────────────────
      availableBalance,    // Internal Wallet
      p2pBalance,          // P2P Wallet (non-withdrawable, for package activation only)
      // ── Other Stats ───────────────────────────────────────────────────────
      operationalCapital: (userRecord as any)?.operationalCapital || 0,
      activeInvestments,
      directReferrals,
      totalNetworkCount,
    },
    pools,
    userSponsorship: userRecord,
    investments: investments.map((i) => ({
      id: i.id,
      plan: i.plan.name,
      amount: i.amount,
      activeCapital: (i as any).activeCapital,
      dailyROI: i.plan.dailyROI,
      duration: i.plan.duration,
      startDate: i.startDate,
      endDate: i.endDate,
      totalEarned: i.totalEarned,
      maxPayout: (i as any).maxPayout || i.amount * 2,
      status: i.status,
    })),
    recentTransactions: combinedTxns,
  });
}

/**
 * Credits a user for a completed Plisio invoice during inline sync.
 * Idempotent: safe to call multiple times — re-checks activatedAt inside the transaction.
 */
async function handleCompletedPayment(
  invoice: { id: string; txnId: string; userId: string; amount: number; activatedAt: Date | null },
  creditAmount: number,
  txHash?: string | string[]
): Promise<void> {
  if (invoice.activatedAt) return;
  const { userId } = invoice;

  try {
    await prisma.$transaction(async (tx) => {
      const fresh = await tx.plisioInvoice.findUnique({ where: { id: invoice.id } });
      if (fresh?.activatedAt) return;

      // 1. Credit the user's balance
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: creditAmount },
        },
      });

      // 2. Create deposit transaction record
      const safeTxHash = Array.isArray(txHash) ? txHash.join(', ') : (txHash ?? null);
      await tx.transaction.create({
        data: {
          userId,
          type:        'deposit',
          amount:      creditAmount,
          status:      'completed',
          description: `USDT BEP-20 deposit via Plisio (fast-tracked)`,
          reference:   invoice.txnId,
          metadata:    JSON.stringify({ txnId: invoice.txnId, txHash: safeTxHash, network: 'BEP20', source: 'dashboard_sync' }),
        },
      });

      // 3. Mark the invoice as activated
      await tx.plisioInvoice.update({
        where: { id: invoice.id },
        data:  {
          status:       'completed',
          activatedAt:  new Date(),
          plisioTxHash: safeTxHash,
          amount:       creditAmount,
        },
      });
    }, { timeout: 30000 });
  } catch (err) {
    console.error(`[stats/handleCompletedPayment] Failed to activate invoice ${invoice.txnId}:`, err);
    throw err;
  }
}
