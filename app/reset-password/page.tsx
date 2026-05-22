"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';
import { BackgroundPattern } from "@/components/background-pattern";
import { VextaLogo } from '@/components/vexta-logo';
import { SYSTEM_CONFIG } from '@/lib/config/system';
import { useTranslation } from '@/components/translation-provider';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      setError(t('resetPasswordLengthError'));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('resetPasswordMismatchError'));
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
          <VextaLogo className="h-8 w-8" />
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
                {t('resetPasswordTitle')}
              </h1>
              <p className="text-slate-500 dark:text-[#808A9D] text-sm mb-8 font-mono">
                {t('resetPasswordSubtitle')}
              </p>

              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 dark:text-red-400 text-xs font-mono">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group/input">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-[#FFFFFF] mb-2 font-mono uppercase tracking-widest text-[10px] dark:text-white/50">
                    {t('resetPasswordNewLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 dark:bg-white/5 border ${error && error.includes('8 characters') ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-200 dark:border-white/5 focus:border-violet-500/50 dark:focus:border-[#00FF88]/50 focus:ring-violet-500/50 dark:focus:ring-[#00FF88]/50'} rounded-xl pl-4 pr-12 py-3.5 text-slate-900 dark:text-[#FFFFFF] placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:ring-1 focus:bg-white/10 transition-all duration-300 font-mono text-sm`}
                      placeholder="••••••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-[#808A9D] mt-2 font-mono uppercase tracking-wider">
                    {t('resetPasswordHint')}
                  </p>
                </div>

                <div className="group/input">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-[#FFFFFF] mb-2 font-mono uppercase tracking-widest text-[10px] dark:text-white/50">
                    {t('resetPasswordConfirmLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 dark:bg-white/5 border ${error && error.includes('match') ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-200 dark:border-white/5 focus:border-violet-500/50 dark:focus:border-[#00FF88]/50 focus:ring-violet-500/50 dark:focus:ring-[#00FF88]/50'} rounded-xl pl-4 pr-12 py-3.5 text-slate-900 dark:text-[#FFFFFF] placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:ring-1 focus:bg-white/10 transition-all duration-300 font-mono text-sm`}
                      placeholder="••••••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 focus:outline-none transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 px-4 py-4 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-100 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                >
                  <span className="relative z-10 font-mono tracking-widest text-sm uppercase">{t('resetPasswordUpdateBtn')}</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/30 mx-auto flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-[#00FF88]" />
              </div>
              <h2 className="text-2xl font-light text-slate-900 dark:text-[#FFFFFF] mb-2 font-sans tracking-tight">
                {t('resetPasswordSuccessTitle')}
              </h2>
              <p className="text-slate-500 dark:text-[#808A9D] text-xs leading-relaxed font-mono mt-4 mb-8 uppercase tracking-wider">
                {t('resetPasswordSuccessDesc')}
              </p>
              <Link href="/login" className="w-full flex items-center justify-center px-4 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-100 font-semibold rounded-xl transition-all duration-300 group/btn">
                <span className="relative z-10 font-mono tracking-widest text-sm uppercase">{t('loginSignInBtn')}</span>
                <ArrowRight className="w-4 h-4 ml-2 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
