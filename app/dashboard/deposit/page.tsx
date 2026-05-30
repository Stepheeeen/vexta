'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { useState, useEffect } from 'react';
import {
  ShieldCheck, ArrowRight, Wallet, Loader2,
  TrendingUp, Star, Rocket, History,
  ChevronRight,
  Zap,
  Crown
} from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  tag: string;
  minDeposit: number;
  dailyROI: number;
  duration: number;
}

interface DepositTx {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  description: string;
  reference?: string;
}

function PlanCard({ plan, onSelect }: { plan: Plan; onSelect: (amount: number) => void }) {
  const { t } = useTranslation();
  const icons: Record<string, React.ReactNode> = {
    'STARTER PLAN': <Zap className="w-5 h-5 text-emerald-400" />,
    'ADVANCE PLAN': <Star className="w-5 h-5 text-amber-400" />,
    'ULTRA PLAN': <Crown className="w-5 h-5 text-violet-400" />,
  };
  const colors: Record<string, string> = {
    'STARTER PLAN': 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20',
    'ADVANCE PLAN': 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
    'ULTRA PLAN': 'from-violet-600/25 to-violet-600/5 border-violet-500/30',
  };
  const colorBadge: Record<string, string> = {
    'STARTER PLAN': 'bg-emerald-500/20 text-emerald-400',
    'ADVANCE PLAN': 'bg-amber-500/20 text-amber-400',
    'ULTRA PLAN': 'bg-violet-500/20 text-violet-400',
  };

  return (
    <div className={`relative flex flex-col p-5 rounded-2xl border bg-gradient-to-br ${colors[plan.tag] || 'from-white/5 to-white/2 border-white/10'} transition-all hover:scale-[1.01] hover:shadow-lg group`}>
      {plan.tag === 'ADVANCE PLAN' && (
        <div className="absolute -top-2.5 right-4 bg-amber-500 text-white text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
          {t('mostPopular')}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-white/5">
          {icons[plan.tag] || <TrendingUp className="w-5 h-5 text-violet-400" />}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{plan.name}</h3>
          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${colorBadge[plan.tag] || 'bg-white/10 text-white'}`}>
            {plan.tag}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 mb-5 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-gray-400">{t('depDailyROI')}</span>
          <span className="font-bold text-emerald-500">{(plan.dailyROI * 100).toFixed(1)}% / day</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-gray-400">{t('depTotalROI')}</span>
          <span className="font-bold text-emerald-400">300%</span>
        </div>
        <div className="flex justify-between border-t border-white/5 pt-2.5">
          <span className="text-slate-500 dark:text-gray-400">{t('depMinDeposit')}</span>
          <span className="font-bold text-slate-900 dark:text-white font-mono">${plan.minDeposit.toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={() => onSelect(plan.minDeposit)}
        className="w-full mt-auto py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-violet-600 hover:text-white text-slate-800 dark:text-white border border-white/10 hover:border-violet-600 transition-all duration-200 flex items-center justify-center gap-1.5 group-hover:border-violet-500/50"
      >
        {t('depDepositFrom')} ${plan.minDeposit.toLocaleString()}
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}



export default function DepositPage() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [deposits, setDeposits] = useState<DepositTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDeposited, setTotalDeposited] = useState(0);

  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const statusColor: Record<string, string> = {
    pending: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    completed: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    failed: 'text-red-500 bg-red-500/10',
  };

  useEffect(() => {
    async function load() {
      try {
        const [plansRes, statsRes] = await Promise.all([
          fetch('/api/plans'),
          fetch('/api/dashboard/stats'),
        ]);

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          const sorted = (plansData.plans || []).sort((a: any, b: any) => a.minDeposit - b.minDeposit);
          setPlans(sorted);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          const txs: DepositTx[] = (statsData.recentTransactions || []).filter((tx: any) => tx.type === 'deposit');
          setDeposits(txs.slice(0, 8));
          const total = txs.filter(tx => tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0);
          setTotalDeposited(total);
        }
      } catch (err) {
        console.error('[DepositPage] load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleProceed = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 10) {
      toast({ title: 'Invalid Amount', description: 'Minimum deposit is $10 USDT.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/plisio/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create payment invoice');

      // Redirect to Plisio secure hosted payment page
      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl;
      } else {
        throw new Error('No invoice URL returned from server');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em] mb-1">
          {t('deposit')}
        </p>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">{t('depFundYourAccount')}</h1>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-xl">
          {t('depSubtitle')}
        </p>
      </div>

      {/* BEP20 Only Banner */}
      <div className="flex items-center gap-3 p-4 mb-8 bg-gradient-to-r from-violet-600/10 via-blue-600/5 to-transparent border border-violet-500/20 rounded-2xl">
        <ShieldCheck className="w-5 h-5 text-violet-500 flex-shrink-0" />
        <p className="text-xs text-slate-700 dark:text-gray-300">
          <span className="font-bold text-violet-600 dark:text-violet-400">{t('depBep20Only')}</span> — {t('depBep20Desc')}
        </p>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
      ) : (
        <div className="space-y-10">

          {/* ── Section 1: {t('depInvPlans')} ────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('depInvPlans')}</h2>
            </div>
            {plans.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-gray-500 font-mono">{t('depNoPlans')}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {plans.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onSelect={(minAmt) => setAmount(String(minAmt))}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Section 2: Deposit Panel & History side-by-side ────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Make a Deposit */}
            <section className="lg:col-span-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-5 h-5 text-violet-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('depMakeDeposit')}</h2>
              </div>

              <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-5 w-full">
                {/* Network badge */}
                <div className="flex items-center gap-2 p-3 bg-violet-500/5 border border-violet-500/20 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-violet-500" />
                  <span className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                    {t('depNetworkBscOnly')}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {t('depAmountUsdt')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min={10}
                      className="w-full pl-8 pr-4 py-3.5 bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl text-slate-900 dark:text-white font-mono text-base focus:outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1.5 font-mono">
                    {t('depMinUsdt')}
                  </p>
                </div>

                {/* Quick amounts */}
                <div className="flex flex-wrap gap-2">
                  {[100, 500, 1000, 2500, 5000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setAmount(String(amt))}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/5 hover:bg-violet-600 hover:text-white text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/5 hover:border-violet-600 transition-all"
                    >
                      ${amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleProceed}
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white text-sm font-bold shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      {t('depProceed')}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Right Column: Deposit Stats & History */}
            <section className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <History className="w-5 h-5 text-violet-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('depHistory')}</h2>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: t('depTotalDep'), value: `$${totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: 'USDT BEP20' },
                  { label: t('depCompleted'), value: deposits.filter(d => d.status === 'completed').length, sub: t('depDeposits') },
                  { label: t('depPendingRev'), value: deposits.filter(d => d.status === 'pending').length, sub: t('depTransactions') },
                  { label: t('depNetwork'), value: 'BEP20', sub: t('depBsc') },
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white font-mono">{stat.value}</p>
                    <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* History list */}
              <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
                {deposits.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 dark:text-gray-500 font-mono">
                    {t('depNoHistory')}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {deposits.map((dep) => (
                      <div key={dep.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/1 transition-colors">
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-white">{dep.description || t('deposit')}</p>
                          <p className="text-[10px] text-slate-400 dark:text-gray-500 font-mono mt-0.5">
                            {new Date(dep.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${statusColor[dep.status] || 'bg-slate-200 text-slate-600'}`}>
                            {dep.status.toUpperCase()}
                          </span>
                          <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                            +${dep.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
