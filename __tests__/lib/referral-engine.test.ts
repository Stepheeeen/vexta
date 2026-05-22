/**
 * Tests: Referral Commission Engine (pure logic, no DB)
 */

import { COMMISSION_RATES, MAX_LEVELS } from '@/lib/referral-engine';

describe('Referral Commission Rates', () => {
  it('has exactly 13 levels', () => {
    expect(Object.keys(COMMISSION_RATES).length).toBe(MAX_LEVELS);
  });

  it('level 1 = 10%', () => expect(COMMISSION_RATES[1]).toBe(0.10));
  it('level 2 = 6%',  () => expect(COMMISSION_RATES[2]).toBe(0.06));
  it('level 3 = 3%',  () => expect(COMMISSION_RATES[3]).toBe(0.03));
  it('level 4 = 2%',  () => expect(COMMISSION_RATES[4]).toBe(0.02));
  it('level 5 = 2%',  () => expect(COMMISSION_RATES[5]).toBe(0.02));
  it('level 6 = 1%',  () => expect(COMMISSION_RATES[6]).toBe(0.01));
  it('level 7 = 0.5%',   () => expect(COMMISSION_RATES[7]).toBe(0.005));
  it('level 8 = 0.25%', () => expect(COMMISSION_RATES[8]).toBe(0.0025));
  it('level 9 = 0.25%', () => expect(COMMISSION_RATES[9]).toBe(0.0025));
  it('level 10 = 0.25%', () => expect(COMMISSION_RATES[10]).toBe(0.0025));
  it('level 11 = 0.25%', () => expect(COMMISSION_RATES[11]).toBe(0.0025));
  it('level 12 = 0.25%', () => expect(COMMISSION_RATES[12]).toBe(0.0025));
  it('level 13 = 0.25%', () => expect(COMMISSION_RATES[13]).toBe(0.0025));

  it('total of all levels = 26%', () => {
    const total = Object.values(COMMISSION_RATES).reduce((s, r) => s + r, 0);
    expect(+total.toFixed(4)).toBe(0.26);
  });

  it('computes correct commission on $1000 investment', () => {
    expect(+(1000 * COMMISSION_RATES[1]).toFixed(2)).toBe(100.00); // L1: $100
    expect(+(1000 * COMMISSION_RATES[2]).toFixed(2)).toBe(60.00);  // L2: $60
    expect(+(1000 * COMMISSION_RATES[3]).toFixed(2)).toBe(30.00);  // L3: $30
    expect(+(1000 * COMMISSION_RATES[4]).toFixed(2)).toBe(20.00);  // L4: $20
    expect(+(1000 * COMMISSION_RATES[5]).toFixed(2)).toBe(20.00);  // L5: $20
    expect(+(1000 * COMMISSION_RATES[6]).toFixed(2)).toBe(10.00);  // L6: $10
    expect(+(1000 * COMMISSION_RATES[7]).toFixed(2)).toBe(5.00);   // L7: $5
    expect(+(1000 * COMMISSION_RATES[13]).toFixed(2)).toBe(2.50);  // L13: $2.50
  });
});
