'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { GrowthCard } from '@/components/vexta-cards';
import { TrendingUp, Activity } from 'lucide-react';

export default function Arbitrage() {
  const trades = [
    { pair: 'BTC/USD', exchange1: 'Binance', exchange2: 'Kraken', spread: '2.3%', profit: '$1,245', status: 'Active' },
    { pair: 'ETH/USD', exchange1: 'Coinbase', exchange2: 'FTX', spread: '1.8%', profit: '$892', status: 'Active' },
    { pair: 'ADA/USD', exchange1: 'Binance', exchange2: 'Kraken', spread: '1.2%', profit: '$340', status: 'Pending' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">High-Frequency Arbitrage</h1>
        <p className="text-[#A0A0A0]">Real-time market spread trading across major exchanges</p>
      </div>

      {/* Arbitrage Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <GrowthCard
          title="Active Trades"
          value="12"
          icon={<Activity className="w-5 h-5" />}
        />
        <GrowthCard
          title="Today's Profit"
          value="$3,520"
          change={2.8}
          isPositive={true}
        />
        <GrowthCard
          title="Avg Spread"
          value="2.1%"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <GrowthCard
          title="Monthly ROI"
          value="18.5%"
          change={1.2}
          isPositive={true}
        />
      </div>

      {/* Connected Exchanges */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold text-[#FFFFFF] mb-4">Connected Exchanges</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {['Binance', 'Kraken', 'Coinbase', 'FTX', 'Kucoin', 'OKEx'].map((exchange) => (
            <div key={exchange} className="bg-[#0F1419] border border-[#2A2E3E] rounded-lg p-4 text-center">
              <p className="text-[#FFFFFF] font-medium">{exchange}</p>
              <p className="text-xs text-[#00D9FF] mt-2">✓ Connected</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Trades */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg overflow-hidden">
        <div className="p-6 border-b border-[#2A2E3E]">
          <h3 className="text-lg font-bold text-[#FFFFFF]">Active Trades</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2E3E] bg-[#0F1419]">
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">Pair</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Route</th>
                <th className="px-6 py-4 text-right text-[#A0A0A0] font-semibold text-sm">Spread</th>
                <th className="px-6 py-4 text-right text-[#A0A0A0] font-semibold text-sm">Est. Profit</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, idx) => (
                <tr key={idx} className="border-b border-[#2A2E3E] hover:bg-[#0F1419]/50 transition-colors">
                  <td className="px-6 py-4 text-[#FFFFFF] font-bold">{trade.pair}</td>
                  <td className="px-6 py-4 text-center text-[#A0A0A0] text-sm">
                    {trade.exchange1} ⟷ {trade.exchange2}
                  </td>
                  <td className="px-6 py-4 text-right text-[#00FF88] font-bold">{trade.spread}</td>
                  <td className="px-6 py-4 text-right text-[#00FF88]">{trade.profit}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      trade.status === 'Active'
                        ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30'
                        : 'bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/30'
                    }`}>
                      {trade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
