/**
 * Tests: Arbitrage Router Engine
 */

interface ExchangePrice {
  exchange: string;
  buyPrice: number;
  sellPrice: number;
  feePercentage: number; // e.g. 0.001 (0.1%)
}

interface ArbitrageOpportunity {
  asset: string;
  buyFrom: string;
  sellTo: string;
  buyPrice: number;
  sellPrice: number;
  grossSpread: number;
  netProfit: number;
  netROIPercent: number;
}

/**
 * Finds the best arbitrage opportunity for a given asset across multiple exchange prices
 */
export function findArbitrageOpportunity(
  asset: string,
  prices: ExchangePrice[],
  investmentAmount: number
): ArbitrageOpportunity | null {
  if (prices.length < 2) return null;

  let bestOpportunity: ArbitrageOpportunity | null = null;

  for (let i = 0; i < prices.length; i++) {
    for (let j = 0; j < prices.length; j++) {
      if (i === j) continue;

      const source = prices[i];
      const target = prices[j];

      // Buy from source, Sell to target
      const buyPrice = source.buyPrice;
      const sellPrice = target.sellPrice;

      if (sellPrice <= buyPrice) continue;

      // Fees
      const buyFee = investmentAmount * source.feePercentage;
      const amountBought = (investmentAmount - buyFee) / buyPrice;

      const grossValue = amountBought * sellPrice;
      const sellFee = grossValue * target.feePercentage;
      const finalValue = grossValue - sellFee;

      const netProfit = finalValue - investmentAmount;
      const netROIPercent = (netProfit / investmentAmount) * 100;

      if (netProfit > 0) {
        if (!bestOpportunity || netProfit > bestOpportunity.netProfit) {
          bestOpportunity = {
            asset,
            buyFrom: source.exchange,
            sellTo: target.exchange,
            buyPrice,
            sellPrice,
            grossSpread: sellPrice - buyPrice,
            netProfit: +netProfit.toFixed(4),
            netROIPercent: +netROIPercent.toFixed(3),
          };
        }
      }
    }
  }

  return bestOpportunity;
}

describe('Arbitrage Router Engine', () => {
  const mockPrices: ExchangePrice[] = [
    { exchange: 'Binance', buyPrice: 60000, sellPrice: 59950, feePercentage: 0.001 },
    { exchange: 'Coinbase', buyPrice: 60250, sellPrice: 60200, feePercentage: 0.002 },
    { exchange: 'Kraken', buyPrice: 59800, sellPrice: 59750, feePercentage: 0.0015 },
    { exchange: 'OKX', buyPrice: 60100, sellPrice: 60050, feePercentage: 0.001 },
  ];

  it('correctly identifies the best buy/sell exchanges for BTC arbitrage', () => {
    // Investment of $10,000
    const opportunity = findArbitrageOpportunity('BTC', mockPrices, 10000);

    expect(opportunity).not.toBeNull();
    // Best route should be: Buy from Kraken ($59,800) and Sell to Coinbase ($60,200)
    expect(opportunity?.buyFrom).toBe('Kraken');
    expect(opportunity?.sellTo).toBe('Coinbase');
    expect(opportunity?.buyPrice).toBe(59800);
    expect(opportunity?.sellPrice).toBe(60200);
  });

  it('calculates net profits and ROI accurately after fees', () => {
    const opportunity = findArbitrageOpportunity('BTC', mockPrices, 10000);

    // Initial: $10,000
    // Buy Fee at Kraken (0.15%): $15
    // Amount bought: ($10,000 - $15) / 59,800 = 0.16697324 BTC
    // Sell on Coinbase: 0.16697324 BTC * $60,200 = $10,051.789
    // Sell Fee at Coinbase (0.2%): $10,051.789 * 0.002 = $20.103
    // Final Value: $10,051.789 - $20.103 = $10,031.686
    // Net profit: $31.686
    // ROI: ($31.686 / $10,000) * 100 = 0.317%
    expect(opportunity?.netProfit).toBeCloseTo(31.686, 1);
    expect(opportunity?.netROIPercent).toBeCloseTo(0.317, 2);
  });

  it('returns null if there are no profitable opportunities', () => {
    const flatPrices: ExchangePrice[] = [
      { exchange: 'Binance', buyPrice: 60000, sellPrice: 59900, feePercentage: 0.01 },
      { exchange: 'Coinbase', buyPrice: 60000, sellPrice: 59900, feePercentage: 0.01 },
    ];

    const opportunity = findArbitrageOpportunity('BTC', flatPrices, 10000);
    expect(opportunity).toBeNull();
  });
});
