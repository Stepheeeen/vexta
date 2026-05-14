'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { GrowthCard, VerifiedBadge, ProfitBadge } from '@/components/vexta-cards';
import { TrendingUp, Eye, EyeOff, Copy } from 'lucide-react';
import { useState } from 'react';

export default function Dashboard() {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">Welcome back, John!</h1>
            <p className="text-[#A0A0A0]">Here&apos;s your verified growth overview</p>
          </div>
          <VerifiedBadge />
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <GrowthCard
          title="Total Balance"
          value={showBalance ? '$125,430.50' : '••••••'}
          change={12.5}
          isPositive={true}
          icon={
            <button onClick={() => setShowBalance(!showBalance)} className="hover:bg-[#2A2E3E] p-2 rounded">
              {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          }
        />
        <GrowthCard
          title="Month Earnings"
          value={showBalance ? '$8,230.45' : '••••••'}
          change={18.3}
          isPositive={true}
        />
        <GrowthCard
          title="Referral Commissions"
          value={showBalance ? '$3,420.80' : '••••••'}
          change={5.2}
          isPositive={true}
        />
        <GrowthCard
          title="ROI"
          value="24.5%"
          change={3.1}
          isPositive={true}
        />
      </div>

      {/* Active Trading & Referral Network */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Active Trading */}
        <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#00FF88]" />
            </div>
            <h3 className="text-lg font-bold text-[#FFFFFF]">Active Arbitrage</h3>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg border border-[#2A2E3E]">
              <div>
                <p className="text-sm text-[#A0A0A0]">BTC/USD Spread</p>
                <p className="text-lg font-bold text-[#00FF88]">+2.3%</p>
              </div>
              <span className="text-xs bg-[#00FF88]/10 text-[#00FF88] px-3 py-1 rounded-full border border-[#00FF88]/30">
                ACTIVE
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg border border-[#2A2E3E]">
              <div>
                <p className="text-sm text-[#A0A0A0]">ETH/USD Spread</p>
                <p className="text-lg font-bold text-[#00FF88]">+1.8%</p>
              </div>
              <span className="text-xs bg-[#00FF88]/10 text-[#00FF88] px-3 py-1 rounded-full border border-[#00FF88]/30">
                ACTIVE
              </span>
            </div>
          </div>

          <button className="w-full py-3 border border-[#00D9FF] text-[#00D9FF] rounded-lg font-medium hover:bg-[#00D9FF]/10 transition-colors">
            View All Trades
          </button>
        </div>

        {/* Referral Network */}
        <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#FFFFFF] mb-6">Your Referral Code</h3>
          
          <div className="bg-[#0F1419] border border-[#2A2E3E] rounded-lg p-4 mb-6">
            <p className="text-sm text-[#A0A0A0] mb-2">Your Unique Code</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-2xl font-bold text-[#00D9FF] font-mono">VEXTA_JD_8K2L9</p>
              <button
                onClick={() => navigator.clipboard.writeText('VEXTA_JD_8K2L9')}
                className="p-2 hover:bg-[#2A2E3E] rounded transition-colors text-[#A0A0A0]"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-[#A0A0A0]">Direct Referrals</span>
              <span className="text-[#00FF88] font-bold">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A0A0A0]">Commission Rate</span>
              <span className="text-[#00D9FF] font-bold">15%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A0A0A0]">This Month Earned</span>
              <span className="text-[#00FF88] font-bold">+$3,420.80</span>
            </div>
          </div>

          <button className="w-full py-3 border border-[#00D9FF] text-[#00D9FF] rounded-lg font-medium hover:bg-[#00D9FF]/10 transition-colors">
            Manage Referrals
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#FFFFFF] mb-6">Recent Activity</h3>
        
        <div className="space-y-4">
          {[
            { type: 'Deposit', amount: '+$5,000', time: '2 hours ago', status: 'Verified' },
            { type: 'Arbitrage Trade', amount: '+$245.30', time: '5 hours ago', status: 'Completed' },
            { type: 'Referral Earned', amount: '+$125.00', time: '1 day ago', status: 'Credited' },
            { type: 'Withdrawal', amount: '-$2,000', time: '3 days ago', status: 'Verified' },
          ].map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg border border-[#2A2E3E]"
            >
              <div>
                <p className="text-[#FFFFFF] font-medium">{activity.type}</p>
                <p className="text-sm text-[#A0A0A0]">{activity.time}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${activity.amount.startsWith('+') ? 'text-[#00FF88]' : 'text-[#FFFFFF]'}`}>
                  {activity.amount}
                </p>
                <p className="text-xs text-[#00D9FF]">{activity.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
