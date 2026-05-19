/**
 * Tests: Auth utilities
 */

import { hashPassword, verifyPassword, signToken, verifyToken, generateReferralCode } from '@/lib/auth';

describe('Auth utilities', () => {
  describe('Password hashing', () => {
    it('hashes a password and verifies it correctly', async () => {
      const hash = await hashPassword('MySecure@Pass123');
      expect(await verifyPassword('MySecure@Pass123', hash)).toBe(true);
    });

    it('rejects an incorrect password', async () => {
      const hash = await hashPassword('correct');
      expect(await verifyPassword('wrong', hash)).toBe(false);
    });

    it('produces different hashes for the same password', async () => {
      const h1 = await hashPassword('same');
      const h2 = await hashPassword('same');
      expect(h1).not.toBe(h2);
    });
  });

  describe('JWT', () => {
    it('signs and verifies a token', () => {
      const token = signToken({ userId: 'user_1', email: 'test@test.com', isVerified: true });
      const payload = verifyToken(token);
      expect(payload.userId).toBe('user_1');
      expect(payload.email).toBe('test@test.com');
    });

    it('throws on an invalid token', () => {
      expect(() => verifyToken('not.a.valid.token')).toThrow();
    });

    it('throws on a tampered token', () => {
      const token = signToken({ userId: 'x', email: 'x@x.com', isVerified: true });
      expect(() => verifyToken(token + 'tampered')).toThrow();
    });
  });

  describe('generateReferralCode', () => {
    it('starts with VXT_ prefix', () => {
      const code = generateReferralCode('John', 'Doe');
      expect(code.startsWith('VXT_')).toBe(true);
    });

    it('includes initials in uppercase', () => {
      const code = generateReferralCode('john', 'doe');
      expect(code).toContain('JD');
    });

    it('generates unique codes', () => {
      const codes = new Set(Array.from({ length: 100 }, () => generateReferralCode('A', 'B')));
      expect(codes.size).toBeGreaterThan(90); // High uniqueness
    });
  });
});
