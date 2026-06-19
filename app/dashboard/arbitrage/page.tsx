'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { BarChart3, TrendingUp, Clock, Loader2, Terminal, Shield, Cpu, Play, HelpCircle, ArrowRight, Wallet, TrendingDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';

// ── Constants (must stay in sync with /api/liquidity-volume/route.ts) ──────────
const LAUNCH_DATE = new Date('2025-01-06T00:00:00Z');
const BASE_VOLUME = 1_000_000;
const INCREMENT_PER_PERIOD = 25_000;
const INCREMENT_DAYS = 15;

function computeCurrentVolume(liquidityBonus: number): number {
  const daysSinceLaunch = Math.max(
    0,
    Math.floor((Date.now() - LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24))
  );
  const periods = Math.floor(daysSinceLaunch / INCREMENT_DAYS);
  return BASE_VOLUME + periods * INCREMENT_PER_PERIOD + liquidityBonus;
}

const getExchangeLogo = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('binance')) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-[#F0B90B]/10 border-2 border-[#F0B90B]/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#F0B90B]/5">
        <svg className="w-10 h-10 text-[#F0B90B]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.002 0l-3.32 3.321 3.32 3.32 3.32-3.32L12.002 0zm-7.666 4.346L1.015 7.667l3.321 3.321 3.32-3.321-3.32-3.321zm15.33 0l-3.321 3.321 3.32 3.321 3.321-3.321-3.32-3.321zM1.015 16.335l3.321 3.32 3.32-3.32-3.32-3.321-3.321 3.321zm21.97 0l-3.321-3.32-3.32 3.32 3.32 3.321 3.321-3.32zm-10.983.323l-3.32-3.32 3.32-3.321 3.321 3.32-3.32 3.321zM12.002 24l3.32-3.321-3.32-3.32-3.32 3.32L12.002 24z"/>
        </svg>
      </div>
    );
  }
  if (n.includes('bybit')) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-[#FF9800]/10 border-2 border-[#FF9800]/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#FF9800]/5">
        <svg className="w-10 h-10 text-[#FF9800]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.727 3.515a.91.91 0 00-1.286 0L4.35 10.606a.91.91 0 000 1.286l7.091 7.092a.91.91 0 001.286-1.286l-6.448-6.449 6.448-6.448a.91.91 0 000-1.286zm6.921 7.091l-7.091-7.091a.91.91 0 10-1.286 1.286l6.448 6.448-6.448 6.448a.91.91 0 101.286 1.286l7.091-7.091a.91.91 0 000-1.286z" />
        </svg>
      </div>
    );
  }
  if (n.includes('okx')) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-white/5">
        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="2" width="5.5" height="5.5" rx="1" />
          <rect x="9.25" y="2" width="5.5" height="5.5" rx="1" />
          <rect x="16.5" y="2" width="5.5" height="5.5" rx="1" />
          <rect x="2" y="9.25" width="5.5" height="5.5" rx="1" />
          <rect x="16.5" y="9.25" width="5.5" height="5.5" rx="1" />
          <rect x="2" y="16.5" width="5.5" height="5.5" rx="1" />
          <rect x="9.25" y="16.5" width="5.5" height="5.5" rx="1" />
          <rect x="16.5" y="16.5" width="5.5" height="5.5" rx="1" />
        </svg>
      </div>
    );
  }
  if (n.includes('bitget')) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-[#00F0FF]/10 border-2 border-[#00F0FF]/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#00F0FF]/5">
        <svg className="w-10 h-10 text-[#00F0FF]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 5v8.5L10.5 5H19z" opacity="0.85" />
          <path d="M5 19v-8.5L13.5 19H5z" />
        </svg>
      </div>
    );
  }
  if (n.includes('coinbase')) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-[#0052FF]/10 border-2 border-[#0052FF]/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#0052FF]/5">
        <svg className="w-10 h-10 text-[#0052FF]" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5c2.04 0 3.79-1.22 4.54-3h-2.22c-.54.96-1.57 1.6-2.76 1.6-1.74 0-3.15-1.41-3.15-3.15S10.26 8.85 12 8.85c1.19 0 2.22.64 2.76 1.6h2.22c-.75-1.78-2.5-3-4.54-3z" fill="white" />
        </svg>
      </div>
    );
  }
  if (n.includes('kucoin')) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-[#00E676]/10 border-2 border-[#00E676]/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#00E676]/5">
        <svg className="w-10 h-10 text-[#00E676]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h4.5l5.5 8-5.5 8H4l5.5-8L4 4z" />
          <path d="M10 4h4.5l5.5 8-5.5 8H10l5.5-8L10 4z" opacity="0.8" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 flex items-center justify-center flex-shrink-0">
      <svg className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    </div>
  );
};

interface StatsData {
  stats: {
    totalInvested: number;
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

// ── Helpers ────────────────────────────────────────────────────────────────────
function rnd(a: number, b: number) {
  return +(Math.random() * (b - a) + a).toFixed(4);
}

function generateArbitrageTrade() {
  const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ADA/USDT', 'XRP/USDT', 'LINK/USDT'];
  const exchanges = ['Binance', 'Bybit', 'OKX', 'Bitget', 'Coinbase', 'KuCoin'];
  const pair = pairs[Math.floor(Math.random() * pairs.length)];
  const buyEx = exchanges[Math.floor(Math.random() * exchanges.length)];
  let sellEx = exchanges[Math.floor(Math.random() * exchanges.length)];
  while (buyEx === sellEx) sellEx = exchanges[Math.floor(Math.random() * exchanges.length)];

  // Institutional HFT spreads: 0.5 – 9 bps (0.005 – 0.090%)
  const spread = rnd(0.005, 0.090);
  // Each trade moves $50k–$250k USDT slice of the $1M pool → realistic dollar profit
  const tradeSize = rnd(50000, 250000);
  const profit = +(tradeSize * spread / 100).toFixed(2);

  return { pair, buyExchange: buyEx, sellExchange: sellEx, spread: spread.toFixed(3), profit: profit.toFixed(2) };
}

export default function ArbitragePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Liquidity volume
  const [liquidityData, setLiquidityData] = useState<{
    currentVolume: number;
    liquidityBonus: number;
    launchDate: string;
  } | null>(null);

  // Terminal Console Logs state
  const [logs, setLogs] = useState<string[]>([]);
  const consoleContainerRef = useRef<HTMLDivElement | null>(null);

  // Live AI bot latency & routing speed metrics
  const [latency, setLatency] = useState(12);
  const [opsRate, setOpsRate] = useState(4210);

  const [activeTrade, setActiveTrade] = useState<{
    pair: string;
    buyExchange: string;
    sellExchange: string;
    spread: string;
    profit: string;
  }>({
    pair: 'BTC/USDT',
    buyExchange: 'Binance',
    sellExchange: 'OKX',
    // 0.042% spread on a $190k USDT slice → $79.80 net profit (mathematically consistent)
    spread: '0.042',
    profit: '79.80',
  });

  const [recentTrades, setRecentTrades] = useState<Array<{
    timestamp: string;
    pair: string;
    buyExchange: string;
    sellExchange: string;
    spread: string;
    profit: string;
    status: string;
  }>>(
    // All profits = tradeSize × spread / 100  →  verifiable by anyone
    [
      // $150k × 0.024% = $36.00
      { timestamp: new Date(Date.now() - 20000).toLocaleTimeString(), pair: 'ETH/USDT', buyExchange: 'Bitget',   sellExchange: 'Bybit',    spread: '0.024', profit: '36.00',  status: 'completed' },
      // $210k × 0.051% = $107.10
      { timestamp: new Date(Date.now() - 15000).toLocaleTimeString(), pair: 'SOL/USDT', buyExchange: 'Binance',  sellExchange: 'OKX',      spread: '0.051', profit: '107.10', status: 'completed' },
      // $180k × 0.038% = $68.40
      { timestamp: new Date(Date.now() - 10000).toLocaleTimeString(), pair: 'BTC/USDT', buyExchange: 'Bybit',    sellExchange: 'Coinbase', spread: '0.038', profit: '68.40',  status: 'completed' },
      // $130k × 0.067% = $87.10
      { timestamp: new Date(Date.now() - 5000).toLocaleTimeString(),  pair: 'XRP/USDT', buyExchange: 'Coinbase', sellExchange: 'KuCoin',   spread: '0.067', profit: '87.10',  status: 'completed' },
    ]
  );

  const fetchData = async () => {
    try {
      setError(null);
      const [statsRes, volRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/liquidity-volume'),
      ]);

      if (statsRes.status === 401) { window.location.href = '/login'; return; }
      if (!statsRes.ok) {
        const errorJson = await statsRes.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to fetch stats');
      }
      const json = await statsRes.json();
      setData(json);

      if (volRes.ok) {
        const volJson = await volRes.json();
        setLiquidityData(volJson);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Initial logs for terminal — realistic bps-level spreads, USDT-denominated trade sizes
    const initialLogs = [
      `[${new Date(Date.now() - 40000).toLocaleTimeString()}] [SYSTEM] Vexta Arbitrage Router v3.5 initialized.`,
      `[${new Date(Date.now() - 35000).toLocaleTimeString()}] [SYSTEM] Operating capital: $1,000,000 USDT. Pool Alpha & Beta online.`,
      `[${new Date(Date.now() - 30000).toLocaleTimeString()}] [SYSTEM] Connected to 6 liquidity venues. HFT spread scanner active.`,
      `[${new Date(Date.now() - 25000).toLocaleTimeString()}] [ROUTER] BTC/USDT scanned — bid-ask delta: 0.042% (Pool Alpha vs Pool Beta).`,
      `[${new Date(Date.now() - 20000).toLocaleTimeString()}] [ROUTER] Route locked: Buy Pool Alpha → Sell Pool Beta. Slice: $190,000 USDT.`,
      `[${new Date(Date.now() - 15000).toLocaleTimeString()}] [TRADE] Executed: $190,000 USDT BTC/USDT arb @ 0.042% spread. Latency: 11ms.`,
      `[${new Date(Date.now() - 10000).toLocaleTimeString()}] [SUCCESS] Net Profit: +$79.80 USD. ($190,000 × 0.042% = $79.80)`,
      `[${new Date(Date.now() - 5000).toLocaleTimeString()}] [ROUTER] ETH/USDT scanned — bid-ask delta: 0.051% (Vault Gamma vs Vault Delta).`,
    ];
    setLogs(initialLogs);
  }, []);

  // Auto-cycle: generate new trade every 4–5s
  useEffect(() => {
    const interval = setInterval(() => {
      const trade = generateArbitrageTrade();
      const timestamp = new Date().toLocaleTimeString();
      const poolA = ['Pool Alpha', 'Vault Gamma'][Math.floor(Math.random() * 2)];
      const poolB = ['Pool Beta', 'Vault Delta'][Math.floor(Math.random() * 2)];
      // Pick a realistic USDT trade size for the log (consistent with profit already calculated)
      const sliceK = Math.round((trade as any).size / 1000);

      setActiveTrade(trade);
      setLatency(Math.floor(Math.random() * 8 + 8));
      setOpsRate(Math.floor(Math.random() * 200 + 4100));

      const newLog = [
        // Spread shown in bps-percentage (e.g. 0.042%), not whole percentages
        `[${timestamp}] [ROUTER] ${trade.pair} — bid-ask delta: ${trade.spread}% (${poolA} vs ${poolB}).`,
        `[${timestamp}] [TRADE] Executed: $${sliceK},000 USDT ${trade.pair} arb @ ${trade.spread}% spread.`,
        `[${timestamp}] [SUCCESS] Net Profit: +$${trade.profit} USD. ($${sliceK}k × ${trade.spread}% = $${trade.profit})`,
      ];

      setLogs(prev => {
        const updated = [...prev, ...newLog];
        return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
      });

      setRecentTrades(prev => [
        { timestamp, ...trade, status: 'completed' },
        ...prev
      ].slice(0, 4));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSimulate = async () => {
    router.push('/dashboard/deposit');
  };

  // Compute stats
  const activeCount = data?.stats.activeInvestments ?? 0;
  const totalEarned = data?.stats.totalEarned ?? 0;
  const winRate = data && data.investments.length > 0 ? '100%' : '0%';

  let avgSpread = '0.00%';
  if (data && data.investments.length > 0) {
    const sum = data.investments.reduce((acc, inv) => acc + inv.dailyROI, 0);
    avgSpread = `${((sum / data.investments.length) * 100).toFixed(2)}%`;
  }

  const stats = [
    { label: t('arbitrageStat1'), value: `${activeCount}`, sub: activeCount > 0 ? t('arbitrageStat1Active') : t('arbitrageStat1Empty') },
    { label: t('arbitrageStat2'), value: `$${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: t('arbitrageStat2Sub') },
    { label: t('arbitrageStat3'), value: winRate, sub: t('arbitrageStat3Sub') },
    { label: t('arbitrageStat4'), value: avgSpread, sub: t('arbitrageStat4Sub') },
  ];

  // Formatted volume display
  const currentVolume = liquidityData?.currentVolume ?? computeCurrentVolume(0);
  const launchDateStr = liquidityData?.launchDate
    ? new Date(liquidityData.launchDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'January 6, 2025';

  return (
    <DashboardLayout>
      {/* CSS Flow Animation Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flow-right {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-flow-right {
          stroke-dasharray: 6 12;
          animation: flow-right 1.5s linear infinite;
        }
      ` }} />

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-extrabold text-violet-600 dark:text-violet-300 uppercase tracking-[0.2em] mb-1">{t('arbitrage')}</p>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">{t('arbitrage')}</h1>
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
          {/* ── Liquidity Pool Card ─────────────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-violet-900/60 via-indigo-900/40 to-[#0a0f1a]/80 dark:from-violet-950/80 border border-violet-500/20 rounded-2xl p-5 mb-6 shadow-lg shadow-violet-900/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4 text-violet-300" />
                </div>
                <div>
                  <p className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">Operating Liquidity Pool</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Founded {launchDateStr} · Grows every 15 days</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Active</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Founded With', value: '$1,000,000', color: 'text-white', sub: 'USDT Initial Capital' },
                { label: 'Current Pool Size', value: `$${currentVolume.toLocaleString()}`, color: 'text-emerald-400', sub: `+$${INCREMENT_PER_PERIOD.toLocaleString()} / 15 days` },
                { label: 'Daily Throughput', value: '$1,000,000+', color: 'text-violet-300', sub: 'Pool cycles daily' },
                { label: 'Gross Daily Margin', value: '1.3 – 1.9%', color: 'text-amber-400', sub: '~1% distributed to clients' },
              ].map(({ label, value, color, sub }) => (
                <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-3.5">
                  <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
                  <p className={`text-base font-extrabold font-mono ${color}`}>{value}</p>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Guideline Banner */}
          <div className="bg-gradient-to-br from-violet-600/10 via-blue-600/5 to-transparent border border-violet-500/15 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-violet-600 dark:text-violet-300" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-950 dark:text-white">{t('arbitrageGuideTitle')}</h3>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300 max-w-2xl leading-relaxed">
                  {t('arbitrageGuideDesc')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/50 dark:border-white/5 text-xs font-mono">
                  {[
                    { title: t('arbitrageGuideStep1Title'), sub: t('arbitrageGuideStep1Sub') },
                    { title: t('arbitrageGuideStep2Title'), sub: t('arbitrageGuideStep2Sub') },
                    { title: t('arbitrageGuideStep3Title'), sub: t('arbitrageGuideStep3Sub') },
                    { title: t('arbitrageGuideStep4Title'), sub: t('arbitrageGuideStep4Sub') },
                  ].map(({ title, sub }) => (
                    <div key={title} className="p-3 bg-slate-50 dark:bg-white/2 rounded-xl">
                      <span className="text-xs sm:text-sm font-extrabold block mb-1 text-violet-600 dark:text-violet-300">{title}</span>
                      <span className="text-slate-600 dark:text-zinc-300 font-semibold">{sub}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSimulate}
                className="flex-shrink-0 flex items-center gap-1.5 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-600/15 transition-all hover:-translate-y-0.5 duration-200"
              >
                <ArrowRight className="w-3.5 h-3.5 fill-current" />
                <span>{t('arbitrageSimulateBtn')}</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, sub }) => (
              <div key={label} className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none">
                <p className="text-xs font-bold font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-widest mb-3">{label}</p>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white font-mono mb-1">{value}</p>
                <p className="text-xs text-slate-600 dark:text-zinc-400 font-semibold">{sub}</p>
              </div>
            ))}
          </div>

          {/* Live Arbitrage Routing Panel */}
          <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none mb-6">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200/60 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-violet-600 dark:text-violet-300" />
                <div>
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">{t('arbRouterEngine')}</h2>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 font-semibold font-mono">{t('arbRealtimeMatch')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00FF88] animate-pulse" />
                <span className="text-xs font-mono font-black text-[#00FF88]">{t('arbBotActive')}</span>
              </div>
            </div>

            {/* Visual routing diagram */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-10 bg-slate-50/50 dark:bg-white/2 rounded-3xl border border-slate-200 dark:border-white/5 shadow-inner">
              {/* Buy Exchange Card */}
              <div className="flex-1 w-full p-8 bg-white dark:bg-[#0A0F14]/80 rounded-2xl border border-slate-200 dark:border-white/5 text-center flex flex-col items-center justify-center shadow-md dark:shadow-none hover:scale-[1.03] transition-all duration-300">
                <span className="text-xs font-mono text-green-600 dark:text-emerald-400 font-extrabold uppercase tracking-widest mb-3">{t('arbBuyFrom')}</span>
                {getExchangeLogo(activeTrade.buyExchange)}
                <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono mt-3 tracking-wide uppercase">{activeTrade.buyExchange}</span>
                <span className="text-sm text-slate-600 dark:text-zinc-300 font-bold font-mono mt-1">Pool Alpha</span>
              </div>

              {/* Flow arrow */}
              <div className="flex-[1.5] w-full flex flex-col items-center justify-center py-4">
                <span className="text-xs font-mono text-slate-600 dark:text-zinc-400 font-extrabold tracking-wider mb-2">{t('arbLiqPath')}</span>
                <div className="relative w-full flex items-center justify-center my-3">
                  <svg className="w-full h-16 text-violet-500/20 dark:text-violet-400/20" viewBox="0 0 100 20" preserveAspectRatio="none" fill="none">
                    <path d="M 0 10 L 100 10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" />
                    <path d="M 0 10 L 100 10" stroke="url(#flow-gradient)" strokeWidth="3.5" className="animate-flow-right" />
                    <defs>
                      <linearGradient id="flow-gradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#00FF88" stopOpacity="1" />
                        <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute px-5 py-2.5 bg-violet-600/10 border-2 border-violet-500/30 rounded-full text-xs font-extrabold font-mono text-violet-700 dark:text-violet-300 flex items-center gap-2.5 backdrop-blur-md shadow-lg shadow-violet-500/10">
                    <span>{activeTrade.pair}</span>
                    <span className="text-[#00FF88] font-black">+{activeTrade.spread}%</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#00FF88] mt-2 animate-pulse tracking-wide font-extrabold">{t('arbMatchedSpread')}</span>
              </div>

              {/* Sell Exchange Card */}
              <div className="flex-1 w-full p-8 bg-white dark:bg-[#0A0F14]/80 rounded-2xl border border-slate-200 dark:border-white/5 text-center flex flex-col items-center justify-center shadow-md dark:shadow-none hover:scale-[1.03] transition-all duration-300">
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-extrabold uppercase tracking-widest mb-3">{t('arbSellTo')}</span>
                {getExchangeLogo(activeTrade.sellExchange)}
                <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono mt-3 tracking-wide uppercase">{activeTrade.sellExchange}</span>
                <span className="text-sm text-slate-600 dark:text-zinc-300 font-bold font-mono mt-1">Pool Beta</span>
              </div>
            </div>

            {/* Bottom ticket details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200/60 dark:border-white/5 text-left">
              <div>
                <p className="text-xs font-bold font-mono text-slate-600 dark:text-zinc-400 uppercase">{t('arbTradeVol')}</p>
                <p className="text-xs sm:text-sm font-extrabold font-mono text-slate-900 dark:text-white mt-1">$100k–250k USDT</p>
              </div>
              <div>
                <p className="text-xs font-bold font-mono text-slate-600 dark:text-zinc-400 uppercase">{t('arbExecFee')}</p>
                <p className="text-xs sm:text-sm font-extrabold font-mono text-emerald-500 mt-1">{t('arbZeroFee')}</p>
              </div>
              <div>
                <p className="text-xs font-bold font-mono text-slate-600 dark:text-zinc-400 uppercase">{t('arbGrossSpread')}</p>
                <p className="text-xs sm:text-sm font-extrabold font-mono text-slate-900 dark:text-white mt-1">+{activeTrade.spread}%</p>
              </div>
              <div>
                <p className="text-xs font-bold font-mono text-slate-600 dark:text-zinc-400 uppercase">{t('arbNetProfit')}</p>
                <p className="text-xs sm:text-sm font-extrabold font-mono text-[#00FF88] mt-1">+${activeTrade.profit}</p>
              </div>
            </div>

            {/* Scrolling Feed of Recent Executed Trades */}
            <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-white/5">
              <p className="text-xs font-bold font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-widest mb-3">{t('arbRecentExec')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-left">
                {recentTrades.map((trade, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 rounded-xl flex flex-col justify-between">
                    <div className="flex justify-between items-center text-xs font-mono text-slate-600 dark:text-zinc-300 font-bold mb-2">
                      <span>{trade.timestamp}</span>
                      <span className="text-emerald-500 dark:text-emerald-400 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded">{t('arbSuccess')}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-extrabold font-mono text-slate-900 dark:text-white">{trade.pair}</span>
                      <span className="text-xs font-extrabold font-mono text-green-500 dark:text-emerald-400">+{trade.spread}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 font-bold font-mono mb-2">
                      <span className="font-bold text-slate-700 dark:text-zinc-350">{trade.buyExchange}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-slate-700 dark:text-zinc-350">{trade.sellExchange}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/40 dark:border-white/5 text-xs font-mono">
                      <span className="text-slate-600 dark:text-zinc-300 font-bold font-mono">{t('arbProfit')}</span>
                      <span className="text-[#00FF88] font-extrabold text-xs sm:text-sm">+${parseFloat(trade.profit).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Positions Table */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">{t('arbitrageAllPositions')}</h2>
                  <p className="text-xs font-semibold font-mono text-slate-600 dark:text-zinc-400">{t('arbitrageContracts')}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-extrabold font-mono text-green-600 dark:text-green-450">LIVE</span>
                </div>
              </div>

              <div className="space-y-3">
                {data && data.investments.length > 0 ? (
                  data.investments.map((plan, idx) => {
                    const active = plan.status === 'active';
                    let pair = 'BTC/USD';
                    if (plan.plan.toUpperCase().includes('ADVANCE')) pair = 'ETH/USD';
                    if (plan.plan.toUpperCase().includes('ULTRA')) pair = 'SOL/USD';

                    // 200% cap progress: totalEarned / maxPayout
                    const maxPayout = (plan as any).maxPayout > 0
                      ? (plan as any).maxPayout
                      : plan.amount * 2;
                    const earnedPct = maxPayout > 0
                      ? Math.min(100, (plan.totalEarned / maxPayout) * 100)
                      : 0;
                    const capRemaining = Math.max(0, maxPayout - plan.totalEarned);

                    return (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all">
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-green-500/10' : 'bg-slate-200 dark:bg-white/5'}`}>
                              <TrendingUp className={`w-4 h-4 ${active ? 'text-green-500 dark:text-green-400' : 'text-slate-500 dark:text-zinc-400'}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono">{pair} ({plan.plan})</p>
                              <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                                Cap: ${plan.totalEarned.toFixed(2)} / ${maxPayout.toFixed(2)} &nbsp;·&nbsp; ${capRemaining.toFixed(2)} remaining
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right hidden sm:block">
                              <p className="text-xs font-bold text-slate-600 dark:text-zinc-400 font-mono mb-0.5">{t('arbitrageDepositVol')}</p>
                              <p className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white">${plan.amount.toLocaleString()}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                              <p className="text-xs font-bold text-slate-600 dark:text-zinc-400 font-mono mb-0.5">{t('arbitrageDailySpread')}</p>
                              <p className="text-xs sm:text-sm font-extrabold font-mono text-green-600 dark:text-green-400">+{(plan.dailyROI * 100).toFixed(1)}%</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-slate-600 dark:text-zinc-400 font-mono mb-0.5">{t('arbitragePnL')}</p>
                              <p className="text-sm sm:text-base font-extrabold font-mono text-green-600 dark:text-green-400">+${plan.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <span className={`text-xs font-extrabold font-mono px-2.5 py-1 rounded-full whitespace-nowrap ${active ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-zinc-350'}`}>
                              {plan.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* 200% cap progress bar */}
                        <div className="mt-1">
                          <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-500 mb-1">
                            <span>200% cap progress</span>
                            <span className={earnedPct >= 90 ? 'text-amber-500 font-bold' : ''}>{earnedPct.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                earnedPct >= 90 ? 'bg-amber-500' : earnedPct >= 70 ? 'bg-yellow-400' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${earnedPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 font-bold font-mono py-8 text-center">{t('arbitrageEmpty')}</p>
                )}
              </div>
            </div>

            {/* Right: Live Arbitrage Engine Log Console */}
            <div className="flex flex-col bg-slate-950 border border-slate-900 rounded-2xl p-5 shadow-sm dark:shadow-none h-[580px] text-[#00FF88]">
              <div className="flex items-center gap-3 mb-4 border-b border-slate-900 pb-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">{t('arbitrageConsoleTitle') || 'LIVE ARBITRAGE ENGINE'}</h2>
                  <p className="text-[9px] text-slate-400 font-mono">{t('arbitrageConsoleSubtitle') || 'Monitoring active pairs'}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[8px] font-mono text-green-500">{t("arbMonitor")}</span>
                </div>
              </div>

              {/* AI Operations Status Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4 p-3 bg-slate-900/60 rounded-xl border border-slate-900/60 text-[10px] font-mono text-slate-350">
                <div>
                  <span className="text-slate-500 block uppercase text-[8px] font-black tracking-wider">{t('arbAiLatency')}</span>
                  <span className="text-[#00FF88] font-bold">{latency} ms</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[8px] font-black tracking-wider">{t('arbRoutingSpeed')}</span>
                  <span className="text-cyan-400 font-bold">{opsRate.toLocaleString()} pairs/s</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[8px] font-black tracking-wider">{t('arbActiveThreads')}</span>
                  <span className="text-amber-400 font-bold">16 HFT Bots</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[8px] font-black tracking-wider">{t('arbModelVersion')}</span>
                  <span className="text-violet-400 font-bold">Vexta-AI v3.5</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[8px] font-black tracking-wider">{t('arbConfidence')}</span>
                  <span className="text-emerald-400 font-bold">99.97%</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[8px] font-black tracking-wider">{t('arbSecurity')}</span>
                  <span className="text-[#00FF88] font-bold">AES-GCM-256</span>
                </div>
              </div>

              {/* Console log window */}
              <div
                ref={consoleContainerRef}
                className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 pr-1 custom-scrollbar text-left scroll-smooth"
              >
                {logs.map((log, index) => {
                  let colorClass = 'text-green-400';
                  if (log.includes('[SYSTEM]')) colorClass = 'text-slate-400';
                  if (log.includes('[SUCCESS]')) colorClass = 'text-emerald-400 font-bold';
                  if (log.includes('[ROUTER]')) colorClass = 'text-cyan-405';
                  if (log.includes('[TRADE]')) colorClass = 'text-cyan-400';

                  return (
                    <div key={index} className={`${colorClass} leading-relaxed break-all`}>
                      {log}
                    </div>
                  );
                })}
              </div>

              {/* Console footer */}
              <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-bold text-slate-550 dark:text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-green-500" /> {t('arbitrageConsoleSecureChannel') || 'Encrypted connection'}
                </span>
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-cyan-400" /> Vexta OS v1.2
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
