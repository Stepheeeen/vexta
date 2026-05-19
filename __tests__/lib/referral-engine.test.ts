/**
 * Tests: Referral Commission Engine (pure logic, no DB)
 */

import { COMMISSION_RATES, MAX_LEVELS } from '@/lib/referral-engine';

describe('Referral Commission Rates', () => {
  it('has exactly 5 levels', () => {
    expect(Object.keys(COMMISSION_RATES).length).toBe(MAX_LEVELS);
  });

  it('level 1 = 10%', () => expect(COMMISSION_RATES[1]).toBe(0.10));
  it('level 2 = 5%',  () => expect(COMMISSION_RATES[2]).toBe(0.05));
  it('level 3 = 3%',  () => expect(COMMISSION_RATES[3]).toBe(0.03));
  it('level 4 = 2%',  () => expect(COMMISSION_RATES[4]).toBe(0.02));
  it('level 5 = 1%',  () => expect(COMMISSION_RATES[5]).toBe(0.01));

  it('total of all levels = 21%', () => {
    const total = Object.values(COMMISSION_RATES).reduce((s, r) => s + r, 0);
    expect(+total.toFixed(2)).toBe(0.21);
  });

  it('computes correct commission on $1000 investment', () => {
    expect(+(1000 * COMMISSION_RATES[1]).toFixed(2)).toBe(100.00); // L1: $100
    expect(+(1000 * COMMISSION_RATES[2]).toFixed(2)).toBe(50.00);  // L2: $50
    expect(+(1000 * COMMISSION_RATES[3]).toFixed(2)).toBe(30.00);  // L3: $30
    expect(+(1000 * COMMISSION_RATES[4]).toFixed(2)).toBe(20.00);  // L4: $20
    expect(+(1000 * COMMISSION_RATES[5]).toFixed(2)).toBe(10.00);  // L5: $10
  });
});
