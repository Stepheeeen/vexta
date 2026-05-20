'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Wallet, ArrowUpRight, ArrowDownRight, Calendar, Loader2, Play, HelpCircle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';

interface StatsData {
  stats: {
    totalInvested: number;
    totalEarned: number;
    totalCommissions: number;
    availableBalance: number;
    activeInvestments: number;
    directReferrals: number;
  };
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

const typeColor: Record<string, string> = {
  roi:      'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  referral: 'bg-blue-500/10  text-blue-600 dark:text-blue-400',
  withdraw: 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-gray-400',
  deposit:  'bg-emerald-500/10 text-emerald-600 dark:text-[#00FF88]',
};

export default function EarningsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/dashboard/simulate-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'earnings' }),
      });
      const json = await res.json();
      if (res.ok) {
        toast({
          title: 'Simulation Successful',
          description: json.message || 'Demo earnings simulated successfully!',
        });
        await fetchData();
      } else {
        toast({
          title: 'Simulation Failed',
          description: json.error || 'Failed to simulate earnings',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Network Error',
        description: 'Error communicating with demo simulation server',
        variant: 'destructive',
      });
    } finally {
      setSimulating(false);
    }
  };

  const totalEarned = (statsData?.stats.totalEarned ?? 0) + (statsData?.stats.totalCommissions ?? 0);
  const roiIncome = statsData?.stats.totalEarned ?? 0;
  const referralIncome = statsData?.stats.totalCommissions ?? 0;
  
  // Calculate total withdrawn by checking pending/approved withdrawals from transactions
  const totalWithdrawn = Math.abs(
    (earningsData?.transactions || [])
      .filter((t) => t.type === 'withdrawal' && t.status !== 'failed')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const stats = [
    { label: t('earningsStat1'), value: `$${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: t('earningsStat1Sub') },
    { label: t('earningsStat2'), value: `$${roiIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,  change: t('earningsStat2Sub') },
    { label: t('earningsStat3'),  value: `$${referralIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: t('earningsStat3Sub') },
    { label: t('earningsStat4'),  value: `$${totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: t('earningsStat4Sub') },
  ];

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
          {/* Step-by-Step Guideline Banner */}
          <div className="bg-gradient-to-br from-violet-600/10 via-blue-600/5 to-transparent border border-violet-500/10 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{t('earningsGuideTitle')}</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                  {t('earningsGuideDesc')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/50 dark:border-white/5 text-[11px] font-mono">
                  <div className="p-2.5 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-violet-500 font-bold block mb-0.5">{t('earningsGuideStep1Title')}</span>
                    <span className="text-slate-400">{t('earningsGuideStep1Sub')}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-violet-500 font-bold block mb-0.5">{t('earningsGuideStep2Title')}</span>
                    <span className="text-slate-400">{t('earningsGuideStep2Sub')}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-violet-500 font-bold block mb-0.5">{t('earningsGuideStep3Title')}</span>
                    <span className="text-slate-400">{t('earningsGuideStep3Sub')}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-violet-500 font-bold block mb-0.5">{t('earningsGuideStep4Title')}</span>
                    <span className="text-slate-400">{t('earningsGuideStep4Sub')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSimulate}
                disabled={simulating}
                className="flex-shrink-0 flex items-center gap-1.5 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/15 transition-all hover:-translate-y-0.5 duration-200 disabled:opacity-50"
              >
                {simulating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('earningsProcessingBtn')}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{t('earningsSimulateBtn')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, change }) => (
              <div key={label} className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none">
                <p className="text-[10px] font-mono text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3">{label}</p>
                <p className="text-xl font-bold text-slate-950 dark:text-white font-mono mb-2">{value}</p>
                <div className="text-[10px] font-mono text-slate-500 dark:text-gray-400">
                  {change}
                </div>
              </div>
            ))}
          </div>

          {/* History */}
          <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="w-5 h-5 text-violet-500 dark:text-violet-400" />
              <div>
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{t('earningsHistory')}</h2>
                <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{t('earningsHistorySubtitle')}</p>
              </div>
            </div>

            <div className="space-y-3">
              {earningsData && earningsData.transactions.length > 0 ? (
                earningsData.transactions.map((tx, idx) => {
                  const positive = tx.amount > 0;
                  
                  // Resolve type label
                  let type = 'roi';
                  if (tx.type === 'commission') type = 'referral';
                  if (tx.type === 'withdrawal') type = 'withdraw';
                  if (tx.type === 'deposit') type = 'deposit';

                  return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        {positive
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
                        <span className={`text-[9px] font-mono px-2.5 py-1 rounded-full ${typeColor[type] || 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-gray-400'}`}>
                          {type.toUpperCase()}
                        </span>
                        <p className={`text-sm font-bold font-mono ${positive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
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

