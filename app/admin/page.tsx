'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin-layout';
import { Users, DollarSign, AlertTriangle, TrendingUp, Loader2, Wallet } from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';

interface Stats {
  totalUsers: number;
  totalVolume: number;
  totalWithdrawals: number;
  pendingWithdrawalsCount: number;
  pendingDepositsCount: number;
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

interface Deposit {
  id: string;
  user: string;
  amount: string;
  date: string;
  status: string;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<Deposit[]>([]);
  const [usersByCountry, setUsersByCountry] = useState<any[]>([]);
  const [depositsByCountry, setDepositsByCountry] = useState<any[]>([]);
  const [userSegments, setUserSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active') return t('adminStatusActive');
    if (s === 'pending') return t('adminStatusPending');
    if (s === 'suspended') return t('adminStatusSuspended');
    if (s === 'completed') return t('adminStatusCompleted');
    if (s === 'rejected') return t('adminStatusRejected');
    if (s === 'failed') return t('adminStatusFailed');
    return status;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      setStats(data.stats);
      setRecentUsers(data.recentUsers);
      setPendingWithdrawals(data.pendingWithdrawals);
      setPendingDeposits(data.pendingDeposits || []);
      setUsersByCountry(data.usersByCountry || []);
      setDepositsByCountry(data.depositsByCountry || []);
      setUserSegments(data.userSegments || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveWithdrawal = async (id: string) => {
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' }),
      });
      if (!res.ok) throw new Error('Approval failed');
      toast({
        title: t('adminAlertSuccess'),
        description: t('adminActionSuccess'),
      });
      fetchDashboardData();
    } catch (err: any) {
      toast({
        title: t('adminAlertError'),
        description: err.message || t('adminActionFailed') || 'Action failed',
        variant: 'destructive',
      });
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
    { label: t('adminMetricTotalUsers'), value: stats?.totalUsers.toString() || '0', icon: Users, change: t('adminMetricTotalUsersSub') },
    { label: t('adminMetricTotalVol'), value: `$${stats?.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` || '$0.00', icon: DollarSign, change: t('adminMetricTotalVolSub') },
    { label: t('adminMetricTotalWithdrawals'), value: `$${stats?.totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` || '$0.00', icon: Wallet, change: t('adminMetricTotalWithdrawalsSub') },
    { label: t('adminMetricPendingDeps'), value: stats?.pendingDepositsCount?.toString() || '0', icon: AlertTriangle, change: t('adminMetricPendingDepsSub') },
    { label: t('adminMetricPendingWiths'), value: stats?.pendingWithdrawalsCount.toString() || '0', icon: AlertTriangle, change: t('adminMetricPendingWithsSub') },
    { label: t('adminMetricRoiAvg'), value: `${((stats?.platformROI ?? 0) * 100).toFixed(1)}%` || '0.0%', icon: TrendingUp, change: t('adminMetricRoiAvgSub') },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('adminDashboardTitle')}</h1>
        <p className="text-slate-500 dark:text-gray-400">{t('adminDashboardSub')}</p>
      </div>

      {/* System Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {systemStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-slate-500 dark:text-gray-400 text-xs font-medium mb-1 truncate">{stat.label}</p>
                  <p className="text-slate-900 dark:text-white text-xl font-bold">{stat.value}</p>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-gray-500 font-mono truncate">
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('adminRecentUsers')}</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/2">
                    <th className="px-4 py-3 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColName')}</th>
                    <th className="px-4 py-3 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColStatus')}</th>
                    <th className="px-4 py-3 text-right text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColBalance')}</th>
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
                          {getStatusLabel(user.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-bold text-sm">{user.balance}</td>
                    </tr>
                  ))}
                  {recentUsers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-400 dark:text-gray-500 text-sm">
                        {t('adminNoRecentUsers')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-white/5">
            <Link href="/admin/users" className="w-full block text-center text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium text-sm transition-colors">
              {t('adminViewAllUsers') || 'View All Users'}
            </Link>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('adminSystemHealth') || 'System Health'}</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 dark:text-gray-400">{t('adminServerUptime') || 'Server Uptime'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">99.9%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '99.9%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 dark:text-gray-400">{t('adminApiResponseTime') || 'API Response Time'}</span>
                  <span className="text-violet-600 dark:text-violet-400 font-bold">45ms</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 dark:text-gray-400">{t('adminDatabaseLoad') || 'Database Load'}</span>
                  <span className="text-violet-600 dark:text-violet-400 font-bold">12%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 dark:text-gray-400">{t('adminMemoryUsage') || 'Memory Usage'}</span>
                  <span className="text-violet-600 dark:text-violet-400 font-bold">34%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full" style={{ width: '34%' }} />
                </div>
              </div>
            </div>
          </div>

          <Link href="/admin/analytics" className="w-full mt-6 py-3 block text-center border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-medium transition-colors">
            {t('adminViewAnalytics') || 'View Analytics'}
          </Link>
        </div>
      </div>

      {/* Geographical Distribution & User Segments */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('adminUsersByCountry') || 'Users by Country'}</h3>
          <div className="space-y-4 flex-1">
            {usersByCountry.map((stat, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex justify-between mb-1 text-sm font-medium">
                  <span className="text-slate-700 dark:text-gray-300">{stat.country}</span>
                  <span className="text-slate-900 dark:text-white">{stat.count} ({stat.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stat.percentage}%` }} />
                </div>
              </div>
            ))}
            {usersByCountry.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-gray-400">No data available.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('adminDepositsByCountry') || 'Deposits by Country'}</h3>
          <div className="space-y-4 flex-1">
            {depositsByCountry.map((stat, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex justify-between mb-1 text-sm font-medium">
                  <span className="text-slate-700 dark:text-gray-300">{stat.country}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">${stat.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({stat.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stat.percentage}%` }} />
                </div>
              </div>
            ))}
            {depositsByCountry.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-gray-400">No data available.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('adminUserSegments') || 'User Segments'}</h3>
          <div className="space-y-4 flex-1">
            {userSegments.map((stat, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex justify-between mb-1 text-sm font-medium">
                  <span className="text-slate-700 dark:text-gray-300">{stat.label}</span>
                  <span className="text-violet-600 dark:text-violet-400">{stat.count} ({stat.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${stat.percentage}%` }} />
                </div>
              </div>
            ))}
            {userSegments.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-gray-400">No data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Pending Deposits & Withdrawals Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending Deposits */}
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('adminMetricPendingDeps') || 'Pending Deposits'}</h3>
              <span className="bg-violet-500/10 text-violet-600 dark:text-violet-400 px-3 py-1 rounded-full text-sm font-bold border border-violet-500/20">
                {pendingDeposits.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/2">
                    <th className="px-4 py-3 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColName') || 'User'}</th>
                    <th className="px-4 py-3 text-right text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColAmount') || 'Amount'}</th>
                    <th className="px-4 py-3 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColDate') || 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDeposits.map((deposit) => (
                    <tr key={deposit.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/1 transition-colors">
                      <td className="px-4 py-3 text-slate-900 dark:text-white text-sm font-medium">{deposit.user}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-bold text-sm">{deposit.amount}</td>
                      <td className="px-4 py-3 text-center text-slate-500 dark:text-gray-400 text-xs">{deposit.date}</td>
                    </tr>
                  ))}
                  {pendingDeposits.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-400 dark:text-gray-500 text-sm">
                        {t('adminNoPendingDeposits') || 'No pending deposits'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-white/5">
            <Link href="/admin/deposits" className="w-full block text-center text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium text-sm transition-colors">
              {t('adminManageDeposits') || 'Manage Deposits'}
            </Link>
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('adminMetricPendingWiths') || 'Pending Withdrawals'}</h3>
              <span className="bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-bold border border-red-500/20">
                {pendingWithdrawals.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/2">
                    <th className="px-4 py-3 text-left text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColName') || 'User'}</th>
                    <th className="px-4 py-3 text-right text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColAmount') || 'Amount'}</th>
                    <th className="px-4 py-3 text-center text-slate-500 dark:text-gray-400 font-semibold text-sm">{t('adminColActions') || 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/1 transition-colors">
                      <td className="px-4 py-3 text-slate-900 dark:text-white text-sm font-medium">{withdrawal.user}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-bold text-sm">{withdrawal.amount}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleApproveWithdrawal(withdrawal.id)}
                          className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium text-sm transition-colors"
                        >
                          {t('adminActionApprove') || 'Approve'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pendingWithdrawals.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-400 dark:text-gray-500 text-sm">
                        {t('adminNoPendingWithdrawals') || 'No pending withdrawals'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-white/5">
            <Link href="/admin/withdrawals" className="w-full block text-center text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium text-sm transition-colors">
              {t('adminManageWithdrawals') || 'Manage Withdrawals'}
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
