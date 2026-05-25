'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import Link from 'next/link';
import {
  TrendingUp, Eye, EyeOff, Copy, Check, ArrowUpRight, ArrowDownRight,
  Zap, RefreshCw, Settings, Loader2, Wallet, ArrowLeftRight, Percent,
  Activity, Radio, ChevronRight
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';

// ── Types ──────────────────────────────────────────────────────────────────────
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

// ── HFT Arbitrage Visual Engine ────────────────────────────────────────────────
const EXCHANGES = ['Binance', 'OKX', 'Bybit', 'KuCoin', 'Kraken', 'Gate.io'];
const PAIRS = ['USDT/BTC', 'USDT/ETH', 'USDT/SOL', 'USDT/BNB', 'USDT/XRP', 'USDT/AVAX'];
const SIDES = ['BUY ↑', 'SELL ↓'];

function randomBetween(a: number, b: number) {
  return +(Math.random() * (b - a) + a).toFixed(4);
}

function generateTrade() {
  const buy = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];
  let sell = buy;
  while (sell === buy) sell = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];
  const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
  const spread = randomBetween(0.012, 0.38);
  const profit = randomBetween(0.8, 47.2);
  const size = randomBetween(1200, 98000);
  return { buy, sell, pair, spread, profit, size, id: Date.now() + Math.random() };
}

function ArbitrageEngine() {
  const { t } = useTranslation();
  const [trades, setTrades] = useState(() => Array.from({ length: 6 }, generateTrade));
  const [activePath, setActivePath] = useState<{ buy: string; sell: string } | null>(null);
  const [spread, setSpread] = useState('0.142%');
  const [totalPnL, setTotalPnL] = useState(0);
  const [execCount, setExecCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const trade = generateTrade();
      setTrades(prev => [trade, ...prev.slice(0, 7)]);
      setActivePath({ buy: trade.buy, sell: trade.sell });
      setSpread(`${randomBetween(0.01, 0.49).toFixed(3)}%`);
      setTotalPnL(prev => prev + trade.profit);
      setExecCount(prev => prev + 1);
    }, 1100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <div className="relative h-full flex flex-col bg-[#040810] rounded-2xl overflow-hidden border border-violet-500/15 shadow-xl shadow-violet-900/10 min-w-0">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-3.5 border-b border-white/5 bg-gradient-to-r from-violet-950/60 to-blue-950/30 gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 shrink">
          <div className="relative w-2 h-2 shrink-0">
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-70" />
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-white font-mono tracking-wide truncate">{t("dashHftEngine")}</span>
          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full shrink-0">{t("dashLive")}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-mono text-slate-400 shrink-0">
          <span className="hidden sm:inline">{t("dashSpread")} <span className="text-emerald-400 font-bold">{spread}</span></span>
          <span>{t("dashExec")} <span className="text-violet-400 font-bold">{execCount}</span></span>
          <span>{t("dashPnl")} <span className="text-emerald-400 font-bold">+${totalPnL.toFixed(2)}</span></span>
        </div>
      </div>

      {/* Exchange Routing Diagram */}
      <div className="px-3 sm:px-5 pt-4 pb-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          {EXCHANGES.slice(0, 6).map((ex) => {
            const isActive = activePath?.buy === ex || activePath?.sell === ex;
            const isBuy = activePath?.buy === ex;
            return (
              <div
                key={ex}
                className={`relative py-2.5 px-3 rounded-xl border text-[10px] font-mono font-bold transition-all duration-300 ${
                  isActive
                    ? isBuy
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-sm shadow-emerald-500/20'
                      : 'bg-blue-500/15 border-blue-500/50 text-blue-400 shadow-sm shadow-blue-500/20'
                    : 'bg-white/3 border-white/8 text-slate-500'
                }`}
              >
                {isActive && (
                  <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${isBuy ? 'bg-emerald-400' : 'bg-blue-400'} animate-pulse`} />
                )}
                {ex}
                {isActive && (
                  <div className={`text-[8px] mt-0.5 ${isBuy ? 'text-emerald-500' : 'text-blue-500'}`}>
                    {isBuy ? '▲ BUY' : '▼ SELL'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Animated SVG routing path */}
        <div className="relative h-8 mt-2">
          <svg className="w-full h-full" viewBox="0 0 400 32" preserveAspectRatio="none">
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#06d6a0" stopOpacity="1" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path d="M 0 16 Q 100 4 200 16 Q 300 28 400 16" stroke="url(#routeGrad)" strokeWidth="2" fill="none" strokeDasharray="6,3">
              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1.5s" repeatCount="indefinite" />
            </path>
            <circle r="4" fill="#06d6a0">
              <animateMotion dur="1.5s" repeatCount="indefinite" path="M 0 16 Q 100 4 200 16 Q 300 28 400 16" />
            </circle>
          </svg>
        </div>
      </div>

      {/* Live Trade Ticker */}
      <div className="flex-1 overflow-hidden px-3 sm:px-5 pb-4">
        <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2">{t("dashLiveExecuted")}</div>
        <div className="space-y-1.5 overflow-hidden" style={{ maxHeight: '200px' }}>
          {trades.map((trade, i) => (
            <div
              key={trade.id}
              className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-[9px] sm:text-[10px] font-mono transition-all duration-500 min-w-0 ${
                i === 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/2 border border-white/5'
              }`}
              style={{ opacity: 1 - i * 0.1 }}
            >
              <span className="text-emerald-400 font-bold w-12 sm:w-16 flex-shrink-0 truncate">{trade.pair}</span>
              <span className="text-violet-400 flex-shrink-0">↔</span>
              <span className="text-slate-400 flex-1 truncate min-w-0">{trade.buy} → {trade.sell}</span>
              <span className="text-amber-400 flex-shrink-0">Δ{trade.spread}%</span>
              <span className="text-emerald-400 font-bold flex-shrink-0">+${trade.profit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom stats strip */}
      <div className="grid grid-cols-3 border-t border-white/5 text-center">
        {[
          { label: 'Execution Speed', value: `${Math.floor(Math.random() * 40 + 8)}ms` },
          { label: 'Active Pairs', value: `${Math.floor(Math.random() * 12 + 18)}` },
          { label: 'Today\'s ROI', value: `+${randomBetween(1.1, 2.8).toFixed(2)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="py-3 border-r last:border-r-0 border-white/5">
            <div className="text-[9px] text-slate-600 uppercase font-mono mb-0.5">{label}</div>
            <div className="text-xs font-bold text-emerald-400 font-mono">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profit Calculator Component ────────────────────────────────────────────────
function ProfitCalculator() {
  const { t } = useTranslation();
  const [calcAmount, setCalcAmount] = useState(1000);

  const getCalcDetails = () => {
    const amount = Number(calcAmount) || 0;
    let tier = 'STARTER PLAN';
    let bonusPct = 0;
    if (amount >= 3000) { bonusPct = 0.30; }
    else if (amount >= 1000) { bonusPct = 0.10; }
    const bonusAmt = amount * bonusPct;
    const startingCapital = amount + bonusAmt;
    const dailyReturn = startingCapital * 0.01;
    const endingBalance = startingCapital * 3.0;
    const netProfit = endingBalance - amount;
    return { tier, bonusPct: (bonusPct * 100).toFixed(0) + '%', bonusAmt, startingCapital, dailyReturn, endingBalance, netProfit };
  };

  const calc = getCalcDetails();

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0A0F14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Percent className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('calcTitle') || 'Profit Calculator'}</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-300 font-semibold font-mono mt-0.5">{t("dashCalcTitle")}</p>
        </div>
      </div>

      <div className="space-y-5 flex-1">
        {/* Amount slider */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold font-mono text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
              {t('calcAmount') || 'Investment Amount'}
            </label>
            <div className="flex items-center text-sm font-black font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-0.5 shadow-inner">
              <span className="text-slate-400 mr-0.5">$</span>
              <input
                type="number"
                value={calcAmount || ''}
                onChange={e => {
                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                  setCalcAmount(val);
                }}
                className="w-20 bg-transparent text-right font-black font-mono focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
          <input
            type="range" min={10} max={50000} step={10} value={calcAmount}
            onChange={e => setCalcAmount(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-violet-600"
          />
          <div className="flex justify-between text-xs text-slate-550 dark:text-zinc-400 font-bold font-mono mt-1">
            <span>$10</span><span>$50,000</span>
          </div>
        </div>

        {/* Results */}
        <div className="bg-slate-50 dark:bg-white/3 rounded-2xl p-4 space-y-2.5 border border-slate-200 dark:border-white/5">
          {[
            { label: t('depPlanTier'), value: calc.tier + " · 1.0%/day" },
            { label: t('depSignupBonus'), value: "+" + calc.bonusPct + " (+$" + calc.bonusAmt.toFixed(2) + ")", color: 'text-emerald-600 dark:text-emerald-400' },
            { label: t('depOperatingCapital'), value: "$" + calc.startingCapital.toFixed(2) },
            { label: t('depDailyReturn'), value: "$" + calc.dailyReturn.toFixed(2) + " / day", color: 'text-emerald-600 dark:text-emerald-400' },
            { label: t('depPayoutLimit'), value: '300.0% ROI' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-zinc-400 font-semibold font-mono">{label}</span>
              <span className={`font-bold font-mono ${color || 'text-slate-900 dark:text-white'}`}>{value}</span>
            </div>
          ))}

          <div className="border-t border-slate-200 dark:border-white/5 pt-2.5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600 dark:text-zinc-300 font-bold font-mono">{t("dashMaxReturn")}</span>
              <span className="text-base font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400">
                {"$" + calc.endingBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600 dark:text-zinc-300 font-bold font-mono">{t("dashNetProfit")}</span>
              <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                {"+" + calc.netProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/dashboard/deposit?amount=${calcAmount}`}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white text-xs font-bold shadow-lg shadow-violet-600/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
        >
          {"Deposit $" + calcAmount.toLocaleString() + " Now"}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [show, setShow] = useState(true);
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userFirstName, setUserFirstName] = useState('User');
  const [referralCode, setReferralCode] = useState('VEXTA_CODE');
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // P2P states
  const [recipient, setRecipient] = useState('');
  const [p2pAmount, setP2pAmount] = useState('');
  const [p2pSubmitting, setP2pSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const res = await fetch('/api/dashboard/stats');
      if (res.status === 401) { window.location.href = '/login'; return; }
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to fetch stats');
      setData(await res.json());

      const meRes = await fetch('/api/auth/me');
      if (meRes.status === 401) { window.location.href = '/login'; return; }
      if (meRes.ok) {
        const meJson = await meRes.json();
        setUserFirstName(meJson.user.firstName);
        setReferralCode(meJson.user.referralCode);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleP2pTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(p2pAmount);
    if (!recipient.trim()) {
      toast({ title: 'Validation Error', description: 'Recipient is required.', variant: 'destructive' }); return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: 'Validation Error', description: 'Amount must be greater than zero.', variant: 'destructive' }); return;
    }
    const avail = data?.stats.availableBalance ?? 0;
    if (amountNum > avail) {
      toast({ title: 'Insufficient Funds', description: `Balance: $${avail.toFixed(2)}`, variant: 'destructive' }); return;
    }
    setP2pSubmitting(true);
    try {
      const res = await fetch('/api/p2p/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientIdentifier: recipient.trim(), amount: amountNum }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Transfer failed');
      toast({ title: 'Transfer Successful', description: json.message });
      setRecipient(''); setP2pAmount('');
      await fetchDashboardData();
    } catch (err: any) {
      toast({ title: 'Transfer Failed', description: err.message, variant: 'destructive' });
    } finally {
      setP2pSubmitting(false);
    }
  };

  const metrics = [
    {
      label: t('overviewBalance'),
      value: `$${(data?.stats.availableBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: data?.recentTransactions.length ? t('overviewLedger') : t('overviewFreshAccount'),
    },
    {
      label: t('overviewInvested'),
      value: `$${(data?.stats.totalInvested ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${data?.stats.activeInvestments ?? 0} ${t('overviewActivePlans')}`,
    },
    {
      label: t('overviewEarned'),
      value: `$${(data?.stats.totalEarned ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: t('overviewDailyPayouts'),
    },
    {
      label: t('overviewReferralEarnings'),
      value: `$${(data?.stats.totalCommissions ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${data?.stats.directReferrals ?? 0} ${t('overviewReferralsCount')}`,
    },
  ];

  return (
    <DashboardLayout>
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold font-mono text-violet-600 dark:text-violet-300 uppercase tracking-[0.2em] mb-1">{t('overview')}</p>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">{t('overviewWelcome')}, {userFirstName}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/dashboard/deposit" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/15 transition-all hover:-translate-y-0.5 duration-200">
            <Wallet className="w-3.5 h-3.5" />{t('deposit') || 'Deposit'}
          </Link>
          <Link href="/dashboard/withdraw" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-950 dark:text-white text-xs font-semibold transition-all hover:-translate-y-0.5 duration-200">
            <ArrowUpRight className="w-3.5 h-3.5" />{t('withdraw') || 'Withdraw'}
          </Link>
          <Link href="/dashboard/arbitrage" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-950 dark:text-white text-xs font-semibold transition-all hover:-translate-y-0.5 duration-200">
            <TrendingUp className="w-3.5 h-3.5" />{t('arbitrage') || 'Arbitrage'}
          </Link>
          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 hidden lg:block" />
          <button
            onClick={() => setShow(!show)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/3 border border-slate-200 dark:border-white/8 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-xs font-mono transition-all"
          >
            {show ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {show ? t('overviewHideBalance') : t('overviewShowBalance')} {t('overviewBalanceSuffix')}
          </button>
          <button onClick={fetchDashboardData} disabled={loading} className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50" title="Refresh">
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
          <button onClick={fetchDashboardData} className="px-4 py-2 bg-red-500 text-white rounded-xl font-sans font-medium hover:bg-red-600 transition-colors">{t("dashRetry")}</button>
        </div>
      ) : (
        <>
          {/* ── Metric Cards ────────────────────────────────────────────── */}
          <div id="tour-metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map(({ label, value, change }) => (
              <div key={label} className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-none overflow-hidden min-w-0">
                <p className="text-[10px] sm:text-xs font-bold font-mono text-slate-550 dark:text-zinc-400 uppercase tracking-widest mb-3 truncate">{label}</p>
                <p className="text-base sm:text-xl font-black text-slate-950 dark:text-white mb-2 font-mono truncate">{show ? value : '••••••'}</p>
                <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold text-slate-600 dark:text-zinc-350 truncate">{change}</div>
              </div>
            ))}
          </div>

          {/* ── HERO: HFT Arbitrage Engine + Profit Calculator ──────────── */}
          <div className="grid lg:grid-cols-5 gap-6 mb-8">
            {/* LEFT 3/5 — Arbitrage Engine */}
            <div className="lg:col-span-3 min-h-[480px]">
              <ArbitrageEngine />
            </div>
            {/* RIGHT 2/5 — Profit Calculator */}
            <div className="lg:col-span-2">
              <ProfitCalculator />
            </div>
          </div>

          {/* ── Secondary Grid: Active Positions + Referral Code ────────── */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            {/* Active Arbitrage Positions */}
            <div id="tour-positions" className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-none overflow-hidden min-w-0">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">{t('overviewActivePositions')}</h2>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 font-semibold font-mono mt-0.5">{t('overviewArbitrageContracts')}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold font-mono text-green-600 dark:text-green-400">LIVE</span>
                </div>
              </div>
              <div className="space-y-3">
                {data && data.investments.length > 0 ? (
                  data.investments.filter(i => i.status === 'active').map((i, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200/50 dark:border-white/5 min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono truncate">{i.plan}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-zinc-400 font-semibold font-mono mt-0.5">{t("dashYieldContract")}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm sm:text-base font-black text-green-500 dark:text-green-400 font-mono">+{(i.dailyROI * 100).toFixed(1)}%</p>
                        <span className="text-[9px] sm:text-[10px] font-extrabold font-mono text-green-600 dark:text-green-400 bg-green-500/10 px-2 sm:px-2.5 py-0.5 rounded-full">{t("dashActive")}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-semibold font-mono py-4 text-center">{t('overviewNoActive')}</p>
                )}
              </div>
            </div>

            {/* Referral Code */}
            <div id="tour-referrals" className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-none overflow-hidden min-w-0">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">{t('overviewReferralCode')}</h2>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 font-semibold font-mono mt-0.5">{t('overviewReferralSub')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 p-3 sm:p-4 bg-slate-50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 rounded-xl mb-5 min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-zinc-300 font-mono break-all select-all min-w-0">
                  {`https://www.vexta.network/?ref=${referralCode}`}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://www.vexta.network/?ref=${referralCode}`);
                    setCopiedReferral(true);
                    setTimeout(() => setCopiedReferral(false), 2000);
                    toast({ title: 'Copied', description: 'Referral link copied to clipboard!' });
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all shrink-0"
                >
                  {copiedReferral ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label: t('referralsStat1'), value: `${data?.stats.directReferrals ?? 0}`, color: 'text-green-600 dark:text-green-400' },
                  { label: t('overviewCommRate'), value: 'Level 1-13 (10% → 0.25%)', color: 'text-violet-600 dark:text-violet-400' },
                  { label: t('overviewTotalComm'), value: `$${(data?.stats.totalCommissions ?? 0).toFixed(2)}`, color: 'text-green-600 dark:text-green-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-wrap justify-between items-center gap-x-2 gap-y-0.5 text-xs">
                    <span className="text-slate-600 dark:text-zinc-400 font-semibold font-mono">{label}</span>
                    <span className={`font-bold font-mono text-[10px] sm:text-xs ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── P2P Transfer ────────────────────────────────────────────── */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{t('p2pTransferTitle') || 'P2P Balance Transfer'}</h2>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 font-mono mt-0.5">{t('p2pTransferSubtitle') || 'Zero-fee internal balance transfers'}</p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold text-violet-600 dark:text-violet-300 bg-violet-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{t('p2pZeroFee') || '0% FEE'}</span>
                </div>
                <form onSubmit={handleP2pTransfer} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wider mb-2">{t('p2pRecipientLabel') || 'Recipient Email or Referral Code'}</label>
                    <input type="text" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="email@example.com or VEXTA_CODE"
                      className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all font-mono"
                      required disabled={p2pSubmitting} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wider mb-2">{t('p2pAmountLabel') || 'Amount (USD)'}</label>
                    <input type="number" step="any" value={p2pAmount} onChange={e => setP2pAmount(e.target.value)} placeholder="0.00"
                      className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all font-mono"
                      required disabled={p2pSubmitting} />
                  </div>
                  <button type="submit" disabled={p2pSubmitting}
                    className="w-full py-3 mt-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-violet-600/15">
                    {p2pSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>{t('p2pProcessing') || 'Processing...'}</span></> : <span>{t('p2pButton') || 'Transfer Balance'}</span>}
                  </button>
                </form>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h2 className="text-sm font-semibold text-slate-950 dark:text-white mb-5">{t('overviewRecentActivity')}</h2>
              <div className="space-y-3">
                {data && data.recentTransactions.length > 0 ? (
                  data.recentTransactions.slice(0, 5).map((tx, idx) => {
                    const positive = tx.amount > 0;
                    return (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${positive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            {positive ? <ArrowUpRight className="w-3.5 h-3.5 text-green-500" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.description || tx.type.toUpperCase()}</p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold font-mono">{new Date(tx.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm sm:text-base font-extrabold font-mono ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {positive ? '+' : ''}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] font-bold text-violet-600 dark:text-violet-300 font-mono">{tx.status.toUpperCase()}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-semibold font-mono py-6 text-center">{t('overviewNoActivity')}</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
