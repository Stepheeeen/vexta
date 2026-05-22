/**
 * Tests: ROI Engine
 */

import {
  calculateDailyROI,
  calculateTotalReturn,
  calculateTotalROIPercent,
  processDailyROI,
} from '@/lib/roi-engine';
import { runDailyRoiDistribution } from '@/server/services/earnings.service';
import { prisma } from '@/lib/prisma';

describe('ROI Engine', () => {
  describe('calculateDailyROI', () => {
    it('calculates 1.0% daily on $1000', () => {
      expect(calculateDailyROI(1000, 0.01)).toBe(10.00);
    });

    it('calculates 1.0% daily on $5000', () => {
      expect(calculateDailyROI(5000, 0.01)).toBe(50.00);
    });

    it('calculates 1.0% daily on $20000', () => {
      expect(calculateDailyROI(20000, 0.01)).toBe(200.00);
    });

    it('rounds to 2 decimal places', () => {
      expect(calculateDailyROI(333, 0.01)).toBe(3.33);
    });
  });

  describe('calculateTotalReturn', () => {
    it('Plan A: $100 at 1.0% for 30 days = $34.78 (compounded)', () => {
      expect(calculateTotalReturn(100, 0.01, 30)).toBe(34.78);
    });

    it('Plan B: $500 at 1.0% for 45 days = $282.41 (compounded)', () => {
      expect(calculateTotalReturn(500, 0.01, 45)).toBe(282.41);
    });

    it('Plan C: $2000 at 1.0% for 60 days = $1633.39 (compounded)', () => {
      expect(calculateTotalReturn(2000, 0.01, 60)).toBe(1633.39);
    });
  });

  describe('calculateTotalROIPercent', () => {
    it('Plan A: 1.0% x 30 days = 34.8% (compounded)', () => {
      expect(calculateTotalROIPercent(0.01, 30)).toBe(34.8);
    });

    it('Plan B: 1.0% x 45 days = 56.5% (compounded)', () => {
      expect(calculateTotalROIPercent(0.01, 45)).toBe(56.5);
    });

    it('Plan C: 1.0% x 60 days = 81.7% (compounded)', () => {
      expect(calculateTotalROIPercent(0.01, 60)).toBe(81.7);
    });
  });

  describe('Weekend Skip and ROI Distribution Logic', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    describe('processDailyROI (Investment-based daily ROI)', () => {
      it('skips processing on Saturday (weekend)', async () => {
        // 2026-05-23 is Saturday
        jest.setSystemTime(new Date('2026-05-23T12:00:00Z'));
        
        const result = await processDailyROI();
        expect(result).toEqual({ processed: 0, totalPaid: 0 });
        expect(prisma.investment.findMany).not.toHaveBeenCalled();
      });

      it('skips processing on Sunday (weekend)', async () => {
        // 2026-05-24 is Sunday
        jest.setSystemTime(new Date('2026-05-24T12:00:00Z'));
        
        const result = await processDailyROI();
        expect(result).toEqual({ processed: 0, totalPaid: 0 });
        expect(prisma.investment.findMany).not.toHaveBeenCalled();
      });

      it('processes investments on Wednesday (weekday)', async () => {
        // 2026-05-27 is Wednesday
        jest.setSystemTime(new Date('2026-05-27T12:00:00Z'));
        
        // Mock findMany to return empty array so it finishes gracefully without further DB updates
        (prisma.investment.findMany as jest.Mock).mockResolvedValue([]);
        
        const result = await processDailyROI();
        expect(result).toEqual({ processed: 0, totalPaid: 0 });
        expect(prisma.investment.findMany).toHaveBeenCalled();
      });
    });

    describe('runDailyRoiDistribution (User active deposit daily ROI)', () => {
      it('throws an error on Saturday (weekend) when bypassWeekendCheck is false', async () => {
        // 2026-05-23 is Saturday
        jest.setSystemTime(new Date('2026-05-23T12:00:00Z'));

        await expect(runDailyRoiDistribution(false)).rejects.toThrow(
          'ROI distribution only runs Monday through Friday'
        );
      });

      it('throws an error on Sunday (weekend) when bypassWeekendCheck is false', async () => {
        // 2026-05-24 is Sunday
        jest.setSystemTime(new Date('2026-05-24T12:00:00Z'));

        await expect(runDailyRoiDistribution(false)).rejects.toThrow(
          'ROI distribution only runs Monday through Friday'
        );
      });

      it('does not throw an error on Sunday (weekend) if bypassWeekendCheck is true', async () => {
        // 2026-05-24 is Sunday
        jest.setSystemTime(new Date('2026-05-24T12:00:00Z'));

        // Mock Settings.findFirst and user.findMany to avoid database errors
        (prisma.settings.findFirst as any).mockResolvedValue({ id: 'settings_id', lastDailyRun: null });
        (prisma.settings.update as any).mockResolvedValue({});
        (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

        const result = await runDailyRoiDistribution(true);
        expect(result).toEqual({ usersPaid: 0, totalDistributed: 0 });
      });

      it('runs successfully on Wednesday (weekday) without bypassWeekendCheck', async () => {
        // 2026-05-27 is Wednesday
        jest.setSystemTime(new Date('2026-05-27T12:00:00Z'));

        // Mock Settings.findFirst and user.findMany to avoid database errors
        (prisma.settings.findFirst as any).mockResolvedValue({ id: 'settings_id', lastDailyRun: null });
        (prisma.settings.update as any).mockResolvedValue({});
        (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

        const result = await runDailyRoiDistribution(false);
        expect(result).toEqual({ usersPaid: 0, totalDistributed: 0 });
      });
    });
  });
});
