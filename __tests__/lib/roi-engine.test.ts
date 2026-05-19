/**
 * Tests: ROI Engine
 */

import {
  calculateDailyROI,
  calculateTotalReturn,
  calculateTotalROIPercent,
} from '@/lib/roi-engine';

describe('ROI Engine', () => {
  describe('calculateDailyROI', () => {
    it('calculates 1.5% daily on $1000', () => {
      expect(calculateDailyROI(1000, 0.015)).toBe(15.00);
    });

    it('calculates 2.0% daily on $5000', () => {
      expect(calculateDailyROI(5000, 0.02)).toBe(100.00);
    });

    it('calculates 2.5% daily on $20000', () => {
      expect(calculateDailyROI(20000, 0.025)).toBe(500.00);
    });

    it('rounds to 2 decimal places', () => {
      expect(calculateDailyROI(333, 0.015)).toBe(5.00);
    });
  });

  describe('calculateTotalReturn', () => {
    it('Plan A: $100 at 1.5% for 30 days = $56.31 (compounded)', () => {
      expect(calculateTotalReturn(100, 0.015, 30)).toBe(56.31);
    });

    it('Plan B: $500 at 2.0% for 45 days = $718.93 (compounded)', () => {
      expect(calculateTotalReturn(500, 0.02, 45)).toBe(718.93);
    });

    it('Plan C: $2000 at 2.5% for 60 days = $6799.58 (compounded)', () => {
      expect(calculateTotalReturn(2000, 0.025, 60)).toBe(6799.58);
    });
  });

  describe('calculateTotalROIPercent', () => {
    it('Plan A: 1.5% x 30 days = 56.3% (compounded)', () => {
      expect(calculateTotalROIPercent(0.015, 30)).toBe(56.3);
    });

    it('Plan B: 2.0% x 45 days = 143.8% (compounded)', () => {
      expect(calculateTotalROIPercent(0.02, 45)).toBe(143.8);
    });

    it('Plan C: 2.5% x 60 days = 340% (compounded)', () => {
      expect(calculateTotalROIPercent(0.025, 60)).toBe(340.0);
    });
  });
});
