'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin-layout';
import { Users, DollarSign, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalVolume: number;
  pendingWithdrawalsCount: number;
  platformROI: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  joined: string;
  status: string;
  balance: string;
}

interface Withdrawal {
  id: string;
  user: string;
  amount: string;
  method: string;
  date: string;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      setStats(data.stats);
      setRecentUsers(data.recentUsers);
      setPendingWithdrawals(data.pendingWithdrawals);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' }),
      });
      if (!res.ok) throw new Error('Approval failed');
      // Refresh
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-mono text-sm">
          {error}
        </div>
      </AdminLayout>
    );
  }

  const systemStats = [
    { label: 'Total Users', value: stats?.totalUsers.toString() || '0', icon: Users, change: 'All users' },
    { label: 'Total Volume', value: `$${stats?.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` || '$0.00', icon: DollarSign, change: 'Lifetime deposits' },
    { label: 'Pending Withdrawals', value: stats?.pendingWithdrawalsCount.toString() || '0', icon: AlertTriangle, change: 'Awaiting approval' },
    { label: 'Platform ROI Avg', value: `${((stats?.platformROI ?? 0) * 100).toFixed(1)}%` || '0.0%', icon: TrendingUp, change: 'Standard yield' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-gray-400">Platform overview and system metrics</p>
      </div>

      {/* System Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {systemStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-slate-900 dark:text-white text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-400 dark:text-gray-500 font-mono">
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Users & System Health */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Recent Users */}
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm">
          <div>
            <div className="p-6 border-b border-slate-200 dark:border-white/5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Users</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/2">
                    <th className="px-4 py-3 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">Name</th>
                    <th className="px-4 py-3 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">Status</th>
                    <th className="px-4 py-3 text-right text-slate-500 dark:text-gray-400 font-semibold text-sm">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/1 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-slate-900 dark:text-white font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          user.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : user.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/30'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-bold text-sm">{user.balance}</td>
                    </tr>
                  ))}
                  {recentUsers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-400 dark:text-gray-500 text-sm">
                        No recent users registered
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-white/5">
            <Link href="/admin/users" className="w-full block text-center text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium text-sm transition-colors">
              View All Users
            </Link>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">System Health</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 dark:text-gray-400">Server Uptime</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">99.9%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '99.9%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 dark:text-gray-400">API Response Time</span>
                  <span className="text-violet-600 dark:text-violet-400 font-bold">45ms</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 dark:text-gray-400">Database Load</span>
                  <span className="text-violet-600 dark:text-violet-400 font-bold">12%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 dark:text-gray-400">Memory Usage</span>
                  <span className="text-violet-600 dark:text-violet-400 font-bold">34%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full" style={{ width: '34%' }} />
                </div>
              </div>
            </div>
          </div>

          <Link href="/admin/analytics" className="w-full mt-6 py-3 block text-center border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-medium transition-colors">
            View Analytics
          </Link>
        </div>
      </div>

      {/* Pending Withdrawals */}
      <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pending Withdrawals</h3>
          <span className="bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-bold border border-red-500/20">
            {pendingWithdrawals.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/2">
                <th className="px-6 py-4 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">Request ID</th>
                <th className="px-6 py-4 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">User</th>
                <th className="px-6 py-4 text-right text-slate-500 dark:text-gray-400 font-semibold text-sm">Amount</th>
                <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">Method</th>
                <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">Status</th>
                <th className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/1 transition-colors">
                  <td className="px-6 py-4 text-violet-600 dark:text-violet-400 font-mono text-sm">{withdrawal.id}</td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white">{withdrawal.user}</td>
                  <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">{withdrawal.amount}</td>
                  <td className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 text-sm">{withdrawal.method}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleApprove(withdrawal.id)}
                      className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium text-sm transition-colors"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
              {pendingWithdrawals.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 dark:text-gray-500 text-sm">
                    No pending withdrawals
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
