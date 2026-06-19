import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ── Constants ──────────────────────────────────────────────────────────────────
// Company launch date — volume starts at $1,000,000 on this date
export const LAUNCH_DATE = new Date('2025-01-06T00:00:00Z');
// Base liquidity pool at launch (USDT)
export const BASE_VOLUME = 1_000_000;
// Extra volume added every 15 calendar days since launch
export const INCREMENT_PER_PERIOD = 25_000;
// Period length in days
export const INCREMENT_DAYS = 15;

/**
 * Compute the current auto-incremented volume.
 * liquidityBonus is added on top to account for admin-controlled extra volume.
 */
export function computeCurrentVolume(liquidityBonus: number): number {
  const daysSinceLaunch = Math.max(
    0,
    Math.floor((Date.now() - LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24))
  );
  const periods = Math.floor(daysSinceLaunch / INCREMENT_DAYS);
  return BASE_VOLUME + periods * INCREMENT_PER_PERIOD + liquidityBonus;
}

/**
 * Public endpoint — returns the current operating volume figure.
 * No auth required. Only exposes volume numbers, no sensitive data.
 */
export async function GET(_req: NextRequest) {
  try {
    const settings = await prisma.settings.findFirst({
      select: { liquidityBonus: true },
    });
    const liquidityBonus = settings?.liquidityBonus ?? 0;
    const currentVolume = computeCurrentVolume(liquidityBonus);

    return NextResponse.json({
      baseVolume: BASE_VOLUME,
      liquidityBonus,
      currentVolume,
      launchDate: LAUNCH_DATE.toISOString(),
      incrementPerPeriod: INCREMENT_PER_PERIOD,
      incrementDays: INCREMENT_DAYS,
    });
  } catch (err) {
    console.error('[liquidity-volume-get]', err);
    // Fallback — return base volume without DB so the UI never breaks
    const currentVolume = computeCurrentVolume(0);
    return NextResponse.json({ baseVolume: BASE_VOLUME, liquidityBonus: 0, currentVolume });
  }
}
