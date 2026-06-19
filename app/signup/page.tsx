'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { VextaLogoText } from '@/components/vexta-logo';
import { BackgroundPattern } from '@/components/background-pattern';
import { ArrowRight, Activity, Hexagon, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { countries } from '@/lib/countries';

export default function SignUp() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    whatsappOrTelegram: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    acceptTerms: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('code') || localStorage.getItem('vexta_referred_by');
      if (ref) {
        setFormData(prev => ({ ...prev, referralCode: ref }));
      }
    }
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = t('signupFirstNameRequired');
      if (!formData.lastName.trim()) newErrors.lastName = t('signupLastNameRequired');
      if (!formData.email.includes('@') || !formData.email.includes('.')) newErrors.email = t('signupValidEmailRequired');
      if (!formData.country.trim()) newErrors.country = t('signupCountryRequired');
    } else if (currentStep === 2) {
      if (formData.password.length < 8) newErrors.password = t('signupPasswordLengthError');
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('signupPasswordsMismatch');
    } else if (currentStep === 3) {
      if (!formData.acceptTerms) newErrors.acceptTerms = t('signupAgreeTermsError');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        setLoading(true);
        setSubmitError(null);
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              country: formData.country,
              whatsappOrTelegram: formData.whatsappOrTelegram || undefined,
              password: formData.password,
              referralCode: formData.referralCode || undefined,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Registration failed');
          }
          window.location.href = '/verify';
        } catch (err: any) {
          setSubmitError(err.message || 'An error occurred during registration.');
        } finally {
          setLoading(false);
        }
      }
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
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-[#1A1F2E]/80 border border-slate-200 dark:border-[#00FF88]/30 backdrop-blur-md">
            <Activity className="w-4 h-4 text-violet-600 dark:text-[#00FF88] animate-pulse" />
            <span className="text-xs text-violet-600 dark:text-[#00FF88] font-mono tracking-wider">{t('nodeInitialization')}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-2xl p-10 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          {/* Progress */}
          <div className="flex justify-between mb-10">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 mx-1 rounded-full transition-all duration-500 ${
                  s < step 
                    ? 'bg-slate-300 dark:bg-white/80' 
                    : s === step 
                      ? 'bg-gradient-to-r from-violet-600 to-blue-600 dark:from-[#00D9FF] to-[#00FF88]' 
                      : 'bg-slate-200 dark:bg-white/10'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-light text-slate-900 dark:text-[#FFFFFF] font-sans tracking-tight">
              {step === 1 && <><span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600 dark:from-[#00D9FF] to-[#00FF88]">{t('signupStep1Title')}</span> {t('signupStep1TitleSuffix')}</>}
              {step === 2 && <><span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600 dark:from-[#00D9FF] to-[#00FF88]">{t('signupStep2Title')}</span> {t('signupStep2TitleSuffix')}</>}
              {step === 3 && <><span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600 dark:from-[#00D9FF] to-[#00FF88]">{t('signupStep3Title')}</span> {t('signupStep3TitleSuffix')}</>}
            </h1>
          </div>
          <p className="text-slate-500 dark:text-[#808A9D] text-[10px] mb-8 font-mono tracking-widest uppercase">
            {step === 1 && t('signupStep1Sub')}
            {step === 2 && t('signupStep2Sub')}
            {step === 3 && t('signupStep3Sub')}
          </p>

          {submitError && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 dark:text-red-400 text-xs font-mono">
              {submitError}
            </div>
          )}

          <div className="min-h-[280px]">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="group/input">
                    <label className="block text-[10px] font-mono text-slate-400 dark:text-white/50 uppercase tracking-widest mb-2">{t('signupFirstName')}</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 dark:bg-white/5 border ${errors.firstName ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-200 dark:border-white/5 focus:border-violet-500/50 dark:focus:border-[#00D9FF]/50 focus:ring-violet-500/50 dark:focus:ring-[#00D9FF]/50'} rounded-xl px-4 py-3.5 text-slate-900 dark:text-[#FFFFFF] placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:ring-1 focus:bg-white/10 transition-all font-mono text-sm`}
                      placeholder="Jane"
                    />
                    {errors.firstName && <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-mono uppercase tracking-wider">{errors.firstName}</p>}
                  </div>
                  <div className="group/input">
                    <label className="block text-[10px] font-mono text-slate-400 dark:text-white/50 uppercase tracking-widest mb-2">{t('signupLastName')}</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 dark:bg-white/5 border ${errors.lastName ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-200 dark:border-white/5 focus:border-violet-500/50 dark:focus:border-[#00D9FF]/50 focus:ring-violet-500/50 dark:focus:ring-[#00D9FF]/50'} rounded-xl px-4 py-3.5 text-slate-900 dark:text-[#FFFFFF] placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:ring-1 focus:bg-white/10 transition-all font-mono text-sm`}
                      placeholder="Doe"
                    />
                    {errors.lastName && <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-mono uppercase tracking-wider">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="group/input">
                  <label className="block text-[10px] font-mono text-slate-400 dark:text-white/50 uppercase tracking-widest mb-2">{t('signupEmailLabel')}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 dark:bg-white/5 border ${errors.email ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-200 dark:border-white/5 focus:border-violet-500/50 dark:focus:border-[#00D9FF]/50 focus:ring-violet-500/50 dark:focus:ring-[#00D9FF]/50'} rounded-xl px-4 py-3.5 text-slate-900 dark:text-[#FFFFFF] placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:ring-1 focus:bg-white/10 transition-all font-mono text-sm`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-mono uppercase tracking-wider">{errors.email}</p>}
                </div>

                <div className="group/input">
                  <label className="block text-[10px] font-mono text-slate-400 dark:text-white/50 uppercase tracking-widest mb-2">{t('signupCountryLabel')}</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={(e: any) => {
                      setFormData(prev => ({ ...prev, country: e.target.value }));
                      if (errors.country) setErrors(prev => ({ ...prev, country: '' }));
                    }}
                    className={`w-full bg-slate-50 dark:bg-white/5 border ${errors.country ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-200 dark:border-white/5 focus:border-violet-500/50 dark:focus:border-[#00D9FF]/50 focus:ring-violet-500/50 dark:focus:ring-[#00D9FF]/50'} rounded-xl px-4 py-3.5 text-slate-900 dark:text-[#FFFFFF] focus:outline-none focus:ring-1 focus:bg-white/10 transition-all font-mono text-sm`}
                  >
                    <option value="" className="text-slate-400 dark:text-white/30 bg-white dark:bg-[#0F1419]">{t('signupSelectCountry')}</option>
                    {countries.map((country) => (
                      <option key={country} value={country} className="bg-white dark:bg-[#0F1419]">
                        {country}
                      </option>
                    ))}
                  </select>
                  {errors.country && <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-mono uppercase tracking-wider">{errors.country}</p>}
                </div>

                <div className="group/input">
                  <label className="block text-[10px] font-mono text-slate-400 dark:text-white/50 uppercase tracking-widest mb-2">{t('signupWhatsappOrTelegramLabel')}</label>
                  <input
                    type="text"
                    name="whatsappOrTelegram"
                    value={formData.whatsappOrTelegram}
                    onChange={(e: any) => {
                      setFormData(prev => ({ ...prev, whatsappOrTelegram: e.target.value }));
                    }}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 focus:border-violet-500/50 dark:focus:border-[#00D9FF]/50 focus:ring-violet-500/50 dark:focus:ring-[#00D9FF]/50 rounded-xl px-4 py-3.5 text-slate-900 dark:text-[#FFFFFF] placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:ring-1 focus:bg-white/10 transition-all font-mono text-sm"
                    placeholder="+1234567890 (optional)"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="group/input">
                  <label className="block text-[10px] font-mono text-slate-400 dark:text-white/50 uppercase tracking-widest mb-2">{t('signupPasswordLabel')}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 dark:bg-white/5 border ${errors.password ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-200 dark:border-white/5 focus:border-violet-500/50 dark:focus:border-[#00FF88]/50 focus:ring-violet-500/50 dark:focus:ring-[#00FF88]/50'} rounded-xl pl-4 pr-12 py-3.5 text-slate-900 dark:text-[#FFFFFF] placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:ring-1 focus:bg-white/10 transition-all font-mono`}
                      placeholder="••••••••••••"
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
                    {t('signupPasswordHint')}
                  </p>
                  {errors.password && <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-mono uppercase tracking-wider">{errors.password}</p>}
                </div>

                <div className="group/input">
                  <label className="block text-[10px] font-mono text-slate-400 dark:text-white/50 uppercase tracking-widest mb-2">{t('signupConfirmPasswordLabel')}</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 dark:bg-white/5 border ${errors.confirmPassword ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-200 dark:border-white/5 focus:border-violet-500/50 dark:focus:border-[#00FF88]/50 focus:ring-violet-500/50 dark:focus:ring-[#00FF88]/50'} rounded-xl pl-4 pr-12 py-3.5 text-slate-900 dark:text-[#FFFFFF] placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:ring-1 focus:bg-white/10 transition-all font-mono`}
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 focus:outline-none transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-mono uppercase tracking-wider">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Referral */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="group/input">
                  <label className="block text-[10px] font-mono text-slate-400 dark:text-white/50 uppercase tracking-widest mb-2">{t('signupReferralLabel')}</label>
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3.5 text-slate-900 dark:text-[#FFFFFF] placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-violet-500/50 dark:focus:border-[#00D9FF]/50 focus:ring-1 focus:ring-violet-500/50 dark:focus:ring-[#00D9FF]/50 focus:bg-white/10 transition-all font-mono text-sm"
                    placeholder="VEXTA123"
                    disabled={loading}
                  />
                </div>

                <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-5 relative overflow-hidden">
                  <Hexagon className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-900/5 dark:text-white/5" />
                  <p className="text-[10px] text-slate-400 dark:text-white/50 font-mono tracking-widest uppercase mb-2">{t('signupYourLink')}</p>
                  <p className="text-lg font-light text-slate-900 dark:text-[#FFFFFF] font-mono tracking-wider">vexta.network/signup?ref=N8K2L9</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#808A9D] mt-2 font-mono uppercase">{t('signupShareHint')}</p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group mt-4">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className={`w-5 h-5 rounded-md border ${errors.acceptTerms ? 'border-red-500 bg-red-500/10' : 'border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5'} appearance-none checked:bg-slate-900 dark:checked:bg-white checked:border-slate-900 dark:checked:border-white transition-all cursor-pointer peer`}
                      disabled={loading}
                    />
                    <div className="absolute text-white dark:text-black pointer-events-none opacity-0 peer-checked:opacity-100">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 dark:text-[#808A9D] font-mono leading-relaxed uppercase tracking-wider">
                      {t('signupTerms')}
                    </span>
                    {errors.acceptTerms && <span className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-mono uppercase tracking-wider">{errors.acceptTerms}</span>}
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="flex-1 px-4 py-3.5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/50 hover:text-slate-900 dark:hover:text-[#FFFFFF] hover:bg-slate-100 dark:hover:bg-white/5 font-mono text-sm tracking-widest rounded-xl transition-all uppercase disabled:opacity-50"
              >
                {t('signupBack')}
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className={`flex-[2] px-4 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-100 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden disabled:opacity-50`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white dark:text-black" />
              ) : (
                <>
                  <span className="relative z-10 font-mono tracking-widest text-sm uppercase">
                    {step === 3 ? t('signupCreateBtn') : t('signupContinue')}
                  </span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 dark:text-[#808A9D] text-[10px] font-mono uppercase tracking-widest">
              {t('signupHaveAccount')}{' '}
              <Link href="/login" className="text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-white/80 font-semibold tracking-wider underline decoration-slate-300 dark:decoration-white/30 underline-offset-4">
                {t('signupSignInLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
