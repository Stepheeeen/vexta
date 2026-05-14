'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { GrowthCard, VerifiedBadge, ProfitBadge } from '@/components/vexta-cards';

export default function Portfolio() {
  const holdings = [
    { symbol: 'BTC', name: 'Bitcoin', amount: 2.5, value: 112500, change: 15.2 },
    { symbol: 'ETH', name: 'Ethereum', amount: 25.0, value: 42500, change: 12.8 },
    { symbol: 'USDT', name: 'Tether', amount: 8000, value: 8000, change: 0.1 },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">Portfolio</h1>
        <p className="text-[#A0A0A0]">Your verified investment holdings and performance</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <GrowthCard
          title="Total Holdings"
          value="$163,000"
          change={14.2}
          isPositive={true}
        />
        <GrowthCard
          title="24h Change"
          value="+$2,840"
          change={1.8}
          isPositive={true}
        />
        <GrowthCard
          title="Portfolio ROI"
          value="28.3%"
          change={2.5}
          isPositive={true}
        />
      </div>

      {/* Holdings Table */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2E3E]">
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">Asset</th>
                <th className="px-6 py-4 text-right text-[#A0A0A0] font-semibold text-sm">Amount</th>
                <th className="px-6 py-4 text-right text-[#A0A0A0] font-semibold text-sm">Value</th>
                <th className="px-6 py-4 text-right text-[#A0A0A0] font-semibold text-sm">24h Change</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr key={holding.symbol} className="border-b border-[#2A2E3E] hover:bg-[#0F1419]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-[#FFFFFF] font-bold">{holding.symbol}</p>
                      <p className="text-sm text-[#A0A0A0]">{holding.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-[#FFFFFF]">{holding.amount}</td>
                  <td className="px-6 py-4 text-right text-[#00FF88] font-bold">${holding.value.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-[#00FF88]">+{holding.change}%</td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-[#00D9FF] hover:text-[#00E8FF] text-sm font-medium">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add to Portfolio */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#FFFFFF] mb-4">Add to Portfolio</h3>
        <button className="w-full py-3 bg-[#00FF88] hover:bg-[#00E070] text-[#0F1419] font-bold rounded-lg transition-colors">
          Deposit Funds
        </button>
      </div>
    </DashboardLayout>
  );
}
