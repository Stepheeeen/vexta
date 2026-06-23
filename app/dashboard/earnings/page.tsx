'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Wallet, ArrowUpRight, ArrowDownRight, Calendar, Loader2, Play, HelpCircle, ArrowRight, TrendingUp, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';

interface StatsData {
  stats: {
    totalInvested: number;
    totalEarned: number;
    totalCommissions: number;
    totalEarnings: number;
    passiveEarnings: number;
    networkEarnings: number;
    availableBalance: number;
    p2pBalance: number;
    activeInvestments: number;
    directReferrals: number;
  };
  investments: any[];
}

interface EarningTx {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
}

interface EarningsData {
  transactions: EarningTx[];
  summary: Record<string, number>;
}

type EarningsTab = 'all' | 'passive' | 'network';

const typeColor: Record<string, string> = {
  roi:      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  daily_roi: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  referral: 'bg-blue-500/10  text-blue-600 dark:text-blue-400',
  commission: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  withdraw: 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-gray-400',
  withdrawal: 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-gray-400',
  deposit:  'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  p2p_sent: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  p2p_received: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  p2p_activation: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

export default function EarningsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<EarningsTab>('all');

  const fetchData = async () => {
    try {
      setError(null);
      const [statsRes, earningsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/earnings?limit=40'),
      ]);

      if (statsRes.status === 401 || earningsRes.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (!statsRes.ok || !earningsRes.ok) {
        throw new Error('Failed to fetch financial stats');
      }
      
      const sJson = await statsRes.json();
      const eJson = await earningsRes.json();
      
      setStatsData(sJson);
      setEarningsData(eJson);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading earnings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulate = async () => {
    router.push('/dashboard/arbitrage');
  };

  const passiveEarnings = statsData?.stats.passiveEarnings ?? statsData?.stats.totalEarned ?? 0;
  const networkEarnings = statsData?.stats.networkEarnings ?? statsData?.stats.totalCommissions ?? 0;
  const totalEarnings = passiveEarnings + networkEarnings;
  
  // Calculate total withdrawn
  const totalWithdrawn = Math.abs(
    (earningsData?.transactions || [])
      .filter((t) => t.type === 'withdrawal' && t.status !== 'failed')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  // Filter transactions by active tab
  const filteredTransactions = (earningsData?.transactions || []).filter((tx) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'passive') return tx.type === 'daily_roi' || tx.type === 'roi';
    if (activeTab === 'network') return tx.type === 'commission';
    return true;
  });

  const stats = [
    { label: t('totalEarnings'), value: `$${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: t('totalEarningsSub'), icon: TrendingUp, color: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-500/10 border-violet-500/20' },
    { label: t('passiveEarnings'), value: `$${passiveEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,  change: t('passiveEarningsSub'), icon: Wallet, color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: t('networkEarnings'),  value: `$${networkEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: t('networkEarningsSub'), icon: Users, color: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-500/10 border-blue-500/20' },
    { label: t('earningsStat4'),  value: `$${totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: t('earningsStat4Sub'), icon: ArrowUpRight, color: 'text-slate-600 dark:text-slate-400', iconBg: 'bg-slate-500/10 border-slate-500/20' },
  ];

  const tabs: { key: EarningsTab; label: string }[] = [
    { key: 'all', label: t('earningsTabAll') },
    { key: 'passive', label: t('earningsTabPassive') },
    { key: 'network', label: t('earningsTabNetwork') },
  ];

  // Calculate 200% cap progress for active investments
  const capInvestments = (statsData?.investments || []).filter((i: any) => i.status === 'active');

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em] mb-1">{t('earnings')}</p>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">{t('earnings')}</h1>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-mono text-sm max-w-xl mx-auto my-12 text-center">
          <p className="mb-4">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-red-500 text-white rounded-xl font-sans font-medium hover:bg-red-600 transition-colors">
            {t('retry')}
          </button>
        </div>
      ) : (
        <>


          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, change, icon: Icon, color, iconBg }) => (
              <div key={label} className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-6 h-6 rounded-lg ${iconBg} border flex items-center justify-center`}>
                    <Icon className={`w-3 h-3 ${color}`} />
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
                </div>
                <p className={`text-xl font-bold font-mono mb-2 ${color}`}>{value}</p>
                <div className="text-[10px] font-mono text-slate-500 dark:text-gray-400">
                  {change}
                </div>
              </div>
            ))}
          </div>

          {/* 200% Cap Progress — Active Investments */}
          {capInvestments.length > 0 && (
            <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none mb-6">
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white mb-4">{t('capProgress')}</h3>
              <div className="space-y-3">
                {capInvestments.map((inv: any) => {
                  const maxPayout = inv.maxPayout || inv.amount * 2;
                  const progress = Math.min(100, (inv.totalEarned / maxPayout) * 100);
                  return (
                    <div key={inv.id} className="p-3 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200/50 dark:border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold font-mono text-slate-800 dark:text-white">{inv.plan}</span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                          ${inv.totalEarned?.toFixed(2)} / ${maxPayout.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress >= 90 ? 'bg-red-500' : progress >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] font-mono text-slate-400">{progress.toFixed(1)}%</span>
                        <span className="text-[9px] font-mono text-slate-400">${inv.amount?.toFixed(2)} invested</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Earnings History with Tabs */}
          <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{t('earningsHistory')}</h2>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{t('earningsHistorySubtitle')}</p>
                </div>
              </div>
              {/* Tab Buttons */}
              <div className="flex items-center gap-1 sm:ml-auto bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                {tabs.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-3 py-1.5 text-[10px] font-bold font-mono rounded-lg transition-all ${
                      activeTab === key
                        ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, idx) => {
                  const isForfeited = tx.amount === 0 && tx.description?.includes('forfeited');
                  const positive = tx.amount > 0;
                  const amtColor = isForfeited
                    ? 'text-amber-500 dark:text-amber-400'
                    : positive
                      ? 'text-green-500 dark:text-green-400'
                      : 'text-red-500 dark:text-red-400';
                  
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        {isForfeited
                          ? <ArrowDownRight className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                          : positive
                            ? <ArrowUpRight className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                            : <ArrowDownRight className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                        }
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{tx.description || tx.type.toUpperCase()}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400 dark:text-gray-500" />
                            <span className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">
                              {new Date(tx.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-[9px] font-mono px-2.5 py-1 rounded-full ${typeColor[tx.type] || 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-gray-400'}`}>
                          {tx.type === 'daily_roi' ? 'PASSIVE' : tx.type === 'commission' ? 'NETWORK' : tx.type.toUpperCase().replace('_', ' ')}
                        </span>
                        <p className={`text-sm font-bold font-mono ${amtColor}`}>
                          {positive ? '+' : ''}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 dark:text-gray-500 font-mono py-8 text-center">{t('earningsEmpty')}</p>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
