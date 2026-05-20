'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Clock, BadgeCheck } from 'lucide-react';
import { BackgroundPattern } from '@/components/background-pattern';

import { useTranslation } from '@/components/translation-provider';

export function Hero() {
  const { t } = useTranslation();

  const stats = [
    { value: '$2.4M+', label: t('heroTotalInvested') },
    { value: '12,800+', label: t('heroActiveMembers') },
    { value: `13 ${t('referralLevel') || 'Levels'}`, label: t('heroReferralDepth') },
  ];

  const badges = [
    { icon: ShieldCheck, label: t('heroSslSecured') },
    { icon: Clock, label: t('heroSupport') },
    { icon: BadgeCheck, label: t('heroVerification') },
  ];
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-white">
      {/* Auth-style topological mesh background */}
      <BackgroundPattern />

      {/* Very faint gradient vignette top/bottom so mesh fades cleanly */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent pointer-events-none z-[1]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none z-[1]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: Copy ── */}
          <div className="text-center lg:text-left">

            {/* Mono label */}
            <p className="text-[11px] font-mono text-violet-600 uppercase tracking-[0.2em] mb-5 animate-fade-in-up">
              {t('heroSubtitle')}
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-slate-900 tracking-tight leading-[1.1] mb-5 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
              {t('heroTitle1')}<br className="hidden sm:block" />{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
                {t('heroTitleHighlight')}
              </span>{' '}
              {t('heroTitle2')}
            </h1>

            <p className="text-base text-slate-600 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              {t('heroDescription')}
            </p>

            {/* CTAs — no glow, clean */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-10 animate-fade-in-up" style={{ animationDelay: '220ms' }}>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all duration-200 shadow-md shadow-violet-600/15"
              >
                {t('heroStartInvesting')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#plans"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl transition-all duration-200"
              >
                {t('heroViewPlans')}
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              {badges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon className="w-3.5 h-3.5 text-violet-600" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Illustration card ── */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: '180ms' }}>
            {/* Main card — matches auth glassmorphism style */}
            <div className="relative rounded-2xl bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur-xl border border-slate-200/80 p-6 overflow-hidden">
              {/* Top bar — fintech terminal feel */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 ml-2">portfolio.overview — live</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-green-600">ACTIVE</span>
                </div>
              </div>

              {/* Illustration */}
              <div className="relative w-full aspect-[4/3] flex items-center justify-center">
                <Image
                  src="/illustrations/investing.svg"
                  alt="Investment portfolio growth illustration"
                  width={420}
                  height={315}
                  className="w-full h-auto object-contain"
                  style={{ height: 'auto' }}
                  priority
                />
              </div>

              {/* Mini stat strip inside card */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                {stats.map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-sm font-bold text-slate-800">{value}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating pill — top right */}
            <div className="absolute -top-4 -right-4 hidden lg:flex items-center gap-2.5 px-3.5 py-2.5 bg-white/95 shadow-lg shadow-slate-200/40 border border-slate-200 rounded-xl">
              <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3"><path d="M8 2v12M4 6l4-4 4 4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono">{t('heroDailyReturn')}</div>
                <div className="text-xs font-bold text-green-600">+$248.00</div>
              </div>
            </div>

            {/* Floating pill — bottom left */}
            <div className="absolute -bottom-4 -left-4 hidden lg:flex items-center gap-2.5 px-3.5 py-2.5 bg-white/95 shadow-lg shadow-slate-200/40 border border-slate-200 rounded-xl">
              <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3"><circle cx="8" cy="6" r="2.5" stroke="#7c3aed" strokeWidth="1.5"/><path d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono">{t('heroReferralEarned')}</div>
                <div className="text-xs font-bold text-violet-600">$1,320</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
