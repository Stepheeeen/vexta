'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap, Cpu, BarChart3, Brain } from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';

// ── Live ticker data ───────────────────────────────────────────────────────────
const PAIRS  = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'AVAX/USDT'];
const EXCH_A = ['Binance', 'OKX', 'Bybit', 'KuCoin', 'Kraken'];
const EXCH_B = ['Bybit', 'Gate.io', 'Binance', 'Bitget', 'OKX'];

function rnd(a: number, b: number) { return +(Math.random() * (b - a) + a).toFixed(3); }

function randomTrade() {
  const i = Math.floor(Math.random() * PAIRS.length);
  const j = Math.floor(Math.random() * EXCH_A.length);
  return {
    id:     Math.random().toString(36).slice(2),
    pair:   PAIRS[i],
    buy:    EXCH_A[j],
    sell:   EXCH_B[j],
    spread: rnd(0.01, 0.39),
    profit: rnd(0.8, 48.9),
  };
}

// ── Tech Pillars ──────────────────────────────────────────────────────────────
const PILLARS = [
  { icon: Brain,    labelKey: 'hftPillar1', defaultLabel: 'Financial AI',                       color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: Zap,      labelKey: 'hftPillar2', defaultLabel: 'High-Frequency Arbitrage (HFT)',     color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20'   },
  { icon: Cpu,      labelKey: 'hftPillar3', defaultLabel: 'Technology Infrastructure',           color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'       },
  { icon: BarChart3,labelKey: 'hftPillar4', defaultLabel: 'AI-Powered Operational Dashboard',   color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'     },
];

// ── HFT Hero ──────────────────────────────────────────────────────────────────
export function HftHero() {
  const { t } = useTranslation();

  // ── All random / time-varying state is client-only to prevent hydration mismatch
  const [mounted,    setMounted]    = useState(false);
  const [trades,     setTrades]     = useState<ReturnType<typeof randomTrade>[]>([]);
  const [spread,     setSpread]     = useState('0.142%');
  const [executions, setExecutions] = useState(0);
  const [execMs,     setExecMs]     = useState(12);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Seed initial trades on client only
    setMounted(true);
    setTrades(Array.from({ length: 5 }, randomTrade));

    timer.current = setInterval(() => {
      const tr = randomTrade();
      setTrades(prev => [tr, ...prev.slice(0, 6)]);
      setSpread(`${rnd(0.008, 0.49).toFixed(3)}%`);
      setExecutions(prev => prev + 1);
      setExecMs(Math.floor(Math.random() * 45 + 6));
    }, 1200);

    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#020611] text-white">
      {/* Ambient radial background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at top left,rgba(0,255,170,0.10),transparent 28%),radial-gradient(circle at bottom right,rgba(123,44,255,0.14),transparent 28%)',
      }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)',
        backgroundSize: '70px 70px',
      }} />

      {/* Drifting glow orb — uses CSS class, no inline <style> */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none hft-glow-orb"
        style={{
          background: 'radial-gradient(circle,rgba(0,255,170,0.10),transparent 70%)',
          filter: 'blur(80px)',
          top: '-220px',
          right: '-160px',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-20">

        {/* LIVE badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/8 text-[11px] font-mono font-bold tracking-[0.18em] text-emerald-400 uppercase">
            <div className="relative w-2 h-2 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-70" />
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            {t('hftBadge') || '⚡ AI-Powered Financial Infrastructure'}
          </div>
        </div>

        {/* 4 Tech Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 max-w-4xl mx-auto">
          {PILLARS.map(({ icon: Icon, labelKey, defaultLabel, color, bg }) => (
            <div key={labelKey} className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border ${bg} backdrop-blur-sm`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
              <span className={`text-[11px] font-semibold leading-tight ${color}`}>
                {t(labelKey) || defaultLabel}
              </span>
            </div>
          ))}
        </div>

        {/* Main headline + dashboard */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">

          {/* Left: Copy */}
          <div>
            <h1 className="text-5xl sm:text-6xl lg:text-[5.2rem] font-black leading-[0.95] mb-7 tracking-tight">
              {t('hftTitle1') || 'Intelligent'}<br />
              <span style={{ background: 'linear-gradient(90deg,#00F5D4,#4FA8FF,#7B2CFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {t('hftTitleGradient') || 'Arbitrage'}
              </span><br />
              {t('hftTitle2') || 'at High Frequency'}
            </h1>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8 max-w-xl">
              {t('hftDescription') || 'VEXTA is a financial infrastructure specialised in AI-driven high-frequency arbitrage (HFT). Our technology scans multiple global exchanges in real time, detecting price differentials in milliseconds and executing automated trades 24/7.'}
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-black transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(90deg,#00F5D4,#00FF99)', boxShadow: '0 0 40px rgba(0,255,170,0.28)' }}
              >
                {t('hftCTAPrimary') || 'Enter the Ecosystem'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#plans"
                onClick={e => { e.preventDefault(); document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl border border-white/10 bg-white/4 text-sm font-bold text-white transition-all hover:bg-white/8"
              >
                {t('hftCTASecondary') || 'View Technology'}
              </a>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-3">
              {[
                { label: t('hftStatExchanges') || 'Exchanges', value: '6+' },
                { label: t('hftStatLatency')   || 'Latency',   value: '0.002s' },
                { label: t('hftStatOps')        || 'Operations', value: '184K+' },
              ].map(({ label, value }) => (
                <div key={label} className="px-5 py-4 rounded-2xl border border-white/6 bg-white/3 min-w-[130px]">
                  <span className="block text-xs text-slate-500 font-mono mb-2">{label}</span>
                  <strong className="text-2xl font-black">{value}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Dashboard Visual */}
          <div
            className="rounded-[2rem] p-7 border border-white/8 backdrop-blur-xl relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.035)', boxShadow: '0 0 80px rgba(0,255,170,0.07)' }}
          >
            {/* Inner corner glow */}
            <div className="absolute w-[420px] h-[420px] -top-32 -right-24 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle,rgba(0,255,170,0.10),transparent 70%)' }} />

            {/* Live status */}
            <div className="flex items-center gap-2 mb-5 font-bold text-emerald-400 text-sm">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 18px #00FF99' }} />
              BOT STATUS: ONLINE
            </div>

            {/* Static trade cards */}
            {[
              { route: 'BINANCE → BYBIT', label: t('hftBtcArb'), profit: '+1.42%' },
              { route: 'OKX → BITGET',   label: t('hftEthArb'), profit: '+0.82%' },
            ].map(({ route, label, profit }) => (
              <div key={route} className="p-5 rounded-2xl border border-white/6 bg-white/3 mb-4 overflow-hidden">
                <small className="block text-slate-500 font-mono text-xs mb-2">{route}</small>
                <h3 className="text-lg font-bold mb-2">{label}</h3>
                <div className="text-3xl font-black text-emerald-400">{profit}</div>
              </div>
            ))}

            {/* 4-cell status grid */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { label: t('hftAiEngine'),      value: t('hftActive') },
                { label: t('hftSystem'),         value: '24/7' },
                { label: t('hftExecution'),      value: t('hftRealtime') },
                { label: t('hftInfrastructure'), value: t('hftInfrastructure') || 'HFT' },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 rounded-2xl border border-white/6 bg-white/3">
                  <span className="block text-xs text-slate-500 font-mono mb-2">{label}</span>
                  <strong className="text-xl">{value}</strong>
                </div>
              ))}
            </div>

            {/* Live trade ticker — client-only render to avoid hydration mismatch */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2">
                {mounted
                  ? (t('hftLiveFeedStats') || '').replace('{exec}', executions.toString()).replace('{ms}', execMs.toString())
                  : t('hftLiveFeedLoad')}
              </div>

              <div className="space-y-1 overflow-hidden" style={{ maxHeight: '120px' }}>
                {/* Render static placeholders on server; real data after mount */}
                {(mounted ? trades : [
                  { id: 's1', pair: 'BTC/USDT', buy: 'Binance', sell: 'Bybit',   spread: 0.142, profit: 12.4 },
                  { id: 's2', pair: 'ETH/USDT', buy: 'OKX',     sell: 'Bitget',  spread: 0.218, profit: 8.7  },
                  { id: 's3', pair: 'SOL/USDT', buy: 'KuCoin',  sell: 'Gate.io', spread: 0.097, profit: 4.9  },
                ]).map((tr, i) => (
                  <div
                    key={tr.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-mono"
                    style={{
                      background: i === 0 ? 'rgba(0,255,170,0.07)' : 'rgba(255,255,255,0.015)',
                      border: `1px solid ${i === 0 ? 'rgba(0,255,170,0.2)' : 'rgba(255,255,255,0.04)'}`,
                      opacity: 1 - i * 0.12,
                    }}
                  >
                    <span className="text-emerald-400 font-bold w-16 flex-shrink-0">{tr.pair}</span>
                    <span className="text-slate-500 flex-1">{tr.buy}→{tr.sell}</span>
                    <span className="text-amber-400">Δ{tr.spread}%</span>
                    <span className="text-emerald-400 font-bold">+${tr.profit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll fade into light sections */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020611] to-transparent pointer-events-none" />
    </section>
  );
}
