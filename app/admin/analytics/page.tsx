'use client';

import { AdminLayout } from '@/components/admin-layout';

export default function AdminAnalytics() {
  const chartData = [40, 52, 48, 65, 58, 72, 85, 92, 78, 95, 88, 100];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">Platform Analytics</h1>
        <p className="text-[#A0A0A0]">Real-time platform metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
          <p className="text-[#A0A0A0] text-sm font-medium mb-1">Total Users</p>
          <p className="text-3xl font-bold text-[#00D9FF] mb-2">5,240</p>
          <p className="text-xs text-[#00FF88]">+12.5% from last month</p>
        </div>
        <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
          <p className="text-[#A0A0A0] text-sm font-medium mb-1">Total Volume</p>
          <p className="text-3xl font-bold text-[#00FF88] mb-2">$245.3M</p>
          <p className="text-xs text-[#00FF88]">+18.2% from last month</p>
        </div>
        <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
          <p className="text-[#A0A0A0] text-sm font-medium mb-1">Avg. Deposit</p>
          <p className="text-3xl font-bold text-[#00D9FF] mb-2">$46,768</p>
          <p className="text-xs text-[#00FF88]">+5.3% from last month</p>
        </div>
        <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
          <p className="text-[#A0A0A0] text-sm font-medium mb-1">Retention Rate</p>
          <p className="text-3xl font-bold text-[#00FF88] mb-2">94.2%</p>
          <p className="text-xs text-[#00FF88]">+2.1% from last month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Growth */}
        <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#FFFFFF] mb-6">User Growth (2024)</h3>
          <div className="h-64 flex items-end justify-between gap-1">
            {chartData.map((height, idx) => (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-[#00D9FF] to-[#00FF88] rounded-t opacity-80 hover:opacity-100 transition-opacity"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-[#A0A0A0]">
            {months.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>

        {/* Revenue Sources */}
        <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#FFFFFF] mb-6">Revenue Sources</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[#A0A0A0]">Trading Fees (62%)</span>
                <span className="text-[#00D9FF] font-bold">$152M</span>
              </div>
              <div className="w-full bg-[#0F1419] rounded-full h-3">
                <div className="bg-[#00D9FF] h-3 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[#A0A0A0]">Referral Fees (25%)</span>
                <span className="text-[#00FF88] font-bold">$61.3M</span>
              </div>
              <div className="w-full bg-[#0F1419] rounded-full h-3">
                <div className="bg-[#00FF88] h-3 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[#A0A0A0]">Premium Services (13%)</span>
                <span className="text-[#FFB347] font-bold">$32M</span>
              </div>
              <div className="w-full bg-[#0F1419] rounded-full h-3">
                <div className="bg-[#FFB347] h-3 rounded-full" style={{ width: '13%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#FFFFFF] mb-6">Geographic Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#A0A0A0] text-sm">North America</span>
                <span className="text-[#FFFFFF] font-bold text-sm">38%</span>
              </div>
              <div className="w-full bg-[#0F1419] rounded-full h-2">
                <div className="bg-[#00D9FF] h-2 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#A0A0A0] text-sm">Europe</span>
                <span className="text-[#FFFFFF] font-bold text-sm">32%</span>
              </div>
              <div className="w-full bg-[#0F1419] rounded-full h-2">
                <div className="bg-[#00D9FF] h-2 rounded-full" style={{ width: '32%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#A0A0A0] text-sm">Asia Pacific</span>
                <span className="text-[#FFFFFF] font-bold text-sm">25%</span>
              </div>
              <div className="w-full bg-[#0F1419] rounded-full h-2">
                <div className="bg-[#00D9FF] h-2 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#A0A0A0] text-sm">Other</span>
                <span className="text-[#FFFFFF] font-bold text-sm">5%</span>
              </div>
              <div className="w-full bg-[#0F1419] rounded-full h-2">
                <div className="bg-[#00D9FF] h-2 rounded-full" style={{ width: '5%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#FFFFFF] mb-6">Top Assets</h3>
          <div className="space-y-3">
            {[
              { asset: 'Bitcoin (BTC)', volume: '$85.3M', pct: 35 },
              { asset: 'Ethereum (ETH)', volume: '$62.4M', pct: 25 },
              { asset: 'USDT', volume: '$48.2M', pct: 20 },
              { asset: 'Others', volume: '$49.4M', pct: 20 },
            ].map((item) => (
              <div key={item.asset}>
                <div className="flex justify-between mb-1">
                  <span className="text-[#A0A0A0] text-sm">{item.asset}</span>
                  <span className="text-[#FFFFFF] font-bold text-sm">{item.volume}</span>
                </div>
                <div className="w-full bg-[#0F1419] rounded-full h-2">
                  <div className="bg-[#00FF88] h-2 rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#FFFFFF] mb-6">User Segments</h3>
          <div className="space-y-3">
            {[
              { segment: 'Whales (>$100k)', count: 245, pct: 4.7 },
              { segment: 'High Value ($10k-$100k)', count: 1280, pct: 24.4 },
              { segment: 'Regular ($1k-$10k)', count: 2480, pct: 47.3 },
              { segment: 'Starter (<$1k)', count: 1235, pct: 23.6 },
            ].map((item) => (
              <div key={item.segment}>
                <div className="flex justify-between mb-1">
                  <span className="text-[#A0A0A0] text-sm">{item.segment}</span>
                  <span className="text-[#FFFFFF] font-bold text-sm">{item.count}</span>
                </div>
                <div className="w-full bg-[#0F1419] rounded-full h-2">
                  <div className="bg-[#00D9FF] h-2 rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
