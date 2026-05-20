'use client';

import Link from 'next/link';
import { Navbar } from '@/components/landing/navbar';
import { BackgroundPattern } from '@/components/background-pattern';
import { useTranslation } from '@/components/translation-provider';
import {
  Download, Printer, Check, Database, Server,
  Users, Shield, Settings, Code, Zap, BookOpen,
  TrendingUp, Globe, FileText, ExternalLink, LayoutGrid,
  Wallet, ArrowDownRight, ArrowUpRight, BarChart3, ChevronUp,
  ShieldCheck, Clock, BadgeCheck, ArrowRight,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { handoverTranslations } from './handover-translations';

/* ─── section card ─── */
const card = 'bg-white dark:bg-white/3 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 mb-6 shadow-sm';

/* ─── code block ─── */
const codeBlock = 'bg-slate-900 text-emerald-400 rounded-xl p-4 font-mono text-xs leading-relaxed border border-white/5 overflow-x-auto';

/* ─── Inline code ─── */
function IC({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-300 font-mono text-[11px]">
      {children}
    </code>
  );
}

/* ─── Clickable page link ─── */
function PL({ href, children }: { href: string; children?: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-300 font-mono text-[11px] hover:bg-violet-500/20 transition-all group">
      {children ?? href}
      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

/* ─── Inline Markdown & Link Parser ─── */
function parseMarkdownInline(text: string): React.ReactNode {
  if (!text) return '';
  const regex = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*)/g;
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('[') && part.endsWith(')')) {
          const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (match) {
            const [_, label, href] = match;
            return <PL key={index} href={href}>{label}</PL>;
          }
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <IC key={index}>{part.slice(1, -1)}</IC>;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="text-slate-800 dark:text-white font-semibold">{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </>
  );
}

/* ─── Section heading ─── */
function SH({ icon: Icon, label, color = 'violet' }: { icon: any; label: string; color?: string }) {
  const map: Record<string, string> = {
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-500',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500',
  };
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${map[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{label}</h2>
    </div>
  );
}

/* ─── Data table ─── */
function DT({ headers, rows }: { headers: string[]; rows: (React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/5 mb-4">
      <table className="w-full text-xs font-sans">
        <thead>
          <tr className="bg-slate-50 dark:bg-white/3 border-b border-slate-200 dark:border-white/5">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-slate-100 dark:border-white/3 hover:bg-slate-50/50 dark:hover:bg-white/1 transition-colors last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-slate-700 dark:text-gray-300 align-top leading-relaxed">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Milestone card ─── */
function MC({ num, title, label, items }: { num: string; title: string; label: string; items: string[] }) {
  const { t } = useTranslation();
  return (
    <div className="border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden mb-4 shadow-sm">
      <div className="bg-gradient-to-r from-slate-900 via-[#1e1b4b] to-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{num}</div>
          <div>
            <p className="text-white font-semibold text-sm">{title}</p>
            <p className="text-slate-400 text-[10px] font-mono mt-0.5">{label}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/25 rounded-full px-3 py-1">
          <Check className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400 text-[10px] font-semibold">{t('handoverComplete') || 'Completed'}</span>
        </div>
      </div>
      <div className="bg-white dark:bg-white/2 px-6 py-4">
        <ul className="space-y-0">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3 items-start text-xs text-slate-600 dark:text-gray-400 leading-relaxed py-2.5 border-b border-slate-50 dark:border-white/3 last:border-0">
              <div className="w-4 h-4 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 text-violet-500" />
              </div>
              <span className="flex-1">{parseMarkdownInline(item)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─── Callout ─── */
function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-violet-500/5 border border-violet-500/15 mb-4">
      <div className="w-4 h-4 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
      </div>
      <div className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">{children}</div>
    </div>
  );
}

/* ─── Step list ─── */
function SL({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2 mb-4">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3 items-start text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-[9px]">{i + 1}</div>
          <span className="flex-1">{parseMarkdownInline(step)}</span>
        </li>
      ))}
    </ol>
  );
}

/* ─── Page link card (clickable tile) ─── */
function PageCard({ href, icon: Icon, title, desc, badge }: { href: string; icon: any; title: string; desc: string; badge?: string }) {
  return (
    <Link href={href} className="group block p-4 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 hover:border-violet-500/40 hover:bg-violet-500/3 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Icon className="w-3.5 h-3.5 text-violet-500" />
          </div>
          <IC>{href}</IC>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-slate-300 dark:text-white/20 group-hover:text-violet-400 transition-colors flex-shrink-0" />
      </div>
      <p className="text-xs font-semibold text-slate-800 dark:text-white mb-1 mt-2">{title}</p>
      <p className="text-[11px] text-slate-500 dark:text-gray-500 leading-relaxed">{desc}</p>
      {badge && <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{badge}</span>}
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════
   SECTIONS config — id matches the anchor in the TOC
   (Note: Section labels match properties in the translation pack)
══════════════════════════════════════════════════════════ */
const SECTIONS = [
  { id: 'exec-summary', label: 'handoverExecSummary', icon: BookOpen },
  { id: 'tech-arch', label: 'handoverTechArch', icon: Server },
  { id: 'milestones', label: 'handoverMilestones', icon: Check },
  { id: 'database', label: 'handoverDatabase', icon: Database },
  { id: 'user-guide', label: 'handoverUserGuide', icon: Users },
  { id: 'mlm-engine', label: 'handoverMlm', icon: TrendingUp },
  { id: 'roi-engine', label: 'handoverRoi', icon: Zap },
  { id: 'admin-panel', label: 'handoverAdmin', icon: Settings },
  { id: 'security', label: 'handoverSecurity', icon: Shield },
  { id: 'demo-mode', label: 'handoverDemo', icon: Globe },
  { id: 'api-reference', label: 'handoverApi', icon: Code },
  { id: 'dev-tooling', label: 'handoverDev', icon: FileText },
] as const;

/* ─── User Guide Page Icons ─── */
const userGuideIcons = [
  LayoutGrid,      // Overview
  ArrowDownRight,  // Deposit
  BarChart3,       // Arbitrage Plans
  TrendingUp,      // Portfolio
  ArrowUpRight,    // Withdraw
  Users,           // Referrals
  Wallet,          // Earnings History
  Settings,        // Settings
];

/* ─── Admin Page Icons ─── */
const adminGuideIcons = [
  LayoutGrid,      // Admin Dashboard
  ArrowDownRight,  // Deposit Approvals
  ArrowUpRight,    // Withdrawal Approvals
  Users,           // User Management
  BarChart3,       // Analytics
  Wallet,          // Transactions
  Settings,        // Platform Settings
];

/* ─── smooth scroll helper ─── */
function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function HandoverPage() {
  const { language, t } = useTranslation();
  const [activeSection, setActiveSection] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Active translation pack
  const h = handoverTranslations[language] || handoverTranslations['en'];

  /* Scroll spy */
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 500);
      for (const s of [...SECTIONS].reverse()) {
        const el = document.getElementById(s.id);
        if (el && window.scrollY >= el.offsetTop - 140) {
          setActiveSection(s.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F14]">
      {/* Shared landing navbar */}
      <Navbar />

      {/* Print styles */}
      <style>{`
        @media print { .no-print { display: none !important; } }
      `}</style>

      {/* ─── Hero — matches landing page aesthetic ─── */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-16 bg-white dark:bg-[#090C10]">
        {/* Same topological mesh as the landing page */}
        <BackgroundPattern />

        {/* Fade-out top & bottom — identical to landing hero */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white dark:from-[#090C10] to-transparent pointer-events-none z-[1]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white dark:from-[#090C10] to-transparent pointer-events-none z-[1]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* ── Left: Copy ── */}
            <div className="text-center lg:text-left">

              {/* Mono eyebrow */}
              <p className="text-[11px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-[0.25em] mb-4 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
                {h.eyebrow}
              </p>

              {/* Headline */}
              <h1
                className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-slate-900 dark:text-white tracking-tight leading-[1.08] mb-5 animate-fade-in-up"
                style={{ animationDelay: '100ms' }}
              >
                {t('handoverTitle')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
                  {h.andClient}
                </span>{' '}
                {h.clientHandover}
              </h1>

              {/* Sub-copy */}
              <p
                className="text-base text-slate-600 dark:text-gray-400 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed animate-fade-in-up"
                style={{ animationDelay: '160ms' }}
              >
                {h.subcopy}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-10 animate-fade-in-up" style={{ animationDelay: '220ms' }}>
                <button
                  onClick={() => window.print()}
                  className="group inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all duration-200 shadow-md shadow-violet-600/15 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  {h.savePdf}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  {h.print}
                </button>
              </div>

              {/* Trust strip */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                {[
                  { icon: ShieldCheck, label: h.securityPill },
                  { icon: BadgeCheck, label: h.buildVerified },
                  { icon: Clock, label: h.deliveredSchedule },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400">
                    <Icon className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Meta card ── */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: '180ms' }}>
              {/* Main glass card */}
              <div className="relative rounded-2xl bg-white/90 dark:bg-[#0F141C]/90 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-xl border border-slate-200/80 dark:border-white/5 p-6 overflow-hidden">
                {/* Terminal top bar */}
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-white/10" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-gray-500 ml-2">vexta.platform — handover.doc</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">VERIFIED</span>
                  </div>
                </div>

                {/* Milestone progress */}
                <p className="text-[10px] font-mono text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3">{h.milestoneTitle}</p>
                <div className="space-y-2.5 mb-5">
                  {h.milestones.map((m) => (
                    <div key={m.num}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-violet-600 dark:text-violet-400 w-6">{m.num}</span>
                          <span className="text-[11px] font-medium text-slate-700 dark:text-gray-300">{m.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono text-slate-400 dark:text-gray-500">{m.days}</span>
                          <Check className="w-3 h-3 text-emerald-500" />
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                          style={{ width: `100%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                  {h.stats.map(({ value, label }) => (
                    <div key={label} className="text-center">
                      <div className="text-sm font-bold text-slate-800 dark:text-white">{value}</div>
                      <div className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating pill — top right */}
              <div className="absolute -top-4 -right-4 hidden lg:flex items-center gap-2.5 px-3.5 py-2.5 bg-white/95 dark:bg-[#0F141C]/95 shadow-lg shadow-slate-200/40 dark:shadow-none border border-slate-200 dark:border-white/5 rounded-xl">
                <div className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">{h.floatingSecurity}</div>
                  <div className="text-xs font-bold text-violet-600 dark:text-violet-400">bcrypt · JWT</div>
                </div>
              </div>

              {/* Floating pill — bottom left */}
              <div className="absolute -bottom-4 -left-4 hidden lg:flex items-center gap-2.5 px-3.5 py-2.5 bg-white/95 dark:bg-[#0F141C]/95 shadow-lg shadow-slate-200/40 dark:shadow-none border border-slate-200 dark:border-white/5 rounded-xl">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">{h.floatingBuild}</div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{h.floatingPassing}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ─── Two-column layout: sticky TOC + content ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex gap-8 items-start">

        {/* ── Sticky sidebar TOC (desktop) ── */}
        <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-24 no-print">
          <div className="bg-white dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400 mb-3">{t('handoverToc')}</p>
            <nav className="space-y-0.5 font-sans">
              {SECTIONS.map(({ id, label, icon: Icon }, i) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[11px] font-medium transition-all cursor-pointer ${activeSection === id
                      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-450'
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/3'
                    }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[8px] font-bold ${activeSection === id ? 'bg-violet-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                    }`}>{i + 1}</span>
                  <span className="truncate">{t(label)}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0">

          {/* Mobile TOC (accordion style) */}
          <div className="lg:hidden mb-6">
            <div className={card}>
              <SH icon={BookOpen} label={t('handoverToc')} />
              <div className="grid grid-cols-2 gap-2 font-sans">
                {SECTIONS.map(({ id, label, icon: Icon }, i) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 hover:border-violet-500/30 hover:bg-violet-500/3 transition-all text-left cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-[9px]">{i + 1}</span>
                    </div>
                    <span className="text-[11px] text-slate-700 dark:text-gray-300 font-medium leading-tight truncate">{t(label)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════
              1. Executive Summary
          ══════════════════════════════════ */}
          <section id="exec-summary" className={card}>
            <SH icon={BookOpen} label={`1. ${t('handoverExecSummary')}`} color="violet" />
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed mb-4">
              {h.execSummaryText}
            </p>
            <div className="grid md:grid-cols-2 gap-3 font-sans">
              {h.execSummaryCards.map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white mb-1">{item.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════
              2. Technology Architecture
          ══════════════════════════════════ */}
          <section id="tech-arch" className={card}>
            <SH icon={Server} label={`2. ${t('handoverTechArch')}`} color="blue" />
            <DT
              headers={h.techArchHeaders}
              rows={h.techArchRows.map(row => row.map(cell => parseMarkdownInline(cell)))}
            />
            <Callout>
              {parseMarkdownInline(h.techArchCallout)}
            </Callout>
          </section>

          {/* ══════════════════════════════════
              3. Milestones
          ══════════════════════════════════ */}
          <section id="milestones" className={card}>
            <SH icon={Check} label={`3. ${t('handoverMilestones')}`} color="emerald" />
            {h.milestoneDetailHeaders.map((mHeader, i) => (
              <MC
                key={i}
                num={mHeader.num}
                label={mHeader.label}
                title={mHeader.title}
                items={h.milestoneDetails[i]}
              />
            ))}
          </section>

          {/* ══════════════════════════════════
              4. Database Models
          ══════════════════════════════════ */}
          <section id="database" className={card}>
            <SH icon={Database} label={`4. ${t('handoverDatabase')}`} color="amber" />
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">{h.dbModelsSub}</p>
            
            <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">{h.dbUserLabel}</p>
            <DT
              headers={h.dbUserHeaders}
              rows={h.dbUserRows.map(row => row.map(cell => parseMarkdownInline(cell)))}
            />

            <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2 mt-4">{h.dbSettingsLabel}</p>
            <DT
              headers={h.dbSettingsHeaders}
              rows={h.dbSettingsRows.map(row => row.map(cell => parseMarkdownInline(cell)))}
            />

            <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2 mt-4">{h.dbTxLabel}</p>
            <DT
              headers={h.dbTxHeaders}
              rows={h.dbTxRows.map(row => row.map(cell => parseMarkdownInline(cell)))}
            />
          </section>

          {/* ══════════════════════════════════
              5. User Panel Guide
          ══════════════════════════════════ */}
          <section id="user-guide" className={card}>
            <SH icon={Users} label={`5. ${t('handoverUserGuide')}`} color="cyan" />
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-4 leading-relaxed">
              {h.userGuideSub}
            </p>
            <div className="grid md:grid-cols-2 gap-3 mb-4 font-sans">
              {h.userGuidePages.map((page, i) => (
                <PageCard
                  key={i}
                  href={page.href}
                  icon={userGuideIcons[i]}
                  title={page.title}
                  badge={page.badge}
                  desc={page.desc}
                />
              ))}
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5">
              <p className="text-xs font-semibold text-slate-800 dark:text-white mb-2">{h.withdrawalBreakdownTitle}</p>
              <pre className={codeBlock}>{`Gross Amount:   $1,000.00
Fee (6%):       -$60.00
Net Payout:      $940.00

${h.withdrawalBreakdownNote}`}</pre>
            </div>
          </section>

          {/* ══════════════════════════════════
              6. MLM Commission Engine
          ══════════════════════════════════ */}
          <section id="mlm-engine" className={card}>
            <SH icon={TrendingUp} label={`6. ${t('handoverMlm')}`} color="violet" />
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-4 leading-relaxed">
              {parseMarkdownInline(h.mlmSub)}
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">{h.mlmRateTableTitle}</p>
                <DT
                  headers={h.mlmRateTableHeaders}
                  rows={h.mlmRateTableRows.map(row => row.map(cell => parseMarkdownInline(cell)))}
                />
              </div>
              <div>
                <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">{h.mlmExampleTitle}</p>
                <DT
                  headers={h.mlmExampleHeaders}
                  rows={h.mlmExampleRows.map(row => row.map(cell => parseMarkdownInline(cell)))}
                />
                <Callout>{parseMarkdownInline(h.mlmExampleCallout)}</Callout>
              </div>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-gray-400">
              {h.mlmBullets.map((item, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />
                  <span className="flex-1">{parseMarkdownInline(item)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ══════════════════════════════════
              7. Daily ROI Engine
          ══════════════════════════════════ */}
          <section id="roi-engine" className={card}>
            <SH icon={Zap} label={`7. ${t('handoverRoi')}`} color="amber" />
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">{h.roiRulesTitle}</p>
                <DT
                  headers={h.roiRulesHeaders}
                  rows={h.roiRulesRows.map(row => row.map(cell => parseMarkdownInline(cell)))}
                />
              </div>
              <div>
                <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">{h.roiFormulaTitle}</p>
                <pre className={codeBlock}>{h.roiFormulaDetail}</pre>
              </div>
            </div>
            <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">{h.roiTriggerTitle}</p>
            <pre className={codeBlock}>{h.roiTriggerDetail}</pre>
          </section>

          {/* ══════════════════════════════════
              8. Admin Panel
          ══════════════════════════════════ */}
          <section id="admin-panel" className={card}>
            <SH icon={Settings} label={`8. ${t('handoverAdmin')}`} color="rose" />
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-4 leading-relaxed">
              {h.adminSub}
            </p>
            <div className="grid md:grid-cols-2 gap-3 mb-4 font-sans">
              {h.adminPages.map((page, i) => (
                <PageCard
                  key={i}
                  href={page.href}
                  icon={adminGuideIcons[i]}
                  title={page.title}
                  badge={page.badge}
                  desc={page.desc}
                />
              ))}
            </div>
            <DT
              headers={h.dbSettingsHeaders}
              rows={h.adminSettingsRows.map(row => row.map(cell => parseMarkdownInline(cell)))}
            />
          </section>

          {/* ══════════════════════════════════
              9. Security
          ══════════════════════════════════ */}
          <section id="security" className={card}>
            <SH icon={Shield} label={`9. ${t('handoverSecurity')}`} color="blue" />
            <DT
              headers={h.securityHeaders}
              rows={h.securityRows.map(row => row.map(cell => parseMarkdownInline(cell)))}
            />
          </section>

          {/* ══════════════════════════════════
              10. Demo Mode
          ══════════════════════════════════ */}
          <section id="demo-mode" className={card}>
            <SH icon={Globe} label={`10. ${t('handoverDemo')}`} color="emerald" />
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">{h.demoSeederTitle}</p>
                <pre className={codeBlock}>{h.demoSeederChart}</pre>
              </div>
              <div>
                <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">{h.demoStepsTitle}</p>
                <SL steps={h.demoSteps} />
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════
              11. API Reference
          ══════════════════════════════════ */}
          <section id="api-reference" className={card}>
            <SH icon={Code} label={`11. ${t('handoverApi')}`} color="cyan" />
            
            <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">{h.apiAuthTitle}</p>
            <DT
              headers={h.apiHeaders}
              rows={h.apiAuthRows.map(row => row.map(cell => parseMarkdownInline(cell)))}
            />
            
            <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2 mt-4">{h.apiUserTitle}</p>
            <DT
              headers={h.apiHeaders}
              rows={h.apiUserRows.map(row => row.map(cell => parseMarkdownInline(cell)))}
            />
            
            <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2 mt-4">{h.apiAdminTitle}</p>
            <DT
              headers={h.apiHeaders}
              rows={h.apiAdminRows.map(row => row.map(cell => parseMarkdownInline(cell)))}
            />
          </section>

          {/* ══════════════════════════════════
              12. Developer Tooling
          ══════════════════════════════════ */}
          <section id="dev-tooling" className={card}>
            <SH icon={FileText} label={`12. ${t('handoverDev')}`} color="violet" />
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">{h.devCommandsTitle}</p>
                <pre className={codeBlock}>{h.devCommandsDetail}</pre>
              </div>
              <div>
                <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">{h.devEnvTitle}</p>
                <pre className={codeBlock}>{h.devEnvDetail}</pre>
              </div>
            </div>
            <DT
              headers={h.devFileHeaders}
              rows={h.devFileRows.map(row => row.map(cell => parseMarkdownInline(cell)))}
            />
          </section>

          {/* ── Footer ── */}
          <div className="mt-2 p-6 bg-white dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-2xl text-center font-sans">
            <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-[0.3em] mb-2">VEXTA</p>
            <p className="text-xs text-slate-500 dark:text-gray-500">{h.confidential} · May 2026</p>
            <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">{h.allMilestones}</p>
          </div>

        </main>
      </div>

      {/* ─── Back to top button ─── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`no-print fixed bottom-6 right-6 w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/30 flex items-center justify-center transition-all duration-300 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} cursor-pointer`}
        aria-label="Back to top"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
    </div>
  );
}
