'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { BarChart3, TrendingUp, Clock, Loader2, Terminal, Shield, Cpu, Play, HelpCircle, ArrowRight, Wallet } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';

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
    dailyROI: number;
    duration: number;
    startDate: string;
    endDate: string;
    totalEarned: number;
    status: string;
  }>;
}

export default function ArbitragePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Terminal Console Logs state
  const [logs, setLogs] = useState<string[]>([]);
  const consoleContainerRef = useRef<HTMLDivElement | null>(null);

  // New states for investment card and live routing
  const [plans, setPlans] = useState<any[]>([]);
  const [investAmount, setInvestAmount] = useState('');
  const [investing, setInvesting] = useState(false);

  const [activeTrade, setActiveTrade] = useState<{
    pair: string;
    buyExchange: string;
    sellExchange: string;
    spread: string;
    amount: string;
    profit: string;
  }>({
    pair: 'BTC/USDT',
    buyExchange: 'Binance',
    sellExchange: 'OKX',
    spread: '1.84',
    amount: '0.45',
    profit: '148.20'
  });

  const [recentTrades, setRecentTrades] = useState<Array<{
    timestamp: string;
    pair: string;
    buyExchange: string;
    sellExchange: string;
    spread: string;
    amount: string;
    profit: string;
    status: string;
  }>>([
    { timestamp: new Date(Date.now() - 20000).toLocaleTimeString(), pair: 'ETH/USDT', buyExchange: 'Bitget', sellExchange: 'Bybit', spread: '1.24', amount: '2.50', profit: '75.40', status: 'completed' },
    { timestamp: new Date(Date.now() - 15000).toLocaleTimeString(), pair: 'SOL/USDT', buyExchange: 'Binance', sellExchange: 'OKX', spread: '2.10', amount: '15.20', profit: '45.10', status: 'completed' },
    { timestamp: new Date(Date.now() - 10000).toLocaleTimeString(), pair: 'BTC/USDT', buyExchange: 'Bybit', sellExchange: 'Coinbase', spread: '1.45', amount: '0.12', profit: '32.80', status: 'completed' },
    { timestamp: new Date(Date.now() - 5000).toLocaleTimeString(), pair: 'LINK/USDT', buyExchange: 'Coinbase', sellExchange: 'KuCoin', spread: '1.75', amount: '84.00', profit: '22.30', status: 'completed' },
  ]);

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
        throw new Error(errorJson.error || 'Failed to fetch stats');
      }
      const json = await res.json();
      setData(json);

      // Fetch plans for investment card
      const resPlans = await fetch('/api/plans');
      if (resPlans.ok) {
        const plansJson = await resPlans.json();
        setPlans(plansJson.plans || []);
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

    // Initial logs for terminal
    const initialLogs = [
      `[${new Date(Date.now() - 30000).toLocaleTimeString()}] [SYSTEM] Vexta Arbitrage Router initialized.`,
      `[${new Date(Date.now() - 25000).toLocaleTimeString()}] [SYSTEM] Connected to Internal Pool Alpha (Depth: $1.2M).`,
      `[${new Date(Date.now() - 20000).toLocaleTimeString()}] [SYSTEM] Connected to Internal Pool Beta (Depth: $850k).`,
      `[${new Date(Date.now() - 15000).toLocaleTimeString()}] [SYSTEM] Scanned spread: BTC/USDT @ +1.84%.`,
      `[${new Date(Date.now() - 10000).toLocaleTimeString()}] [ROUTER] Route locked: Buy Pool Alpha -> Sell Pool Beta.`,
      `[${new Date(Date.now() - 5000).toLocaleTimeString()}] [TRADE] Executed 0.45 BTC arbitrage. Profit: +$148.20.`,
    ];
    setLogs(initialLogs);
  }, []);

  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/dashboard/simulate-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'arbitrage' }),
      });
      const json = await res.json();
      if (res.ok) {
        toast({
          title: 'Simulation Successful',
          description: json.message || 'Demo arbitrage contract activated successfully!',
        });
        await fetchData();
      } else {
        toast({
          title: 'Simulation Failed',
          description: json.error || 'Failed to activate demo arbitrage contract',
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

  useEffect(() => {
    const interval = setInterval(() => {
      const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ADA/USDT', 'XRP/USDT', 'LINK/USDT'];
      const exchanges = ['Binance', 'Bybit', 'OKX', 'Bitget', 'Coinbase', 'KuCoin'];
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const buyEx = exchanges[Math.floor(Math.random() * exchanges.length)];
      let sellEx = exchanges[Math.floor(Math.random() * exchanges.length)];
      while (buyEx === sellEx) {
        sellEx = exchanges[Math.floor(Math.random() * exchanges.length)];
      }
      const spread = (Math.random() * 2 + 1).toFixed(2);
      const amount = (Math.random() * 5 + 0.1).toFixed(2);
      const profit = (Math.random() * 200 + 10).toFixed(2);
      const timestamp = new Date().toLocaleTimeString();

      const newTrade = {
        pair,
        buyExchange: buyEx,
        sellExchange: sellEx,
        spread,
        amount,
        profit
      };

      setActiveTrade(newTrade);

      const poolA = ['Pool Alpha', 'Vault Gamma'][Math.floor(Math.random() * 2)];
      const poolB = ['Pool Beta', 'Vault Delta'][Math.floor(Math.random() * 2)];

      const newLog = [
        `[${timestamp}] [ROUTER] Scanned spread: ${pair} on ${poolA} & ${poolB} @ +${spread}%`,
        `[${timestamp}] [TRADE] Executed: buy ${amount} ${pair.split('/')[0]} on ${poolA}, sell on ${poolB}`,
        `[${timestamp}] [SUCCESS] Arbitrage complete. Net Profit: +$${profit} USD.`,
      ];

      setLogs((prev) => {
        const updated = [...prev, ...newLog];
        if (updated.length > 50) {
          return updated.slice(updated.length - 50);
        }
        return updated;
      });

      setRecentTrades(prev => {
        const updated = [
          { timestamp, ...newTrade, status: 'completed' },
          ...prev
        ];
        return updated.slice(0, 4);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(investAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid investment amount.',
        variant: 'destructive',
      });
      return;
    }

    // Find matching plan
    const matching = plans
      .sort((a, b) => b.minDeposit - a.minDeposit)
      .find(p => amountNum >= p.minDeposit);

    if (!matching) {
      toast({
        title: 'Validation Error',
        description: 'Amount must be at least $10.00 to match Starter Plan.',
        variant: 'destructive',
      });
      return;
    }

    const available = data?.stats.availableBalance ?? 0;
    if (amountNum > available) {
      toast({
        title: 'Insufficient Balance',
        description: `Your available balance is $${available.toFixed(2)}.`,
        variant: 'destructive',
      });
      return;
    }

    setInvesting(true);
    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: matching.id, amount: amountNum }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to activate investment');
      }
      toast({
        title: 'Investment Activated',
        description: `Successfully activated ${matching.name} with $${amountNum.toFixed(2)}.`,
      });
      setInvestAmount('');
      await fetchData();
    } catch (err: any) {
      toast({
        title: 'Investment Failed',
        description: err.message || 'An error occurred while creating investment.',
        variant: 'destructive',
      });
    } finally {
      setInvesting(false);
    }
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
    { label: t('arbitrageStat1'), value: `${activeCount}`,       sub: activeCount > 0 ? t('arbitrageStat1Active') : t('arbitrageStat1Empty') },
    { label: t('arbitrageStat2'),   value: `$${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: t('arbitrageStat2Sub') },
    { label: t('arbitrageStat3'), value: winRate,               sub: t('arbitrageStat3Sub') },
    { label: t('arbitrageStat4'), value: avgSpread,             sub: t('arbitrageStat4Sub') },
  ];

  const amountNum = parseFloat(investAmount);
  const matchingPlan = plans.length > 0 && !isNaN(amountNum)
    ? plans
        .slice()
        .sort((a, b) => b.minDeposit - a.minDeposit)
        .find(p => amountNum >= p.minDeposit)
    : null;

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
                  <div className="p-3 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-xs sm:text-sm font-extrabold block mb-1 text-violet-600 dark:text-violet-300">{t('arbitrageGuideStep1Title')}</span>
                    <span className="text-slate-600 dark:text-zinc-300 font-semibold">{t('arbitrageGuideStep1Sub')}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-xs sm:text-sm font-extrabold block mb-1 text-violet-600 dark:text-violet-300">{t('arbitrageGuideStep2Title')}</span>
                    <span className="text-slate-600 dark:text-zinc-300 font-semibold">{t('arbitrageGuideStep2Sub')}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-xs sm:text-sm font-extrabold block mb-1 text-violet-600 dark:text-violet-300">{t('arbitrageGuideStep3Title')}</span>
                    <span className="text-slate-600 dark:text-zinc-300 font-semibold">{t('arbitrageGuideStep3Sub')}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-white/2 rounded-xl">
                    <span className="text-xs sm:text-sm font-extrabold block mb-1 text-violet-600 dark:text-violet-300">{t('arbitrageGuideStep4Title')}</span>
                    <span className="text-slate-600 dark:text-zinc-300 font-semibold">{t('arbitrageGuideStep4Sub')}</span>
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
                    <span>{t('arbitrageProcessingBtn')}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{t('arbitrageSimulateBtn')}</span>
                  </>
                )}
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

          {/* Live Arbitrage Routing Panel (Visual flow matching layout) */}
          <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none mb-6">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200/60 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-violet-600 dark:text-violet-300" />
                <div>
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">VEXTA HFT ROUTER ENGINE</h2>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 font-semibold font-mono">Real-time global exchange liquidity matching</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00FF88] animate-pulse" />
                <span className="text-xs font-mono font-black text-[#00FF88]">HFT BOT ACTIVE</span>
              </div>
            </div>

            {/* Visual routing diagram */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-10 bg-slate-50/50 dark:bg-white/2 rounded-3xl border border-slate-200 dark:border-white/5 shadow-inner">
              {/* Buy Exchange Card */}
              <div className="flex-1 w-full p-8 bg-white dark:bg-[#0A0F14]/80 rounded-2xl border border-slate-200 dark:border-white/5 text-center flex flex-col items-center justify-center shadow-md dark:shadow-none hover:scale-[1.03] transition-all duration-300">
                <span className="text-xs font-mono text-green-600 dark:text-emerald-400 font-extrabold uppercase tracking-widest mb-3">BUY FROM</span>
                {getExchangeLogo(activeTrade.buyExchange)}
                <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono mt-3 tracking-wide uppercase">{activeTrade.buyExchange}</span>
                <span className="text-sm text-slate-600 dark:text-zinc-300 font-bold font-mono mt-1">$63,450.20</span>
              </div>

              {/* Glowing flow direction arrow paths */}
              <div className="flex-[1.5] w-full flex flex-col items-center justify-center py-4">
                <span className="text-xs font-mono text-slate-600 dark:text-zinc-400 font-extrabold tracking-wider mb-2">LIQUIDITY PATH</span>
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
                <span className="text-xs font-mono text-[#00FF88] mt-2 animate-pulse tracking-wide font-extrabold">MATCHED SPREAD FOUND</span>
              </div>

              {/* Sell Exchange Card */}
              <div className="flex-1 w-full p-8 bg-white dark:bg-[#0A0F14]/80 rounded-2xl border border-slate-200 dark:border-white/5 text-center flex flex-col items-center justify-center shadow-md dark:shadow-none hover:scale-[1.03] transition-all duration-300">
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-extrabold uppercase tracking-widest mb-3">SELL TO</span>
                {getExchangeLogo(activeTrade.sellExchange)}
                <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono mt-3 tracking-wide uppercase">{activeTrade.sellExchange}</span>
                <span className="text-sm text-slate-600 dark:text-zinc-300 font-bold font-mono mt-1">$64,524.80</span>
              </div>
            </div>

            {/* Bottom ticket details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200/60 dark:border-white/5 text-left">
              <div>
                <p className="text-xs font-bold font-mono text-slate-600 dark:text-zinc-400 uppercase">Trade Volume</p>
                <p className="text-xs sm:text-sm font-extrabold font-mono text-slate-900 dark:text-white mt-1">{activeTrade.amount} BTC</p>
              </div>
              <div>
                <p className="text-xs font-bold font-mono text-slate-600 dark:text-zinc-400 uppercase">Execution Fee</p>
                <p className="text-xs sm:text-sm font-extrabold font-mono text-emerald-500 mt-1">0.00% (Zero Fee)</p>
              </div>
              <div>
                <p className="text-xs font-bold font-mono text-slate-600 dark:text-zinc-400 uppercase">Gross Spread PnL</p>
                <p className="text-xs sm:text-sm font-extrabold font-mono text-slate-900 dark:text-white mt-1">+{activeTrade.spread}%</p>
              </div>
              <div>
                <p className="text-xs font-bold font-mono text-slate-600 dark:text-zinc-400 uppercase">Net Simulated profit</p>
                <p className="text-xs sm:text-sm font-extrabold font-mono text-[#00FF88] mt-1">+${activeTrade.profit}</p>
              </div>
            </div>

            {/* Scrolling Feed of Recent Executed Trades */}
            <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-white/5">
              <p className="text-xs font-bold font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-widest mb-3">Recent Router Executions</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-left">
                {recentTrades.map((t, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 rounded-xl flex flex-col justify-between">
                    <div className="flex justify-between items-center text-xs font-mono text-slate-600 dark:text-zinc-300 font-bold mb-2">
                      <span>{t.timestamp}</span>
                      <span className="text-emerald-500 dark:text-emerald-400 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded">SUCCESS</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-extrabold font-mono text-slate-900 dark:text-white">{t.pair}</span>
                      <span className="text-xs font-extrabold font-mono text-green-500 dark:text-emerald-400">+{t.spread}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 font-bold font-mono mb-2">
                      <span className="font-bold text-slate-700 dark:text-zinc-300">{t.buyExchange}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-slate-700 dark:text-zinc-300">{t.sellExchange}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/40 dark:border-white/5 text-xs font-mono">
                      <span className="text-slate-600 dark:text-zinc-300 font-bold font-mono">Profit:</span>
                      <span className="text-[#00FF88] font-extrabold text-xs sm:text-sm">+${parseFloat(t.profit).toFixed(2)}</span>
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
                    if (plan.plan.includes('B')) pair = 'ETH/USD';
                    if (plan.plan.includes('C')) pair = 'SOL/USD';
                    
                    const start = new Date(plan.startDate).getTime();
                    const end = new Date(plan.endDate).getTime();
                    const now = new Date().getTime();
                    
                    let durationStr = 'Completed';
                    if (active) {
                      const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
                      durationStr = `${daysLeft} ${t('daysLeft')}`;
                    }

                    return (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all text-left">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-green-500/10' : 'bg-slate-200 dark:bg-white/5'}`}>
                            <TrendingUp className={`w-4 h-4 ${active ? 'text-green-500 dark:text-green-400' : 'text-slate-500 dark:text-zinc-400'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono">{pair} ({plan.plan})</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Clock className="w-3.5 h-3.5 text-slate-555 dark:text-zinc-400" />
                              <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 font-mono">{durationStr}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 flex-shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-slate-600 dark:text-zinc-400 font-mono mb-0.5">{t('arbitrageDepositVol')}</p>
                            <p className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white">${plan.amount.toLocaleString()}</p>
                          </div>
                          <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-slate-600 dark:text-zinc-400 font-mono mb-0.5">{t('arbitrageDailySpread')}</p>
                            <p className={`text-xs sm:text-sm font-extrabold font-mono text-green-600 dark:text-green-400`}>+{(plan.dailyROI * 100).toFixed(1)}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-600 dark:text-zinc-400 font-mono mb-0.5">{t('arbitragePnL')}</p>
                            <p className={`text-sm sm:text-base font-extrabold font-mono text-green-600 dark:text-green-400`}>+${plan.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                          <span className={`text-xs font-extrabold font-mono px-2.5 py-1 rounded-full ${active ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-zinc-350'}`}>
                            {plan.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 font-bold font-mono py-8 text-center">{t('arbitrageEmpty')}</p>
                )}
              </div>
            </div>

            {/* Right: Stacked Invest Card and Terminal */}
            <div className="space-y-6">
              {/* Invest Capital Card */}
              <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none flex flex-col text-left">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-violet-650 dark:text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">{t('enterAmount') || 'Invest Capital'}</h2>
                    <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400 font-mono">Deploy funds to arbitrage contracts</p>
                  </div>
                </div>

                {/* Balance display */}
                <div className="p-4 bg-slate-50 dark:bg-white/2 border border-slate-200/50 dark:border-white/5 rounded-xl mb-5 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 block uppercase font-mono">AVAILABLE BALANCE</span>
                    <span className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white font-mono">
                      ${(data?.stats.availableBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold font-mono text-violet-650 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">USDT</span>
                </div>

                <form onSubmit={handleInvest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold font-mono text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">Investment Amount (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-600 dark:text-zinc-300 font-mono text-sm font-bold">$</span>
                      <input
                        type="number"
                        step="any"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/8 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all font-mono"
                        required
                        disabled={investing}
                      />
                    </div>
                    {/* Quick percents */}
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {[0.25, 0.50, 0.75, 1.0].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            const bal = data?.stats.availableBalance ?? 0;
                            setInvestAmount((bal * pct).toFixed(2));
                          }}
                          className="py-1.5 text-xs font-bold font-mono bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-all"
                        >
                          {pct === 1.0 ? 'MAX' : `${pct * 100}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reactive Plan Info */}
                  {matchingPlan ? (
                    <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-xl space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-650 dark:text-zinc-400 font-bold font-mono">Plan Detected:</span>
                        <span className="font-extrabold text-violet-600 dark:text-violet-400 font-mono">{matchingPlan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-655 dark:text-zinc-400 font-bold font-mono">Daily Yield ROI:</span>
                        <span className="font-extrabold text-green-500 dark:text-green-400 font-mono">+{(matchingPlan.dailyROI * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-656 dark:text-zinc-400 font-bold font-mono">Contract Period:</span>
                        <span className="font-extrabold text-slate-900 dark:text-white font-mono">{matchingPlan.duration} days</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-slate-200/50 dark:border-white/5">
                        <span className="text-slate-657 dark:text-zinc-400 font-bold font-mono">Projected Total Profit:</span>
                        <span className="font-extrabold text-[#00FF88] font-mono">+${((amountNum || 0) * matchingPlan.dailyROI * matchingPlan.duration).toFixed(2)}</span>
                      </div>
                    </div>
                  ) : investAmount && amountNum < 10 ? (
                    <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-center">
                      <span className="text-xs font-bold font-mono text-red-500">Minimum investment is $10.00 (Starter Plan)</span>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={investing || !matchingPlan}
                    className="w-full py-3 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-violet-600/15"
                  >
                    {investing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Activate Contract</span>
                    )}
                  </button>
                </form>
              </div>

              {/* Live Arbitrage Engine Log Console */}
              <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 shadow-sm dark:shadow-none flex flex-col h-[400px] text-[#00FF88]">
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
                    <span className="text-[8px] font-mono text-green-500">MONITOR</span>
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
                    if (log.includes('[ROUTER]')) colorClass = 'text-cyan-400';
                    
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
          </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
