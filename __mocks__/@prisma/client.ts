// @ts-nocheck
// Jest manual mock for @prisma/client
// This prevents Prisma from trying to connect to the database in unit tests.

const mockPrisma = {
  user:       { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  investment: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn(), aggregate: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn() },
  plan:       { findUnique: jest.fn(), findMany: jest.fn(), upsert: jest.fn(), delete: jest.fn() },
  transaction: { create: jest.fn(), findMany: jest.fn(), aggregate: jest.fn(), groupBy: jest.fn() },
  commission:  { create: jest.fn(), findMany: jest.fn(), aggregate: jest.fn() },
  referralLink: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), upsert: jest.fn(), count: jest.fn() },
  withdrawal:  { create: jest.fn(), findMany: jest.fn(), aggregate: jest.fn(), update: jest.fn(), updateMany: jest.fn(), findUnique: jest.fn() },
  dailyROIEntry: { create: jest.fn(), findFirst: jest.fn(), deleteMany: jest.fn() },
  settings:    { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn() },

  // ─── New models (v2) ────────────────────────────────────────────────────────
  pendingProfitEntry: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  plisioInvoice:      { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  batchPayoutRun:     { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },

  $disconnect: jest.fn(),
  $transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) => fn(mockPrisma)),
};

module.exports = { PrismaClient: jest.fn(() => mockPrisma) };
