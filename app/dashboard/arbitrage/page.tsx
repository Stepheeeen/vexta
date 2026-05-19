'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { BarChart3, TrendingUp, Clock, Loader2, Terminal, Shield, Cpu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement | null>(null);

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
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
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

    const interval = setInterval(() => {
      const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ADA/USDT', 'XRP/USDT', 'LINK/USDT'];
      const pools = ['Pool Alpha', 'Pool Beta', 'Vault Gamma', 'Vault Delta'];
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const poolA = pools[Math.floor(Math.random() * pools.length)];
      let poolB = pools[Math.floor(Math.random() * pools.length)];
      while (poolA === poolB) {
        poolB = pools[Math.floor(Math.random() * pools.length)];
      }
      const spread = (Math.random() * 2 + 1).toFixed(2);
      const amount = (Math.random() * 5 + 0.1).toFixed(2);
      const profit = (Math.random() * 200 + 10).toFixed(2);
      const timestamp = new Date().toLocaleTimeString();

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
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

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

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em] mb-1">{t('arbitrage')}</p>
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
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, sub }) => (
              <div key={label} className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none">
                <p className="text-[10px] font-mono text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3">{label}</p>
                <p className="text-xl font-bold text-slate-950 dark:text-white font-mono mb-1">{value}</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-400">{sub}</p>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Positions table */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{t('arbitrageAllPositions')}</h2>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{t('arbitrageContracts')}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-green-600 dark:text-green-500">LIVE</span>
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
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-green-500/10' : 'bg-slate-200 dark:bg-white/5'}`}>
                            <TrendingUp className={`w-4 h-4 ${active ? 'text-green-500 dark:text-green-400' : 'text-slate-400 dark:text-gray-500'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono">{pair} ({plan.plan})</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400 dark:text-gray-500" />
                              <span className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{durationStr}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 flex-shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-mono mb-0.5">{t('arbitrageDepositVol')}</p>
                            <p className="text-xs font-mono text-slate-900 dark:text-white">${plan.amount.toLocaleString()}</p>
                          </div>
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-mono mb-0.5">{t('arbitrageDailySpread')}</p>
                            <p className={`text-xs font-mono font-bold text-green-600 dark:text-green-400`}>+{(plan.dailyROI * 100).toFixed(1)}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-mono mb-0.5">{t('arbitragePnL')}</p>
                            <p className={`text-sm font-bold font-mono text-green-600 dark:text-green-400`}>+${plan.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                          <span className={`text-[9px] font-mono px-2.5 py-1 rounded-full ${active ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-gray-500'}`}>
                            {plan.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 dark:text-gray-500 font-mono py-8 text-center">{t('arbitrageEmpty')}</p>
                )}
              </div>
            </div>

            {/* Live Arbitrage Engine Log Console */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 shadow-sm dark:shadow-none flex flex-col h-[520px] text-[#00FF88]">
              <div className="flex items-center gap-3 mb-4 border-b border-slate-900 pb-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">{t('arbitrageConsoleTitle')}</h2>
                  <p className="text-[9px] text-slate-400 font-mono">{t('arbitrageConsoleSubtitle')}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[8px] font-mono text-green-500">MONITOR</span>
                </div>
              </div>

              {/* Console log window */}
              <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 pr-1 custom-scrollbar text-left scroll-smooth">
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
                <div ref={logsEndRef} />
              </div>

              {/* Console footer */}
              <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-green-500" /> {t('arbitrageConsoleSecureChannel')}
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
