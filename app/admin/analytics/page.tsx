'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';

interface Stats {
  totalUsers: number;
  totalVolume: number;
  totalWithdrawals: number;
  totalRoiWithdrawals: number;
  totalCommissionWithdrawals: number;
  totalRoiProfit: number;
  totalUnilevelProfit: number;
}

const localeMap = {
  en: 'en-US',
  es: 'es-ES',
  vi: 'vi-VN',
  th: 'th-TH',
  pt: 'pt-PT',
  ko: 'ko-KR',
  fr: 'fr-FR'
};

export default function AdminAnalytics() {
  const { t, language } = useTranslation();
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
  
  // Dynamically translate months using Selected Language
  const locale = localeMap[language as keyof typeof localeMap] || 'en-US';
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'short' });
  const months = Array.from({ length: 12 }, (_, i) => monthFormatter.format(new Date(2026, i, 1)));

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('adminAnalyticsTitle') || 'Platform Analytics'}</h1>
        <p className="text-slate-500 dark:text-gray-400">{t('adminAnalyticsSub') || 'Real-time platform metrics and insights'}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 dark:text-gray-400 text-xs font-medium mb-1 truncate">{t('adminMetricTotalUsers') || 'Total Users'}</p>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-2 truncate">{stats?.totalUsers ?? 0}</p>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">+12.5% {t('adminAnalyticsFromLastMonth') || 'from last month'}</p>
        </div>
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 dark:text-gray-400 text-xs font-medium mb-1 truncate">{t('adminAnalyticsTotalSales') || 'Total Sales'}</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2 truncate">
              ${stats?.totalVolume != null ? stats.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
            </p>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">+18.2% {t('adminAnalyticsFromLastMonth') || 'from last month'}</p>
        </div>
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 dark:text-gray-400 text-xs font-medium mb-1 truncate">{t('adminAnalyticsTotalPayments') || 'Total Payments'}</p>
            <p className="text-2xl font-bold text-rose-500 dark:text-rose-400 mb-2 truncate">
              ${stats?.totalWithdrawals != null ? stats.totalWithdrawals.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
            </p>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">+14.1% {t('adminAnalyticsFromLastMonth') || 'from last month'}</p>
        </div>
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 dark:text-gray-400 text-xs font-medium mb-1 truncate">{t('adminMetricTotalVol') || 'Total Volume'}</p>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-2 truncate">
              ${stats?.totalVolume != null ? stats.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
            </p>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">+18.2% {t('adminAnalyticsFromLastMonth') || 'from last month'}</p>
        </div>
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 dark:text-gray-400 text-xs font-medium mb-1 truncate">{t('adminAnalyticsAvgDeposit') || 'Avg. Deposit'}</p>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-2 truncate">
              ${stats && stats.totalUsers > 0 ? (stats.totalVolume / stats.totalUsers).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
            </p>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">+5.3% {t('adminAnalyticsFromLastMonth') || 'from last month'}</p>
        </div>
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 dark:text-gray-400 text-xs font-medium mb-1 truncate">{t('adminAnalyticsRetention') || 'Retention Rate'}</p>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-2 truncate">98.4%</p>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">+2.1% {t('adminAnalyticsFromLastMonth') || 'from last month'}</p>
        </div>
      </div>

      {/* Outflows & Earnings Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-550 dark:text-zinc-400 text-[10px] font-bold font-mono uppercase tracking-wider mb-1 truncate">{t("adminTotalROIPaid") || "Total ROI Paid"}</p>
            <p className="text-xl font-bold text-violet-605 dark:text-violet-400 font-mono">
              ${stats?.totalRoiProfit != null ? stats.totalRoiProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </p>
          </div>
          <p className="text-[9px] text-slate-400 font-mono mt-2">{t("adminPlatformROIEarnings") || "Platform ROI Earnings Distributed"}</p>
        </div>
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-550 dark:text-zinc-400 text-[10px] font-bold font-mono uppercase tracking-wider mb-1 truncate">{t("adminTotalCommissionsPaid") || "Total Commissions Paid"}</p>
            <p className="text-xl font-bold text-violet-605 dark:text-violet-400 font-mono">
              ${stats?.totalUnilevelProfit != null ? stats.totalUnilevelProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </p>
          </div>
          <p className="text-[9px] text-slate-400 font-mono mt-2">{t("adminPlatformReferralEarnings") || "Platform Referral Earnings Distributed"}</p>
        </div>
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-550 dark:text-zinc-400 text-[10px] font-bold font-mono uppercase tracking-wider mb-1 truncate">{t("adminROIWithdrawals") || "ROI Withdrawals"}</p>
            <p className="text-xl font-bold text-rose-505 dark:text-rose-400 font-mono">
              ${stats?.totalRoiWithdrawals != null ? stats.totalRoiWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </p>
          </div>
          <p className="text-[9px] text-slate-400 font-mono mt-2">{t("adminPaidROIOutflows") || "Paid ROI Outflows Completed"}</p>
        </div>
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-550 dark:text-zinc-400 text-[10px] font-bold font-mono uppercase tracking-wider mb-1 truncate">{t("adminCommissionWithdrawals") || "Commission Withdrawals"}</p>
            <p className="text-xl font-bold text-rose-505 dark:text-rose-400 font-mono">
              ${stats?.totalCommissionWithdrawals != null ? stats.totalCommissionWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </p>
          </div>
          <p className="text-[9px] text-slate-400 font-mono mt-2">{t("adminPaidUnilevelOutflows") || "Paid Unilevel Outflows Completed"}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Growth */}
        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('adminAnalyticsGrowth') || 'User Growth (Annual)'}</h3>
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('adminAnalyticsSources') || 'Arbitrage Volumes'}</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-500 dark:text-gray-400">{t('adminAnalyticsPlanStarter') || 'STARTER PLAN'} (45%)</span>
                <span className="text-violet-600 dark:text-violet-400 font-bold">{t('adminAnalyticsActive') || 'Active'}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-3">
                <div className="bg-violet-500 h-3 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-500 dark:text-gray-400">{t('adminAnalyticsPlanPopular') || 'PRIME PLAN'} (35%)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t('adminAnalyticsActive') || 'Active'}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-3">
                <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-500 dark:text-gray-400">{t('adminAnalyticsPlanAdvanced') || 'ULTRA PLAN'} (20%)</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{t('adminAnalyticsActive') || 'Active'}</span>
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('adminAnalyticsGeo') || 'Geographic Distribution'}</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 dark:text-gray-400 text-sm">{t('adminAnalyticsNorthAmerica') || 'North America'}</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">38%{stats?.totalVolume ? ` ($${(stats.totalVolume * 0.38).toLocaleString(undefined, { maximumFractionDigits: 0 })})` : ''}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                <div className="bg-violet-500 h-2 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 dark:text-gray-400 text-sm">{t('adminAnalyticsEurope') || 'Europe'}</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">32%{stats?.totalVolume ? ` ($${(stats.totalVolume * 0.32).toLocaleString(undefined, { maximumFractionDigits: 0 })})` : ''}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                <div className="bg-violet-500 h-2 rounded-full" style={{ width: '32%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 dark:text-gray-400 text-sm">{t('adminAnalyticsAsiaPacific') || 'Asia Pacific'}</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">25%{stats?.totalVolume ? ` ($${(stats.totalVolume * 0.25).toLocaleString(undefined, { maximumFractionDigits: 0 })})` : ''}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                <div className="bg-violet-500 h-2 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 dark:text-gray-400 text-sm">{t('adminAnalyticsOther') || 'Other'}</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">5%{stats?.totalVolume ? ` ($${(stats.totalVolume * 0.05).toLocaleString(undefined, { maximumFractionDigits: 0 })})` : ''}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                <div className="bg-violet-500 h-2 rounded-full" style={{ width: '5%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('adminAnalyticsAssets') || 'Top Assets'}</h3>
          <div className="space-y-3">
            {[
              { asset: 'Bitcoin (BTC)', volume: '45%', pct: 45 },
              { asset: 'Ethereum (ETH)', volume: '30%', pct: 30 },
              { asset: 'USDT', volume: '15%', pct: 15 },
              { asset: t('adminAnalyticsOthers') || 'Others', volume: '10%', pct: 10 },
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('adminAnalyticsSegments') || 'User Segments'}</h3>
          <div className="space-y-3">
            {[
              { segment: t('adminAnalyticsWhales') || 'Whales (>$1k)', count: 24, pct: 4.7 },
              { segment: t('adminAnalyticsHighValue') || 'High Value ($600-$1k)', count: 128, pct: 24.4 },
              { segment: t('adminAnalyticsRegular') || 'Regular ($100-$600)', count: 248, pct: 47.3 },
              { segment: t('adminAnalyticsStarter') || 'Starter ($10-$100)', count: 123, pct: 23.6 },
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
