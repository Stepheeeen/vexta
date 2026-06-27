'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { TrendingUp, Loader2, Play, HelpCircle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ProfitCalculator } from '@/components/profit-calculator';

interface StatsData {
  stats: {
    totalInvested: number;
    operationalCapital: number;
    totalEarned: number;
    totalCommissions: number;
    availableBalance: number;
    p2pBalance: number;
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
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);

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
    setIsActivationModalOpen(true);
  };


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
          {/* ── Premium Hero Section ────────────────────────────────────────── */}
          <div className="relative mb-8">
            {/* Background glowing gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-blue-600/10 rounded-3xl blur-xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/0 dark:from-white/5 dark:to-transparent rounded-3xl" />
            
            <div className="relative bg-white/60 dark:bg-[#0A0F14]/80 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-3xl p-8 overflow-hidden shadow-xl shadow-violet-900/5">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                  <p className="text-xs font-bold font-mono text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                    {t('depOperatingCapital') || 'Total Active Capital'}
                  </p>
                  <h2 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 dark:from-white dark:via-violet-200 dark:to-slate-300 font-mono drop-shadow-sm">
                    ${(data?.stats.totalInvested ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 font-mono mt-3 max-w-sm">
                    {t('portfolioStat1Sub') || 'Total amount of money you have invested'}
                  </p>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-3">
                  <Dialog open={isActivationModalOpen} onOpenChange={setIsActivationModalOpen}>
                    <DialogTrigger asChild>
                      <button className="relative group w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-violet-600/25 transition-all hover:scale-105 hover:shadow-violet-600/40 active:scale-95">
                        <div className="absolute inset-0 rounded-2xl bg-white/20 group-hover:opacity-0 transition-opacity" />
                        <TrendingUp className="w-5 h-5 relative z-10" />
                        <span className="relative z-10 text-sm tracking-wide">{t('portfolioActivatePackage') || 'Activate Package'}</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none p-0">
                      <ProfitCalculator 
                        availableBalance={data?.stats.availableBalance || 0} 
                        p2pBalance={data?.stats.p2pBalance || 0} 
                        onSuccess={() => {
                          setIsActivationModalOpen(false);
                          fetchData();
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  <p className="text-[10px] text-center text-slate-400 dark:text-zinc-500 font-mono uppercase tracking-widest">
                    Available: ${(data?.stats.availableBalance ?? 0).toLocaleString()} USDT
                  </p>
                </div>
              </div>

              {/* Stats Grid inside the Hero */}
              <div className="relative mt-10 pt-8 border-t border-slate-200/50 dark:border-white/10 grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">{t('portfolioActiveContracts') || 'Active Contracts'}</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white font-mono">{data?.stats.activeInvestments ?? 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">{t('portfolioStat3') || 'Total ROI Earned'}</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">+${(data?.stats.totalEarned ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">{t('portfolioStat4') || 'Days Active'}</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{daysActive} <span className="text-sm font-normal text-slate-400 dark:text-zinc-500 ml-1">Days</span></p>
                </div>
              </div>
            </div>
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
                  const activeCapital = plan.activeCapital ?? plan.amount;
                  const targetReturn = activeCapital * 2;
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
                            <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{(plan.dailyROI * 100).toFixed(1)}% {t('daily')}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-mono px-2.5 py-1 rounded-full ${active ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-gray-500'}`}>
                          {plan.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {[
                          { label: t('portfolioOriginalDeposit'), value: `$${plan.amount.toLocaleString()}` },
                          { label: t('depOperatingCapital'), value: `$${(plan.activeCapital ?? plan.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, green: true },
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
