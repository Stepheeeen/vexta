export const SYSTEM_CONFIG = {
  brand: {
    name: process.env.NEXT_PUBLIC_BRAND_NAME || 'Vexta',
    tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE || 'AI Arbitrage & Trading Platform',
    logoUrl: process.env.NEXT_PUBLIC_BRAND_LOGO_URL || '',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@vexta.app',
  },

  // ─── Plisio USDT BEP-20 Gateway ─────────────────────────────────────────────
  // Plisio uses a single SECRET_KEY for all API calls (passed as ?api_key= param)
  plisio: {
    secretKey:    process.env.PLISIO_SECRET_KEY || '',
    masterWallet: process.env.PLISIO_MASTER_WALLET || '',
    currency:     'USDT_BSC', // Plisio currency code for USDT on Binance Smart Chain (BEP-20)
    callbackUrl:  process.env.PLISIO_CALLBACK_URL || '',
  },

  // ─── Unilevel Commission Rates (13 levels) ───────────────────────────────────
  unilevel: {
    rates: [
      0.10,   // Level 1:  10%
      0.06,   // Level 2:   6%
      0.03,   // Level 3:   3%
      0.02,   // Level 4:   2%
      0.02,   // Level 5:   2%
      0.01,   // Level 6:   1%
      0.005,  // Level 7: 0.5%
      0.0025, // Level 8: 0.25%
      0.0025, // Level 9: 0.25%
      0.0025, // Level 10: 0.25%
      0.0025, // Level 11: 0.25%
      0.0025, // Level 12: 0.25%
      0.0025, // Level 13: 0.25%
    ],
  },

  // ─── Investment Plans ─────────────────────────────────────────────────────────
  // All plans share 1% daily ROI over 200 business-day contracts.
  // Tier bonuses are applied INSTANTLY to activeCapital on investment activation.
  // Maximum theoretical return over 200 business days with 48hr delayed compounding: ~442% total.
  plans: {
    STARTER: {
      minDeposit: 10,
      dailyROI:   0.010, // 1% per business day
      duration:   200,   // 200 business days — contract lifecycle
      bonus:      0.00,  // No tier bonus
      name: 'STARTER PLAN',
      tag:  'STARTER PLAN',
    },
    ADVANCE: {
      minDeposit: 1000,
      dailyROI:   0.010, // 1% per business day
      duration:   200,
      bonus:      0.10,  // +10% instant bonus on activeCapital (e.g. $1,000 → $1,100)
      name: 'ADVANCE PLAN',
      tag:  'ADVANCE PLAN',
    },
    ULTRA: {
      minDeposit: 3000,
      dailyROI:   0.010, // 1% per business day
      duration:   200,
      bonus:      0.20,  // +20% instant bonus on activeCapital (e.g. $3,000 → $3,600)
      name: 'ULTRA PLAN',
      tag:  'ULTRA PLAN',
    },
  },

  // ─── Compounding Model Constants ─────────────────────────────────────────────
  compounding: {
    /// Number of business days a profit must wait before integrating into activeCapital
    pendingDelayDays: 2,
    /// Maximum business-day contract length
    maxContractDays: 200,
    /// ROI daily rate (1%)
    dailyRate: 0.010,
  },
};
