'use client';

import React from 'react';
import { ShieldCheck, Server, Sparkles, Lock } from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';

interface MigrationBannerProps {
  compact?: boolean;
  className?: string;
  title?: string;
  message?: string;
  reassurance?: string;
}

export function MigrationBanner({
  compact = false,
  className = '',
  title,
  message,
  reassurance,
}: MigrationBannerProps) {
  const { t } = useTranslation();

  const displayTitle = title || t('migrationNoticeTitle');
  const displayMessage = message || t('migrationNoticeMessage');
  const displayReassurance = reassurance || t('migrationNoticeReassurance');
  const betaBadge = t('migrationNoticeBetaEnded');
  const fundsBadge = t('migrationNoticeFundsSecure');

  if (compact) {
    return (
      <div className={`w-full bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-emerald-500/10 border border-amber-500/20 dark:border-amber-400/30 rounded-xl p-4 backdrop-blur-md ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <Server className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {displayTitle}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-[#00FF88] border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> {fundsBadge}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-sans">
              {displayMessage}
            </p>
            <p className="text-[11px] font-mono text-emerald-600 dark:text-[#00FF88] mt-1.5 flex items-center gap-1">
              <Lock className="w-3 h-3" /> {displayReassurance}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full bg-slate-900/90 dark:bg-[#0D121B]/90 backdrop-blur-2xl border border-violet-500/20 dark:border-[#00D9FF]/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group ${className}`}>
      {/* Background glow effects */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl group-hover:bg-violet-600/25 transition-all duration-700 pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header Badges */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-mono tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#00D9FF] animate-pulse" />
            <span>{betaBadge}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00FF88] text-xs font-mono tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00FF88]" />
            <span>{fundsBadge}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight font-sans flex items-center gap-3">
            <Server className="w-6 h-6 text-[#00D9FF] shrink-0" />
            <span>{displayTitle}</span>
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed font-sans">
            {displayMessage}
          </p>
        </div>

        {/* Security Box */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
          <Lock className="w-5 h-5 text-[#00FF88] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-mono font-semibold text-[#00FF88]">
              {displayReassurance}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
