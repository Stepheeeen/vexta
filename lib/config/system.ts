export const SYSTEM_CONFIG = {
  brand: {
    name: process.env.NEXT_PUBLIC_BRAND_NAME || 'Vexta',
    tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE || 'AI Arbitrage & Trading Platform',
    logoUrl: process.env.NEXT_PUBLIC_BRAND_LOGO_URL || '', // Empty by default to fallback to SVG, can be set to image path
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@vexta.app',
  },
  coinremitter: {
    coin: process.env.COINREMITTER_COIN || 'USDTBEP20', // USDT on BEP20 (Binance Smart Chain) only
    apiKey: process.env.COINREMITTER_API_KEY || '',
    password: process.env.COINREMITTER_PASSWORD || '',
    webhookUrl: process.env.COINREMITTER_WEBHOOK_URL || '',
  },
  unilevel: {
    // 13 levels of commissions
    rates: [
      0.10,   // Level 1: 10%
      0.06,   // Level 2: 6%
      0.03,   // Level 3: 3%
      0.02,   // Level 4: 2%
      0.02,   // Level 5: 2%
      0.01,   // Level 6: 1%
      0.005,  // Level 7: 0.5%
      0.0025, // Level 8: 0.25%
      0.0025, // Level 9: 0.25%
      0.0025, // Level 10: 0.25%
      0.0025, // Level 11: 0.25%
      0.0025, // Level 12: 0.25%
      0.0025  // Level 13: 0.25%
    ],
  },
  plans: {
    STARTER: { minDeposit: 10, dailyROI: 0.010, duration: 30, name: 'Starter Plan', tag: 'Starter' },
    PRIME: { minDeposit: 1000, dailyROI: 0.010, duration: 45, name: 'Prime Plan', tag: 'Popular' },
    ULTRA: { minDeposit: 3000, dailyROI: 0.010, duration: 60, name: 'Ultra Plan', tag: 'Advanced' },
  }
};
