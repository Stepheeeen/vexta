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
    it('Plan A: $100 at 1.5% for 30 days = $45', () => {
      expect(calculateTotalReturn(100, 0.015, 30)).toBe(45.00);
    });

    it('Plan B: $500 at 2.0% for 45 days = $450', () => {
      expect(calculateTotalReturn(500, 0.02, 45)).toBe(450.00);
    });

    it('Plan C: $2000 at 2.5% for 60 days = $3000', () => {
      expect(calculateTotalReturn(2000, 0.025, 60)).toBe(3000.00);
    });
  });

  describe('calculateTotalROIPercent', () => {
    it('Plan A: 1.5% x 30 days = 45%', () => {
      expect(calculateTotalROIPercent(0.015, 30)).toBe(45.0);
    });

    it('Plan B: 2.0% x 45 days = 90%', () => {
      expect(calculateTotalROIPercent(0.02, 45)).toBe(90.0);
    });

    it('Plan C: 2.5% x 60 days = 150%', () => {
      expect(calculateTotalROIPercent(0.025, 60)).toBe(150.0);
    });
  });
});
