"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { BackgroundPattern } from "@/components/background-pattern";
import { VextaLogo } from '@/components/vexta-logo';
import { SYSTEM_CONFIG } from '@/lib/config/system';
import { useTranslation } from '@/components/translation-provider';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) {
      setError(t('forgotPasswordInvalidEmail'));
      return;
    }
    setError('');
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F1419] text-slate-900 dark:text-white flex flex-col items-center justify-center relative p-4 transition-colors duration-250">
      <BackgroundPattern />
      <LanguageSwitcher />

      {/* Header/Logo */}
      <div className="absolute top-8 left-8 z-10 flex flex-col items-center gap-4 w-full md:w-auto md:left-1/2 md:-translate-x-1/2">
        <Link href="/" className="flex items-center gap-2">
          <VextaLogo className="h-8 w-8" variant="icon-only" />
          <span className="text-xl font-bold tracking-widest text-slate-950 dark:text-white font-sans uppercase">
            {SYSTEM_CONFIG.brand.name}
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-2xl p-10 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          
          {!isSubmitted ? (
            <>
              <h1 className="text-3xl font-light text-slate-900 dark:text-[#FFFFFF] mb-2 font-sans tracking-tight">
                {t('forgotPasswordTitle')}
              </h1>
              <p className="text-slate-500 dark:text-[#808A9D] text-sm mb-8 font-mono">
                {t('forgotPasswordSubtitle')}
              </p>

              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 dark:text-red-400 text-xs font-mono">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="group/input mb-8">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-[#FFFFFF] mb-2 font-mono uppercase tracking-widest text-[10px] dark:text-white/50">
                    {t('forgotPasswordEmailLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      className={`w-full bg-slate-50 dark:bg-white/5 border ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : 'border-slate-200 dark:border-white/5 focus:border-violet-500/50 dark:focus:border-[#00D9FF]/50 focus:ring-violet-500/50 dark:focus:ring-[#00D9FF]/50'} rounded-xl px-4 py-3.5 text-slate-900 dark:text-[#FFFFFF] placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:ring-1 focus:bg-white/10 transition-all duration-300 font-mono text-sm`}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-4 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-100 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                >
                  <span className="relative z-10 font-mono tracking-widest text-sm uppercase">{t('forgotPasswordSendBtn')}</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-[#00FF88]/10 border border-emerald-500/20 dark:border-[#00FF88]/30 mx-auto flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-emerald-600 dark:text-[#00FF88]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-light text-slate-900 dark:text-[#FFFFFF] mb-2 font-sans tracking-tight">
                {t('forgotPasswordSentTitle')}
              </h2>
              <p className="text-slate-500 dark:text-[#808A9D] text-xs leading-relaxed font-mono mt-4 mb-8">
                {t('forgotPasswordSentDesc')}
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-[#FFFFFF] hover:bg-slate-100 dark:hover:bg-white/5 font-mono text-sm tracking-widest rounded-xl transition-all uppercase"
              >
                {t('forgotPasswordTryAnother')}
              </button>
            </div>
          )}

          <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-white/5">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 text-slate-500 dark:text-[#808A9D] text-[10px] font-mono uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors group/link">
              <ArrowLeft className="w-3 h-3 group-hover/link:-translate-x-1 transition-transform" />
              {t('forgotPasswordBackToSignIn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
