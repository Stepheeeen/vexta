'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { GrowthCard } from '@/components/vexta-cards';
import { Users, Copy, Share2, Zap } from 'lucide-react';

export default function Referrals() {
  const referrals = [
    { name: 'Alice Johnson', email: 'alice@example.com', joined: '2024-01-15', earned: '$450.00', active: true },
    { name: 'Bob Smith', email: 'bob@example.com', joined: '2024-02-03', earned: '$320.00', active: true },
    { name: 'Carol Davis', email: 'carol@example.com', joined: '2024-01-28', earned: '$280.00', active: false },
    { name: 'David Wilson', email: 'david@example.com', joined: '2024-03-01', earned: '$150.00', active: true },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">Referral Network</h1>
        <p className="text-[#A0A0A0]">Build your network and earn passive income from referrals</p>
      </div>

      {/* Referral Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <GrowthCard
          title="Total Referrals"
          value="24"
          icon={<Users className="w-5 h-5 text-[#00D9FF]" />}
        />
        <GrowthCard
          title="Active Referrals"
          value="18"
          change={8.3}
          isPositive={true}
        />
        <GrowthCard
          title="Commission Rate"
          value="15%"
          icon={<Zap className="w-5 h-5 text-[#00FF88]" />}
        />
        <GrowthCard
          title="Total Earned"
          value="$3,420.80"
          change={12.5}
          isPositive={true}
        />
      </div>

      {/* Your Referral Code */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold text-[#FFFFFF] mb-4">Your Referral Link</h3>
        <div className="bg-[#0F1419] border border-[#2A2E3E] rounded-lg p-4 mb-4">
          <p className="text-sm text-[#A0A0A0] mb-2">Referral Code</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-lg font-bold text-[#00D9FF] font-mono">VEXTA_JD_8K2L9</p>
            <button
              onClick={() => navigator.clipboard.writeText('VEXTA_JD_8K2L9')}
              className="p-2 hover:bg-[#2A2E3E] rounded transition-colors"
            >
              <Copy className="w-5 h-5 text-[#A0A0A0]" />
            </button>
          </div>
        </div>

        <div className="bg-[#0F1419] border border-[#2A2E3E] rounded-lg p-4 mb-4">
          <p className="text-sm text-[#A0A0A0] mb-2">Full Referral Link</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-mono text-[#00D9FF] truncate">https://vexta.io/ref/VEXTA_JD_8K2L9</p>
            <button
              onClick={() => navigator.clipboard.writeText('https://vexta.io/ref/VEXTA_JD_8K2L9')}
              className="p-2 hover:bg-[#2A2E3E] rounded transition-colors"
            >
              <Copy className="w-5 h-5 text-[#A0A0A0]" />
            </button>
          </div>
        </div>

        <button className="w-full py-3 bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 text-[#00D9FF] border border-[#00D9FF]/30 font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" />
          Share on Social Media
        </button>
      </div>

      {/* Referrals List */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg overflow-hidden">
        <div className="p-6 border-b border-[#2A2E3E]">
          <h3 className="text-lg font-bold text-[#FFFFFF]">Your Referrals</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2E3E] bg-[#0F1419]">
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">Name</th>
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">Email</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Joined</th>
                <th className="px-6 py-4 text-right text-[#A0A0A0] font-semibold text-sm">Earned</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((ref, idx) => (
                <tr key={idx} className="border-b border-[#2A2E3E] hover:bg-[#0F1419]/50 transition-colors">
                  <td className="px-6 py-4 text-[#FFFFFF]">{ref.name}</td>
                  <td className="px-6 py-4 text-[#A0A0A0] text-sm">{ref.email}</td>
                  <td className="px-6 py-4 text-center text-[#A0A0A0] text-sm">{ref.joined}</td>
                  <td className="px-6 py-4 text-right text-[#00FF88] font-bold">{ref.earned}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      ref.active
                        ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30'
                        : 'bg-[#2A2E3E] text-[#A0A0A0] border-[#2A2E3E]'
                    }`}>
                      {ref.active ? 'Active' : 'Inactive'}
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
