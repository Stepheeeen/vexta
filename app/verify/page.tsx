"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { BackgroundPattern } from "@/components/background-pattern";
import { useTranslation } from '@/components/translation-provider';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function VerifyPage() {
  const { t } = useTranslation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (index + i < 6) newCode[index + i] = char;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = code.join('');
    if (pin.length !== 6) return;

    setLoading(true);
    setError(null);
    setResendSuccess(false);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setIsVerified(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while resending.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F1419] text-slate-900 dark:text-white flex flex-col items-center justify-center relative p-4 transition-colors duration-250">
      <BackgroundPattern />
      <LanguageSwitcher />

      {/* Header/Logo */}
      <div className="absolute top-8 left-8 z-10 flex flex-col items-center gap-4 w-full md:w-auto md:left-1/2 md:-translate-x-1/2">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-violet-600 dark:text-[#00D9FF]">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-widest text-slate-900 dark:text-white font-sans">VEXTA</span>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-2xl p-10 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          
          {!isVerified ? (
            <>
              <h1 className="text-3xl font-light text-slate-900 dark:text-[#FFFFFF] mb-2 font-sans tracking-tight">
                {t('verifyTitle')}
              </h1>
              <p className="text-slate-500 dark:text-[#808A9D] text-sm mb-6 font-mono">
                {t('verifySubtitle')}
              </p>

              {error && (
                <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-xl text-xs font-mono">
                  {error}
                </div>
              )}

              {resendSuccess && (
                <div className="mb-6 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-mono">
                  {t('verifySuccessMsg')}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="flex justify-between gap-2 mb-8">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xl text-slate-900 dark:text-[#FFFFFF] focus:outline-none focus:border-violet-500/50 dark:focus:border-[#00D9FF]/50 focus:ring-1 focus:ring-violet-500/50 dark:focus:ring-[#00D9FF]/50 focus:bg-white/10 transition-all duration-300 font-mono"
                      required
                      disabled={loading}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-4 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-100 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white dark:text-black" />
                  ) : (
                    <>
                      <span className="relative z-10 font-mono tracking-widest text-sm uppercase">{t('verifySubmitBtn')}</span>
                      <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-white/5">
                <p className="text-slate-500 dark:text-[#808A9D] text-[10px] font-mono uppercase tracking-widest">
                  {t('verifyNoCode')}{' '}
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-slate-950 dark:text-white hover:text-violet-600 dark:hover:text-[#00D9FF] font-semibold tracking-wider underline decoration-slate-300 dark:decoration-white/30 underline-offset-4 ml-1 transition-colors disabled:opacity-50"
                  >
                    {resending ? t('verifySending') : t('verifyResendBtn')}
                  </button>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 rounded-full bg-violet-500/10 dark:bg-[#00D9FF]/10 border border-violet-500/20 dark:border-[#00D9FF]/30 mx-auto flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-violet-600 dark:text-[#00D9FF]" />
              </div>
              <h2 className="text-2xl font-light text-slate-900 dark:text-[#FFFFFF] mb-2 font-sans tracking-tight">
                {t('verifySuccessTitle')}
              </h2>
              <p className="text-slate-500 dark:text-[#808A9D] text-xs leading-relaxed font-mono mt-4 mb-8 uppercase tracking-wider">
                {t('verifySuccessDesc')}
              </p>
              <Link href="/dashboard" className="w-full flex items-center justify-center px-4 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-100 font-semibold rounded-xl transition-all duration-300 group/btn">
                <span className="relative z-10 font-mono tracking-widest text-sm uppercase">{t('verifyGoToDashboard')}</span>
                <ArrowRight className="w-4 h-4 ml-2 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
