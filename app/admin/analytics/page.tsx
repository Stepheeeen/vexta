'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { Loader2 } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalVolume: number;
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
      </AdminLayout>
    );
  }

  const chartData = [35, 45, 40, 58, 52, 65, 78, 85, 70, 88, 80, 95];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Platform Analytics</h1>
        <p className="text-slate-500 dark:text-gray-400">Real-time platform metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">Total Users</p>
          <p className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">{stats?.totalUsers ?? 0}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">+12.5% from last month</p>
        </div>
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">Total Volume</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            ${stats?.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '0'}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">+18.2% from last month</p>
        </div>
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">Avg. Deposit</p>
          <p className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">
            ${stats && stats.totalUsers > 0 ? (stats.totalVolume / stats.totalUsers).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">+5.3% from last month</p>
        </div>
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">Retention Rate</p>
          <p className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">98.4%</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">+2.1% from last month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Growth */}
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">User Growth (Annual)</h3>
          <div className="h-64 flex items-end justify-between gap-1.5 px-2">
            {chartData.map((height, idx) => (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-md opacity-80 hover:opacity-100 transition-opacity"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-400 dark:text-gray-500 font-sans">
            {months.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>

        {/* Revenue Sources */}
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Arbitrage Volumes</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-500 dark:text-gray-400">Plan A — Starter (45%)</span>
                <span className="text-violet-600 dark:text-violet-400 font-bold">Active</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-3">
                <div className="bg-violet-500 h-3 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-500 dark:text-gray-400">Plan B — Popular (35%)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-3">
                <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-500 dark:text-gray-400">Plan C — Advanced (20%)</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">Active</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-3">
                <div className="bg-amber-500 h-3 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Geographic Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 dark:text-gray-400 text-sm">North America</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">38%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                <div className="bg-violet-500 h-2 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 dark:text-gray-400 text-sm">Europe</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">32%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                <div className="bg-violet-500 h-2 rounded-full" style={{ width: '32%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 dark:text-gray-400 text-sm">Asia Pacific</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">25%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                <div className="bg-violet-500 h-2 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 dark:text-gray-400 text-sm">Other</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">5%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                <div className="bg-violet-500 h-2 rounded-full" style={{ width: '5%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Top Assets</h3>
          <div className="space-y-3">
            {[
              { asset: 'Bitcoin (BTC)', volume: '45%', pct: 45 },
              { asset: 'Ethereum (ETH)', volume: '30%', pct: 30 },
              { asset: 'USDT', volume: '15%', pct: 15 },
              { asset: 'Others', volume: '10%', pct: 10 },
            ].map((item) => (
              <div key={item.asset}>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500 dark:text-gray-400 text-sm">{item.asset}</span>
                  <span className="text-slate-900 dark:text-white font-bold text-sm">{item.volume}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">User Segments</h3>
          <div className="space-y-3">
            {[
              { segment: 'Whales (>$100k)', count: 24, pct: 4.7 },
              { segment: 'High Value ($10k-$100k)', count: 128, pct: 24.4 },
              { segment: 'Regular ($1k-$10k)', count: 248, pct: 47.3 },
              { segment: 'Starter (<$1k)', count: 123, pct: 23.6 },
            ].map((item) => (
              <div key={item.segment}>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500 dark:text-gray-400 text-sm">{item.segment}</span>
                  <span className="text-slate-900 dark:text-white font-bold text-sm">{item.count}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
