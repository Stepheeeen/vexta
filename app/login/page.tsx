"use client"

import Link from 'next/link';
import { useState } from 'react';
import { VextaLogoText } from '@/components/vexta-logo';
import { BackgroundPattern } from '@/components/background-pattern';
import { ArrowRight, Activity, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError(t('forgotPasswordInvalidEmail'));
      return;
    }
    if (formData.password.length < 1) {
      setError(t('loginPasswordRequired'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user && !data.user.isVerified) {
        window.location.href = '/verify';
      } else if (data.user && data.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0F1419] text-slate-900 dark:text-white flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-250">
      <BackgroundPattern />
      <LanguageSwitcher />

      <div className="w-full max-w-md relative z-10 mt-12 mb-12">
        <div className="mb-8 text-center flex flex-col items-center">
          <Link href="/">
            <VextaLogoText />
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-[#1A1F2E]/80 border border-slate-200 dark:border-[#00D9FF]/30 backdrop-blur-md">
            <Activity className="w-4 h-4 text-violet-600 dark:text-[#00D9FF] animate-pulse" />
            <span className="text-xs text-violet-600 dark:text-[#00D9FF] font-mono tracking-wider">{t('secureConnection')}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-2xl p-10 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          <h1 className="text-3xl font-light text-slate-900 dark:text-[#FFFFFF] mb-2 font-sans tracking-tight">
            {t('loginWelcome')}{' '}
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600 dark:from-[#00D9FF] to-[#00FF88]">
              {t('loginWelcomeHighlight')}
            </span>
          </h1>
          <p className="text-slate-500 dark:text-[#808A9D] text-sm mb-8 font-mono">
            {t('loginSubtitle')}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group/input">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-[#FFFFFF] mb-2 font-mono uppercase tracking-widest text-[10px] dark:text-white/50">
                {t('loginEmailLabel')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3.5 text-slate-900 dark:text-[#FFFFFF] placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-violet-500/50 dark:focus:border-[#00D9FF]/50 focus:ring-1 focus:ring-violet-500/50 dark:focus:ring-[#00D9FF]/50 focus:bg-white/10 transition-all duration-300 font-mono text-sm"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="group/input">
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-[#FFFFFF] font-mono uppercase tracking-widest text-[10px] dark:text-white/50">
                  {t('loginPasswordLabel')}
                </label>
                <Link href="/forgot-password" className="text-[10px] text-slate-400 dark:text-white/40 hover:text-violet-600 dark:hover:text-[#00D9FF] transition-colors font-mono uppercase tracking-wider">
                  {t('loginForgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl pl-4 pr-12 py-3.5 text-slate-900 dark:text-[#FFFFFF] placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-violet-500/50 dark:focus:border-[#00FF88]/50 focus:ring-1 focus:ring-violet-500/50 dark:focus:ring-[#00FF88]/50 focus:bg-white/10 transition-all duration-300 font-mono"
                  placeholder="••••••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 px-4 py-4 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-100 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white dark:text-black" />
              ) : (
                <>
                  <span className="relative z-10 font-mono tracking-widest text-sm uppercase">{t('loginSignInBtn')}</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-white/5">
            <p className="text-slate-500 dark:text-[#808A9D] text-xs font-mono uppercase tracking-widest">
              {t('loginNoAccount')}{' '}
              <Link href="/signup" className="text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-white/80 font-semibold tracking-wider underline decoration-slate-300 dark:decoration-white/30 underline-offset-4">
                {t('loginSignUpLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
