/**
 * Tests: Referral Commission Engine (Logic & DB Interactions)
 */

import { COMMISSION_RATES, MAX_LEVELS, propagateCommissions } from '@/lib/referral-engine';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    investment: { findUnique: jest.fn() },
    referralLink: { findUnique: jest.fn() },
    commission: { create: jest.fn() },
    transaction: { create: jest.fn() },
    user: { update: jest.fn() },
  },
}));

describe('Unilevel Referral System - 7 Behaviors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Behavior 1: 13-Tier Depth Scaling', () => {
    it('has exactly 13 levels scaling from 10% down to 0.25%', () => {
      expect(Object.keys(COMMISSION_RATES).length).toBe(MAX_LEVELS);
      expect(MAX_LEVELS).toBe(13);
      expect(COMMISSION_RATES[1]).toBe(0.10);
      expect(COMMISSION_RATES[2]).toBe(0.06);
      expect(COMMISSION_RATES[13]).toBe(0.0025);
    });

    it('computes correct scale amounts on $1000 investment', () => {
      expect(+(1000 * COMMISSION_RATES[1]).toFixed(2)).toBe(100.00); // L1: $100
      expect(+(1000 * COMMISSION_RATES[2]).toFixed(2)).toBe(60.00);  // L2: $60
      expect(+(1000 * COMMISSION_RATES[13]).toFixed(2)).toBe(2.50);  // L13: $2.50
    });
  });

  describe('Behavior 2: 26% Absolute Mathematical Cap', () => {
    it('total of all levels never exceeds 26%', () => {
      const total = Object.values(COMMISSION_RATES).reduce((s, r) => s + r, 0);
      expect(+total.toFixed(4)).toBe(0.26);
    });
  });

  describe('Behavior 3: Locked-Capital Trigger (Exploit Prevention)', () => {
    it('propagateCommissions requires an investmentId and amount, validating funds are locked', async () => {
      // Setup mock to stop at level 1 to keep test simple
      (prisma.investment.findUnique as jest.Mock).mockResolvedValue({ isVirtual: false });
      (prisma.referralLink.findUnique as jest.Mock).mockResolvedValueOnce({ referrerId: 'upline_1' }).mockResolvedValueOnce(null);

      const results = await propagateCommissions('user_123', 'inv_123', 1000);
      
      expect(prisma.investment.findUnique).toHaveBeenCalledWith({
        where: { id: 'inv_123' },
        select: { isVirtual: true }
      });
      expect(results.length).toBe(1);
    });
  });

  describe('Behavior 4: Virtual Account Exclusion', () => {
    it('instantly aborts propagation if investment is flagged as virtual', async () => {
      (prisma.investment.findUnique as jest.Mock).mockResolvedValue({ isVirtual: true });

      const results = await propagateCommissions('user_123', 'inv_virtual', 1000);
      
      expect(results.length).toBe(0);
      expect(prisma.referralLink.findUnique).not.toHaveBeenCalled();
      expect(prisma.commission.create).not.toHaveBeenCalled();
    });
  });

  describe('Behavior 5 & 7: Recursive Lineage Tracing & Fail-Silent Resilience', () => {
    it('walks up the tree and stops silently if chain breaks early without throwing', async () => {
      (prisma.investment.findUnique as jest.Mock).mockResolvedValue({ isVirtual: false });
      
      // Mock exactly 3 uplines, then null (chain breaks before 13 levels)
      (prisma.referralLink.findUnique as jest.Mock)
        .mockResolvedValueOnce({ referrerId: 'upline_1' })
        .mockResolvedValueOnce({ referrerId: 'upline_2' })
        .mockResolvedValueOnce({ referrerId: 'upline_3' })
        .mockResolvedValueOnce(null);

      const results = await propagateCommissions('user_123', 'inv_123', 1000);
      
      expect(results.length).toBe(3);
      expect(results[0].level).toBe(1);
      expect(results[0].recipientId).toBe('upline_1');
      expect(results[1].level).toBe(2);
      expect(results[1].recipientId).toBe('upline_2');
      expect(results[2].level).toBe(3);
      expect(results[2].recipientId).toBe('upline_3');
      
      // Verified it gracefully handled `null` and returned results without throwing
    });
  });

  describe('Behavior 6: Dual Ledger Updates', () => {
    it('simultaneously updates User.balance and User.totalCommission for each payout', async () => {
      (prisma.investment.findUnique as jest.Mock).mockResolvedValue({ isVirtual: false });
      (prisma.referralLink.findUnique as jest.Mock)
        .mockResolvedValueOnce({ referrerId: 'upline_1' })
        .mockResolvedValueOnce(null);

      await propagateCommissions('user_123', 'inv_123', 1000);
      
      // $100 payout for Level 1
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'upline_1' },
        data: {
          balance: { increment: 100 },
          totalCommission: { increment: 100 },
        },
      });

      expect(prisma.commission.create).toHaveBeenCalled();
      expect(prisma.transaction.create).toHaveBeenCalled();
    });
  });
});
