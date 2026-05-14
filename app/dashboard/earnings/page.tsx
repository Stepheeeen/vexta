'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { GrowthCard } from '@/components/vexta-cards';
import { DollarSign, TrendingUp, Users } from 'lucide-react';

export default function Earnings() {
  const earningsSources = [
    { source: 'Trading Profits', amount: '$45,320.00', percentage: 62, icon: TrendingUp },
    { source: 'Referral Commissions', amount: '$18,540.00', percentage: 25, icon: Users },
    { source: 'Passive Income', amount: '$9,840.00', percentage: 13, icon: DollarSign },
  ];

  const withdrawals = [
    { date: '2024-03-15', amount: '$5,000', method: 'Bank Transfer', status: 'Verified' },
    { date: '2024-03-08', amount: '$3,000', method: 'Crypto Wallet', status: 'Verified' },
    { date: '2024-02-28', amount: '$8,000', method: 'Bank Transfer', status: 'Verified' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">Earnings</h1>
        <p className="text-[#A0A0A0]">Complete breakdown of your income streams</p>
      </div>

      {/* Earnings Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <GrowthCard
          title="Total Earned"
          value="$73,700.00"
          change={28.5}
          isPositive={true}
        />
        <GrowthCard
          title="This Month"
          value="$12,450.50"
          change={15.3}
          isPositive={true}
        />
        <GrowthCard
          title="Pending"
          value="$2,840.00"
          icon={<DollarSign className="w-5 h-5 text-[#00D9FF]" />}
        />
      </div>

      {/* Earnings Sources */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {earningsSources.map((source) => {
          const Icon = source.icon;
          return (
            <div key={source.source} className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#FFFFFF] font-medium">{source.source}</h3>
                <Icon className="w-5 h-5 text-[#00D9FF]" />
              </div>
              <p className="text-2xl font-bold text-[#00FF88] mb-3">{source.amount}</p>
              <div className="w-full bg-[#0F1419] rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#00D9FF] to-[#00FF88] h-2 rounded-full"
                  style={{ width: `${source.percentage}%` }}
                />
              </div>
              <p className="text-xs text-[#A0A0A0] mt-2">{source.percentage}% of total</p>
            </div>
          );
        })}
      </div>

      {/* Withdrawal History */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg mb-8 overflow-hidden">
        <div className="p-6 border-b border-[#2A2E3E] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#FFFFFF]">Withdrawal History</h3>
          <button className="px-4 py-2 bg-[#00FF88] hover:bg-[#00E070] text-[#0F1419] font-bold rounded-lg transition-colors text-sm">
            Withdraw Funds
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2E3E] bg-[#0F1419]">
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">Date</th>
                <th className="px-6 py-4 text-right text-[#A0A0A0] font-semibold text-sm">Amount</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Method</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdrawal, idx) => (
                <tr key={idx} className="border-b border-[#2A2E3E] hover:bg-[#0F1419]/50 transition-colors">
                  <td className="px-6 py-4 text-[#FFFFFF]">{withdrawal.date}</td>
                  <td className="px-6 py-4 text-right text-[#00FF88] font-bold">{withdrawal.amount}</td>
                  <td className="px-6 py-4 text-center text-[#A0A0A0]">{withdrawal.method}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30">
                      {withdrawal.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Earnings Chart (Placeholder) */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#FFFFFF] mb-6">Monthly Earnings Trend</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {[40, 52, 48, 65, 58, 72, 85].map((height, idx) => (
            <div key={idx} className="flex-1 bg-gradient-to-t from-[#00D9FF] to-[#00FF88] rounded-t opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="flex justify-between mt-4 text-xs text-[#A0A0A0]">
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
