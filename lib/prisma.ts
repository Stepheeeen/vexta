import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  // Check if we are in a browser or test mock environment
  if (typeof window !== 'undefined') {
    return new PrismaClient({} as any);
  }

  // MongoDB is natively supported by Prisma 7 without any driver adapters.
  // The engine automatically reads the DATABASE_URL environment variable.
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
