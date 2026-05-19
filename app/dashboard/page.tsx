'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { TrendingUp, Eye, EyeOff, Copy, ArrowUpRight, ArrowDownRight, Zap, RefreshCw, Plus, Minus, Settings, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/components/translation-provider';

interface StatsData {
  stats: {
    totalInvested: number;
    totalEarned: number;
    totalCommissions: number;
    availableBalance: number;
    activeInvestments: number;
    directReferrals: number;
  };
  investments: any[];
  recentTransactions: any[];
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [show, setShow] = useState(true);
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('User');
  const [userFirstName, setUserFirstName] = useState('User');
  const [referralCode, setReferralCode] = useState('VEXTA_CODE');

  // Simulation states
  const [simulating, setSimulating] = useState<string | null>(null);
  const [simError, setSimError] = useState<string | null>(null);
  const [simSuccess, setSimSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const res = await fetch('/api/dashboard/stats');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to fetch stats');
      }
      const statsJson = await res.json();
      setData(statsJson);

      // Get user profile info
      const meRes = await fetch('/api/auth/me');
      if (meRes.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (meRes.ok) {
        const meJson = await meRes.json();
        setUserEmail(meJson.user.email);
        setUserFirstName(meJson.user.firstName);
        setReferralCode(meJson.user.referralCode);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSimulateDeposit = async (amount: number) => {
    setSimulating('deposit');
    setSimError(null);
    setSimSuccess(null);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Deposit simulation failed');
      
      setSimSuccess(`Successfully deposited simulated $${amount.toLocaleString()}!`);
      await fetchDashboardData();
    } catch (err: any) {
      setSimError(err.message || 'Deposit failed');
    } finally {
      setSimulating(null);
    }
  };

  const handleSimulateAction = async (action: string) => {
    setSimulating(action);
    setSimError(null);
    setSimSuccess(null);
    try {
      const res = await fetch(`/api/admin/simulate?action=${action}`, {
        method: 'POST',
        headers: { 'x-admin-key': 'vexta-admin-dev' },
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Simulation failed');

      setSimSuccess(`Simulation action '${action}' completed successfully!`);
      await fetchDashboardData();
    } catch (err: any) {
      setSimError(err.message || 'Simulation action failed');
    } finally {
      setSimulating(null);
    }
  };

  const handleSimulateWithdrawal = async (amount: number) => {
    setSimulating('withdrawal');
    setSimError(null);
    setSimSuccess(null);
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          network: 'TRC20',
        }),
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Withdrawal simulation failed');

      setSimSuccess(`Successfully requested simulated withdrawal of $${amount.toLocaleString()}!`);
      await fetchDashboardData();
    } catch (err: any) {
      setSimError(err.message || 'Withdrawal failed');
    } finally {
      setSimulating(null);
    }
  };

  const metrics = [
    { label: t('overviewBalance'), value: `$${(data?.stats.availableBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: data?.recentTransactions.length ? t('overviewLedger') : t('overviewFreshAccount') },
    { label: t('overviewInvested'), value: `$${(data?.stats.totalInvested ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: `${data?.stats.activeInvestments ?? 0} ${t('overviewActivePlans')}` },
    { label: t('overviewEarned'), value: `$${(data?.stats.totalEarned ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: t('overviewDailyPayouts') },
    { label: t('overviewReferralEarnings'), value: `$${(data?.stats.totalCommissions ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: `${data?.stats.directReferrals ?? 0} ${t('overviewReferralsCount')}` },
  ];

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em] mb-1">{t('overview')}</p>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">{t('overviewWelcome')}, {userFirstName}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShow(!show)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/3 border border-slate-200 dark:border-white/8 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-xs font-mono transition-all"
          >
            {show ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {show ? t('overviewHideBalance') : t('overviewShowBalance')} {t('overviewBalanceSuffix')}
          </button>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-1 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50 flex items-center justify-center"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-mono text-sm max-w-xl mx-auto my-12 text-center">
          <p className="mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="px-4 py-2 bg-red-500 text-white rounded-xl font-sans font-medium hover:bg-red-600 transition-colors">
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map(({ label, value, change }) => (
              <div
                key={label}
                className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none"
              >
                <p className="text-[10px] font-mono text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3">{label}</p>
                <p className="text-xl font-bold text-slate-950 dark:text-white mb-2 font-mono">
                  {show ? value : '••••••'}
                </p>
                <div className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-gray-400">
                  {change}
                </div>
              </div>
            ))}
          </div>

          {/* Simulation Controls Panel */}
          <div className="bg-white dark:bg-[#0A0F14]/80 backdrop-blur-xl border border-dashed border-[#00D9FF]/40 dark:border-[#00D9FF]/20 rounded-2xl p-6 mb-8 relative overflow-hidden group shadow-sm dark:shadow-[0_0_20px_rgba(0,217,255,0.02)]">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-[#00D9FF]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#00D9FF]/10 border border-[#00D9FF]/20 flex items-center justify-center">
                <Settings className="w-4 h-4 text-[#00D9FF] animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{t('overviewSimControls')}</h2>
                <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{t('overviewSimControlsSub')}</p>
              </div>
            </div>

            {simError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-xl text-xs font-mono">
                {simError}
              </div>
            )}
            {simSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-mono">
                {simSuccess}
              </div>
            )}

            <div className="grid md:grid-cols-4 gap-4">
              {/* Deposit Card */}
              <div className="bg-slate-50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white font-mono uppercase mb-1">{t('overviewSimStep1')}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 mb-3 leading-relaxed">{t('overviewSimStep1Sub')}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSimulateDeposit(1000)}
                    disabled={simulating !== null}
                    className="flex-1 py-2 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 border border-[#00FF88]/20 text-[#00E070] dark:text-[#00FF88] rounded-lg text-xs font-mono transition-all disabled:opacity-50"
                  >
                    +$1k
                  </button>
                  <button
                    onClick={() => handleSimulateDeposit(5000)}
                    disabled={simulating !== null}
                    className="flex-1 py-2 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 border border-[#00FF88]/20 text-[#00E070] dark:text-[#00FF88] rounded-lg text-xs font-mono transition-all disabled:opacity-50"
                  >
                    +$5k
                  </button>
                </div>
              </div>

              {/* Investment Card */}
              <div className="bg-slate-50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white font-mono uppercase mb-1">{t('overviewSimStep2')}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 mb-3 leading-relaxed">{t('overviewSimStep2Sub')}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={async () => {
                      setSimulating('investment');
                      setSimError(null);
                      setSimSuccess(null);
                      try {
                        // Seed plans
                        await fetch('/api/admin/simulate?action=seed-plans', { method: 'POST', headers: { 'x-admin-key': 'vexta-admin-dev' } });
                        
                        // Fetch plans
                        const pRes = await fetch('/api/plans');
                        if (!pRes.ok) throw new Error('Could not fetch plans. Please try again.');
                        const plansData = await pRes.json();
                        const planC = plansData.plans.find((p: any) => p.name === 'Ultra Plan') || plansData.plans[0];
                        if (!planC) throw new Error('No plans found. Seeding first...');
                        
                        const invRes = await fetch('/api/investments', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ planId: planC.id, amount: 5000 }),
                        });
                        const invJson = await invRes.json();
                        if (!invRes.ok) throw new Error(invJson.error || 'Failed to start investment');
                        setSimSuccess(`Successfully started 60-day simulated Ultra Plan ($5,000)!`);
                        await fetchDashboardData();
                      } catch (err: any) {
                        setSimError(err.message || 'Investment failed');
                      } finally {
                        setSimulating(null);
                      }
                    }}
                    disabled={simulating !== null}
                    className="w-full py-2 bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border border-[#00D9FF]/20 text-[#00A3C4] dark:text-[#00D9FF] rounded-lg text-xs font-mono transition-all disabled:opacity-50"
                  >
                    {t('overviewSimInvestBtn')}
                  </button>
                </div>
              </div>

              {/* ROI Yield Card */}
              <div className="bg-slate-50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white font-mono uppercase mb-1">{t('overviewSimStep3')}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 mb-3 leading-relaxed">{t('overviewSimStep3Sub')}</p>
                </div>
                <button
                  onClick={() => handleSimulateAction('roi')}
                  disabled={simulating !== null}
                  className="w-full py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-600 dark:text-violet-400 rounded-lg text-xs font-mono transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {simulating === 'roi' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      {t('overviewSimTriggerRoi')}
                    </>
                  )}
                </button>
              </div>

              {/* Reset/Clean Card */}
              <div className="bg-slate-50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white font-mono uppercase mb-1">{t('overviewSimStep4')}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 mb-3 leading-relaxed">{t('overviewSimStep4Sub')}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSimulateWithdrawal(500)}
                    disabled={simulating !== null}
                    className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-mono transition-all disabled:opacity-50"
                  >
                    {t('overviewSimWithdrawBtn')}
                  </button>
                  <button
                    onClick={() => handleSimulateAction('reset')}
                    disabled={simulating !== null}
                    className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 dark:text-red-400 rounded-lg text-xs font-mono transition-all disabled:opacity-50"
                  >
                    {t('overviewSimResetBtn')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Two-col section */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            {/* Active Arbitrage */}
            <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{t('overviewActivePositions')}</h2>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{t('overviewArbitrageContracts')}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-green-600 dark:text-green-500">LIVE</span>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {data && data.investments.length > 0 ? (
                  data.investments.filter(i => i.status === 'active').map((i, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200/50 dark:border-white/5">
                      <div>
                        <p className="text-xs font-medium text-slate-900 dark:text-white font-mono">{i.plan}</p>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">Yield contract</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-500 dark:text-green-400 font-mono">+{(i.dailyROI * 100).toFixed(1)}%</p>
                        <span className="text-[9px] font-mono text-green-600 dark:text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">ACTIVE</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 dark:text-gray-500 font-mono py-4 text-center">{t('overviewNoActive')}</p>
                )}
              </div>
            </div>

            {/* Referral Code */}
            <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{t('overviewReferralCode')}</h2>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{t('overviewReferralSub')}</p>
                </div>
              </div>

              {/* Code block */}
              <div className="flex items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 rounded-xl mb-5">
                <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 font-mono tracking-wider">
                  {referralCode}
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(referralCode)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { label: t('referralsStat1'),  value: `${data?.stats.directReferrals ?? 0}`, color: 'text-green-600 dark:text-green-400' },
                  { label: t('overviewCommRate'),    value: 'Level 1-13 (10% - 1%)', color: 'text-violet-600 dark:text-violet-400' },
                  { label: t('overviewTotalComm'),  value: `$${(data?.stats.totalCommissions ?? 0).toFixed(2)}`, color: 'text-green-600 dark:text-green-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-gray-500 font-mono">{label}</span>
                    <span className={`font-bold font-mono ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-semibold text-slate-950 dark:text-white mb-5">{t('overviewRecentActivity')}</h2>
            <div className="space-y-3">
              {data && data.recentTransactions.length > 0 ? (
                data.recentTransactions.map((tx, idx) => {
                  const positive = tx.amount > 0;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${positive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                          {positive
                            ? <ArrowUpRight className="w-4 h-4 text-green-500 dark:text-green-400" />
                            : <ArrowDownRight className="w-4 h-4 text-red-500 dark:text-red-400" />
                          }
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-900 dark:text-white">{tx.description || tx.type.toUpperCase()}</p>
                          <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold font-mono ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {positive ? '+' : ''}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-violet-600 dark:text-violet-400 font-mono mt-0.5">{tx.status.toUpperCase()}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 dark:text-gray-500 font-mono py-6 text-center">{t('overviewNoActivity')}</p>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
