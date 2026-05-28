'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { TrendingUp, Loader2, Play, HelpCircle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';

interface StatsData {
  stats: {
    totalInvested: number;
    operationalCapital: number;
    pendingIntegration: number;
    totalEarned: number;
    totalCommissions: number;
    availableBalance: number;
    activeInvestments: number;
    directReferrals: number;
  };
  investments: Array<{
    id: string;
    plan: string;
    amount: number;
    activeCapital: number;
    dailyROI: number;
    duration: number;
    startDate: string;
    endDate: string;
    totalEarned: number;
    status: string;
  }>;
}

export default function PortfolioPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysActive, setDaysActive] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const res = await fetch('/api/dashboard/stats');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to fetch data');
      }
      const json = await res.json();
      setData(json);

      const meRes = await fetch('/api/auth/me');
      if (meRes.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (meRes.ok) {
        const meJson = await meRes.json();
        if (meJson?.user?.createdAt) {
          const created = new Date(meJson.user.createdAt);
          const diffTime = Math.abs(new Date().getTime() - created.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysActive(diffDays);
        } else {
          setDaysActive(1);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulate = async () => {
    router.push('/dashboard/deposit');
  };

  const stats = [
    { label: 'Operational Capital', value: `$${(data?.stats.operationalCapital ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: t('portfolioStat1Sub') },
    { label: 'Pending Profits (48h)', value: `$${(data?.stats.pendingIntegration ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: 'Waiting to compound' },
    { label: t('portfolioStat3'), value: `$${(data?.stats.totalEarned ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: t('portfolioStat3Sub') },
    { label: t('portfolioStat4'), value: `${daysActive}`, change: t('portfolioStat4Sub') },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em] mb-1">{t('portfolio')}</p>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">{t('portfolio')}</h1>
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
                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{t('portfolioGuideTitle')}</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                  {t('portfolioGuideDesc')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/50 dark:border-white/5 text-[11px] font-mono">
                  <div className="p-2.5 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-violet-500 font-bold block mb-0.5">{t('portfolioGuideStep1Title')}</span>
                    <span className="text-slate-400">{t('portfolioGuideStep1Sub')}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-violet-500 font-bold block mb-0.5">{t('portfolioGuideStep2Title')}</span>
                    <span className="text-slate-400">{t('portfolioGuideStep2Sub')}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-violet-500 font-bold block mb-0.5">{t('portfolioGuideStep3Title')}</span>
                    <span className="text-slate-400">{t('portfolioGuideStep3Sub')}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-violet-500 font-bold block mb-0.5">{t('portfolioGuideStep4Title')}</span>
                    <span className="text-slate-400">{t('portfolioGuideStep4Sub')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSimulate}
                className="flex-shrink-0 flex items-center gap-1.5 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/15 transition-all hover:-translate-y-0.5 duration-200"
              >
                <ArrowRight className="w-3.5 h-3.5 fill-current" />
                <span>{t('portfolioSimulateBtn')}</span>
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

          {/* Plans */}
          <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{t('portfolioPlansTitle')}</h2>
                <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{t('portfolioPlansSubtitle')}</p>
              </div>
            </div>

            <div className="space-y-4">
              {data && data.investments.length > 0 ? (
                data.investments.map((plan, idx) => {
                  const active = plan.status === 'active';
                  const targetReturn = plan.amount * 3;
                  const progress = targetReturn > 0
                    ? Math.min(100, Math.max(0, Math.round((plan.totalEarned / targetReturn) * 100)))
                    : 0;

                  return (
                    <div key={idx} className="p-5 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all">
                      {/* Top row */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-slate-200 dark:bg-white/5 border border-slate-200/50 dark:border-white/5'}`}>
                            <TrendingUp className={`w-4 h-4 ${active ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-gray-500'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{plan.plan}</p>
                            <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{(plan.dailyROI * 100).toFixed(1)}% daily</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-mono px-2.5 py-1 rounded-full ${active ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-gray-500'}`}>
                          {plan.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {[
                          { label: 'Original Deposit', value: `$${plan.amount.toLocaleString()}` },
                          { label: 'Operational Capital', value: `$${(plan.activeCapital ?? plan.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, green: true },
                          { label: t('portfolioEarned'), value: `$${plan.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                        ].map(({ label, value, green }) => (
                          <div key={label}>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-mono mb-1">{label}</p>
                            <p className={`text-sm font-bold font-mono ${green ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">{t('portfolioProgress')}</span>
                          <span className="text-[10px] text-slate-600 dark:text-gray-400 font-mono">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${active ? 'bg-gradient-to-r from-violet-500 to-blue-500' : 'bg-slate-400 dark:bg-white/20'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 dark:text-gray-500 font-mono py-8 text-center">{t('portfolioEmpty')}</p>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
