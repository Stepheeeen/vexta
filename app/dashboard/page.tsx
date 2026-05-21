'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import Link from 'next/link';
import { TrendingUp, Eye, EyeOff, Copy, ArrowUpRight, ArrowDownRight, Zap, RefreshCw, Plus, Minus, Settings, Loader2, Wallet, ArrowLeftRight, Percent } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/components/translation-provider';
import { WelcomeTour } from '../components/WelcomeTour';
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
  investments: any[];
  recentTransactions: any[];
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [show, setShow] = useState(true);
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('User');
  const [userFirstName, setUserFirstName] = useState('User');
  const [referralCode, setReferralCode] = useState('VEXTA_CODE');

  const [error, setError] = useState<string | null>(null);

  // P2P states
  const [recipient, setRecipient] = useState('');
  const [p2pAmount, setP2pAmount] = useState('');
  const [p2pSubmitting, setP2pSubmitting] = useState(false);

  // Calculator states
  const [calcAmount, setCalcAmount] = useState(1000);
  const [calcDays, setCalcDays] = useState(30);

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

  const handleP2pTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(p2pAmount);
    if (!recipient.trim()) {
      toast({
        title: t('p2pError') || 'Validation Error',
        description: 'Recipient identifier is required.',
        variant: 'destructive',
      });
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: t('p2pError') || 'Validation Error',
        description: 'Transfer amount must be greater than zero.',
        variant: 'destructive',
      });
      return;
    }
    const avail = data?.stats.availableBalance ?? 0;
    if (amountNum > avail) {
      toast({
        title: t('p2pError') || 'Insufficient Funds',
        description: `Your available balance is $${avail.toFixed(2)}.`,
        variant: 'destructive',
      });
      return;
    }

    setP2pSubmitting(true);
    try {
      const res = await fetch('/api/p2p/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientIdentifier: recipient.trim(), amount: amountNum }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to complete P2P transfer');
      }
      toast({
        title: t('p2pSuccess') || 'Transfer Successful',
        description: json.message || `Successfully transferred $${amountNum.toFixed(2)} to ${recipient}`,
      });
      setRecipient('');
      setP2pAmount('');
      await fetchDashboardData();
    } catch (err: any) {
      toast({
        title: t('p2pError') || 'Transfer Failed',
        description: err.message || 'Failed to process P2P transfer request',
        variant: 'destructive',
      });
    } finally {
      setP2pSubmitting(false);
    }
  };

  const getCalcDetails = () => {
    const amount = Number(calcAmount) || 0;
    const days = Number(calcDays) || 0;
    let tier = 'Starter';
    let bonusPct = 0;

    if (amount >= 3000) {
      tier = 'Ultra';
      bonusPct = 0.30;
    } else if (amount >= 1000) {
      tier = 'Prime';
      bonusPct = 0.10;
    } else {
      tier = 'Starter';
      bonusPct = 0;
    }

    const bonusAmt = amount * bonusPct;
    const startingCapital = amount + bonusAmt;
    const endingBalance = startingCapital * Math.pow(1 + 0.01, days);
    const netProfit = endingBalance - amount;

    return {
      tier,
      bonusPct: (bonusPct * 100).toFixed(0) + '%',
      bonusAmt,
      startingCapital,
      endingBalance,
      netProfit,
    };
  };

  const calc = getCalcDetails();

  const metrics = [
    { label: t('overviewBalance'), value: `$${(data?.stats.availableBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: data?.recentTransactions.length ? t('overviewLedger') : t('overviewFreshAccount') },
    { label: t('overviewInvested'), value: `$${(data?.stats.totalInvested ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: `${data?.stats.activeInvestments ?? 0} ${t('overviewActivePlans')}` },
    { label: t('overviewEarned'), value: `$${(data?.stats.totalEarned ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: t('overviewDailyPayouts') },
    { label: t('overviewReferralEarnings'), value: `$${(data?.stats.totalCommissions ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: `${data?.stats.directReferrals ?? 0} ${t('overviewReferralsCount')}` },
  ];

  return (
    <DashboardLayout>
      <WelcomeTour />
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em] mb-1">{t('overview')}</p>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">{t('overviewWelcome')}, {userFirstName}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main CTA Actions */}
          <Link
            href="/dashboard/deposit"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/15 transition-all hover:-translate-y-0.5 duration-200"
          >
            <Wallet className="w-3.5 h-3.5" />
            {t('deposit') || 'Deposit'}
          </Link>
          <Link
            href="/dashboard/withdraw"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-950 dark:text-white text-xs font-semibold transition-all hover:-translate-y-0.5 duration-200"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            {t('withdraw') || 'Withdraw'}
          </Link>
          <Link
            href="/dashboard/arbitrage"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-950 dark:text-white text-xs font-semibold transition-all hover:-translate-y-0.5 duration-200"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {t('arbitrage') || 'Arbitrage'}
          </Link>

          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 hidden lg:block" />

          <button
            onClick={() => setShow(!show)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/3 border border-slate-200 dark:border-white/8 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-xs font-mono transition-all"
          >
            {show ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {show ? t('overviewHideBalance') : t('overviewShowBalance')} {t('overviewBalanceSuffix')}
          </button>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50 flex items-center justify-center"
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
          <div id="tour-metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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



          {/* Two-col section */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            {/* Active Arbitrage */}
            <div id="tour-positions" className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
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
            <div id="tour-referrals" className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
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

          {/* Two-col section 2 (P2P Transfer & Compound Interest Calculator) */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            {/* P2P Transfer Card */}
            <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{t('p2pTransferTitle') || 'P2P Balance Transfer'}</h2>
                    <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{t('p2pTransferSubtitle') || 'Zero-fee internal balance transfers'}</p>
                  </div>
                  <span className="ml-auto text-[9px] font-mono text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">{t('p2pZeroFee') || '0% FEE'}</span>
                </div>

                <form onSubmit={handleP2pTransfer} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-2">{t('p2pRecipientLabel') || 'Recipient Email or Referral Code'}</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="email@example.com or VEXTA_CODE"
                      className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all font-mono"
                      required
                      disabled={p2pSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-2">{t('p2pAmountLabel') || 'Amount (USD)'}</label>
                    <input
                      type="number"
                      step="any"
                      value={p2pAmount}
                      onChange={(e) => setP2pAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all font-mono"
                      required
                      disabled={p2pSubmitting}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={p2pSubmitting}
                    className="w-full py-3 mt-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-violet-600/15"
                  >
                    {p2pSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t('p2pProcessing') || 'Processing...'}</span>
                      </>
                    ) : (
                      <span>{t('p2pButton') || 'Transfer Balance'}</span>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Compound Interest Calculator Card */}
            <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Percent className="w-4 h-4 text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{t('calcTitle') || 'Compound Interest Calculator'}</h2>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{t('calcDailyReturn') || 'Simulate daily compounding at 1%'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-mono text-slate-500 dark:text-gray-500 uppercase tracking-wider">{t('calcAmount') || 'Investment Amount'}</label>
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">${calcAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50000"
                    step="10"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-600 dark:accent-violet-400"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 dark:text-gray-500 font-mono mt-1">
                    <span>$10</span>
                    <span>$50,000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-mono text-slate-500 dark:text-gray-500 uppercase tracking-wider">{t('calcDays') || 'Duration (Days)'}</label>
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">{calcDays} {t('days') || 'days'}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="365"
                    step="1"
                    value={calcDays}
                    onChange={(e) => setCalcDays(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-600 dark:accent-violet-400"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 dark:text-gray-500 font-mono mt-1">
                    <span>1 day</span>
                    <span>365 days</span>
                  </div>
                </div>

                {/* Calculation Outputs */}
                <div className="pt-3 border-t border-slate-200/50 dark:border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-gray-500 font-mono">{t('calcTier') || 'Plan Tier'}</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{calc.tier} (1% daily)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-gray-500 font-mono">{t('calcBonus') || 'Initial Bonus'}</span>
                    <span className="font-bold text-green-500 dark:text-[#00FF88] font-mono">+{calc.bonusPct} (${calc.bonusAmt.toFixed(2)})</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-gray-500 font-mono">{t('calcStarting') || 'Starting Operating Capital'}</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">${calc.startingCapital.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-gray-500 font-mono">{t('calcEnding') || 'Compounded Ending Balance'}</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 font-mono text-sm">${calc.endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-gray-500 font-mono">{t('calcProfit') || 'Net Profit'}</span>
                    <span className="font-bold text-green-600 dark:text-green-400 font-mono">${calc.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
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
