'use client';

import { AdminLayout } from '@/components/admin-layout';
import { GrowthCard } from '@/components/vexta-cards';
import { Users, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const systemStats = [
    { label: 'Total Users', value: '5,240', icon: Users, change: 12.5 },
    { label: 'Total Volume', value: '$245.3M', icon: DollarSign, change: 18.2 },
    { label: 'Pending Withdrawals', value: '127', icon: AlertTriangle, change: -5.3 },
    { label: 'Platform ROI', value: '24.5%', icon: TrendingUp, change: 3.1 },
  ];

  const recentUsers = [
    { id: '001', name: 'Alice Johnson', email: 'alice@example.com', joined: '2024-03-15', status: 'Active', balance: '$12,450' },
    { id: '002', name: 'Bob Smith', email: 'bob@example.com', joined: '2024-03-14', status: 'Active', balance: '$8,230' },
    { id: '003', name: 'Carol Davis', email: 'carol@example.com', joined: '2024-03-13', status: 'Pending', balance: '$0' },
    { id: '004', name: 'David Wilson', email: 'david@example.com', joined: '2024-03-12', status: 'Suspended', balance: '$0' },
  ];

  const pendingWithdrawals = [
    { id: 'W001', user: 'John Doe', amount: '$5,000', method: 'Bank Transfer', date: '2024-03-15', status: 'Pending' },
    { id: 'W002', user: 'Jane Smith', amount: '$3,500', method: 'Crypto Wallet', date: '2024-03-15', status: 'Pending' },
    { id: 'W003', user: 'Mike Johnson', amount: '$8,000', method: 'Bank Transfer', date: '2024-03-14', status: 'Under Review' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">Admin Dashboard</h1>
        <p className="text-[#A0A0A0]">Platform overview and system metrics</p>
      </div>

      {/* System Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {systemStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[#A0A0A0] text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-[#FFFFFF] text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#00D9FF]/10 border border-[#00D9FF]/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#00D9FF]" />
                </div>
              </div>
              <p className={`text-sm font-medium ${stat.change > 0 ? 'text-[#00FF88]' : 'text-red-500'}`}>
                {stat.change > 0 ? '+' : ''}{stat.change}% from last month
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Users & Pending Withdrawals */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Recent Users */}
        <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg overflow-hidden">
          <div className="p-6 border-b border-[#2A2E3E]">
            <h3 className="text-lg font-bold text-[#FFFFFF]">Recent Users</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A2E3E] bg-[#0F1419]">
                  <th className="px-4 py-3 text-left text-[#A0A0A0] font-semibold text-sm">Name</th>
                  <th className="px-4 py-3 text-center text-[#A0A0A0] font-semibold text-sm">Status</th>
                  <th className="px-4 py-3 text-right text-[#A0A0A0] font-semibold text-sm">Balance</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[#2A2E3E] hover:bg-[#0F1419]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[#FFFFFF] font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-[#A0A0A0]">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                        user.status === 'Active'
                          ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30'
                          : user.status === 'Pending'
                          ? 'bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/30'
                          : 'bg-red-500/10 text-red-500 border-red-500/30'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[#00FF88] font-bold text-sm">{user.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-[#2A2E3E]">
            <button className="w-full text-[#00D9FF] hover:text-[#00E8FF] font-medium text-sm">
              View All Users
            </button>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#FFFFFF] mb-6">System Health</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[#A0A0A0]">Server Uptime</span>
                <span className="text-[#00FF88] font-bold">99.9%</span>
              </div>
              <div className="w-full bg-[#0F1419] rounded-full h-2">
                <div className="bg-[#00FF88] h-2 rounded-full" style={{ width: '99.9%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[#A0A0A0]">API Response Time</span>
                <span className="text-[#00D9FF] font-bold">45ms</span>
              </div>
              <div className="w-full bg-[#0F1419] rounded-full h-2">
                <div className="bg-[#00D9FF] h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[#A0A0A0]">Database Load</span>
                <span className="text-[#00D9FF] font-bold">62%</span>
              </div>
              <div className="w-full bg-[#0F1419] rounded-full h-2">
                <div className="bg-[#00D9FF] h-2 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[#A0A0A0]">Memory Usage</span>
                <span className="text-[#FFB347] font-bold">78%</span>
              </div>
              <div className="w-full bg-[#0F1419] rounded-full h-2">
                <div className="bg-[#FFB347] h-2 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
          </div>

          <button className="w-full mt-6 py-3 border border-[#00D9FF] text-[#00D9FF] rounded-lg font-medium hover:bg-[#00D9FF]/10 transition-colors">
            View Details
          </button>
        </div>
      </div>

      {/* Pending Withdrawals */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg overflow-hidden">
        <div className="p-6 border-b border-[#2A2E3E] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#FFFFFF]">Pending Withdrawals</h3>
          <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-sm font-bold border border-red-500/30">
            {pendingWithdrawals.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2E3E] bg-[#0F1419]">
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">Request ID</th>
                <th className="px-6 py-4 text-left text-[#A0A0A0] font-semibold text-sm">User</th>
                <th className="px-6 py-4 text-right text-[#A0A0A0] font-semibold text-sm">Amount</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Method</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Status</th>
                <th className="px-6 py-4 text-center text-[#A0A0A0] font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="border-b border-[#2A2E3E] hover:bg-[#0F1419]/50 transition-colors">
                  <td className="px-6 py-4 text-[#00D9FF] font-mono text-sm">{withdrawal.id}</td>
                  <td className="px-6 py-4 text-[#FFFFFF]">{withdrawal.user}</td>
                  <td className="px-6 py-4 text-right text-[#00FF88] font-bold">{withdrawal.amount}</td>
                  <td className="px-6 py-4 text-center text-[#A0A0A0] text-sm">{withdrawal.method}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      withdrawal.status === 'Pending'
                        ? 'bg-red-500/10 text-red-500 border-red-500/30'
                        : 'bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/30'
                    }`}>
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-[#00FF88] hover:text-[#00E070] font-medium text-sm">
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
