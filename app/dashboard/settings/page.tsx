'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { User, Lock, Bell, Eye, LogOut, ChevronRight, Loader2, Sun, Moon, Globe, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';


const inputClass =
  'w-full bg-white/3 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all font-mono';

const sectionClass =
  'bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 mb-5';

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      type="button"
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${value ? 'bg-violet-600' : 'bg-slate-200 dark:bg-white/10'}`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

function Row({ label, desc, action }: { label: string; desc: string; action: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5 font-sans">
      <div className="min-w-0 mr-4">
        <p className="text-xs font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-0.5">{desc}</p>
      </div>
      {action}
    </div>
  );
}

const flags = {
  en: '🇺🇸',
  es: '🇪🇸',
  vi: '🇻🇳',
  th: '🇹🇭',
  pt: '🇵🇹',
  ko: '🇰🇷',
  fr: '🇫🇷',
  zh: '🇨🇳',
  ar: '🇸🇦',
  ru: '🇷🇺',
  hi: '🇮🇳',
  de: '🇩🇪'
};

const langNames = {
  en: 'English',
  es: 'Español',
  vi: 'Tiếng Việt',
  th: 'ภาษาไทย',
  pt: 'Português',
  ko: '한국어',
  fr: 'Français',
  zh: '简体中文',
  ar: 'العربية',
  ru: 'Русский',
  hi: 'हिन्दी',
  de: 'Deutsch'
};

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Other Toggles
  const [twoFA, setTwoFA]   = useState(true);
  const [emailNotif, setEmailNotif]   = useState(true);
  const [alerts, setAlerts] = useState(false);
  const [pub, setPub]       = useState(false);

  const { toast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // next-themes needs to wait for mount on client to avoid hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error('Not logged in');
        const json = await res.json();
        setProfile({
          firstName: json.user.firstName || '',
          lastName: json.user.lastName || '',
          email: json.user.email || '',
        });
      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update profile');
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' });
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure you want to delete your account? This will erase all simulation history and positions.')) {
      return;
    }
    try {
      await fetch('/api/admin/simulate?action=reset', {
        method: 'POST',
        headers: { 'x-admin-key': 'vexta-admin-dev' },
      });
      await fetch('/api/auth/me', { method: 'DELETE' });
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em] mb-1">{t('settingsAccount')}</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('settings')}</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 text-xs font-mono transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          {t('logout')}
        </button>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
      ) : (
        <>
          {/* Profile */}
          <form onSubmit={handleSaveProfile} className={sectionClass}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t('profileInformation')}</h2>
            </div>

            {message && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-mono">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-xl text-xs font-mono">
                {error}
              </div>
            )}

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5">
              <div className="w-12 h-12 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-base font-bold text-violet-600 dark:text-violet-400 uppercase">
                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.firstName} {profile.lastName}</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{profile.email}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-2">{t('firstName')}</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-2">{t('lastName')}</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-2">{t('emailAddress')}</label>
              <input
                type="email"
                value={profile.email}
                className={`${inputClass} opacity-50 cursor-not-allowed`}
                disabled
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all disabled:opacity-50 shadow-md shadow-violet-600/15"
            >
              {saving ? 'Saving...' : t('saveChanges')}
            </button>
          </form>

          {/* Theme & Language Customizer */}
          {mounted && (
            <div className={sectionClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-yellow-500" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t('appearance')}</h2>
              </div>
              <div className="space-y-3">
                <Row
                  label={t('themeMode')}
                  desc={`${t('settingsThemeModeDesc')} ${theme === 'dark' ? t('settingsDarkMode') : t('settingsLightMode')}`}
                  action={
                    <Toggle
                      value={theme === 'dark'}
                      onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    />
                  }
                />

                <Row
                  label={language === 'vi' ? 'Hướng dẫn Chào mừng' : language === 'es' ? 'Guía de Bienvenida' : 'Onboarding Tour'}
                  desc={language === 'vi' ? 'Chạy lại trình hướng dẫn chào mừng tương tác để xem lại các tính năng.' : language === 'es' ? 'Reproduzca el recorrido interactivo de bienvenida para revisar las características.' : 'Replay the interactive welcome tour to review platform features.'}
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem('vexta_tour_replay_trigger', 'true');
                        localStorage.removeItem('vexta_tour_completed');
                        router.push('/dashboard');
                      }}
                      className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
                    >
                      {language === 'vi' ? 'Bắt đầu' : language === 'es' ? 'Comenzar' : 'Start Tour'}
                    </button>
                  }
                />
                
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-100 dark:border-white/5 font-sans">
                  <div className="min-w-0 mr-4">
                    <p className="text-xs font-medium text-slate-900 dark:text-white">Language / Idioma / ภาษา / 언어 / Langue</p>
                    <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-0.5">{t('settingsLanguageDesc')}</p>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-white dark:bg-[#0A0F14] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-violet-500"
                  >
                    {(Object.keys(flags) as Array<keyof typeof flags>).map((lang) => (
                      <option key={lang} value={lang}>
                        {flags[lang]} {langNames[lang]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          <div className={sectionClass}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Lock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t('security')}</h2>
            </div>
            <div className="space-y-3">
              <Row label={t('changePassword')} desc={t('settingsChangePasswordDesc')} action={
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-[10px] font-mono text-violet-600 dark:text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
                >
                  {t('settingsResetBtn')} <ChevronRight className="inline w-3 h-3 -mt-0.5" />
                </button>
              } />
              <Row label={t('twoFactor')} desc={t('settingsTwoFactorDesc')} action={
                <Toggle value={twoFA} onChange={() => setTwoFA(!twoFA)} />
              } />
            </div>
          </div>

          {/* Notifications */}
          <div className={sectionClass}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Bell className="w-4 h-4 text-yellow-500" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t('notifications')}</h2>
            </div>
            <div className="space-y-3">
              <Row label={t('emailNotifications')} desc={t('settingsEmailNotificationsDesc')} action={<Toggle value={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />} />
              <Row label={t('marketAlerts')} desc={t('settingsMarketAlertsDesc')} action={<Toggle value={alerts} onChange={() => setAlerts(!alerts)} />} />
            </div>
          </div>

          {/* Privacy */}
          <div className={sectionClass}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Eye className="w-4 h-4 text-green-500 dark:text-green-400" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t('privacy')}</h2>
            </div>
            <div className="space-y-3">
              <Row label={t('publicProfile')} desc={t('settingsPublicProfileDesc')} action={<Toggle value={pub} onChange={() => setPub(!pub)} />} />
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />
              </div>
              <h2 className="text-sm font-semibold text-red-500 dark:text-red-400">{t('dangerZone')}</h2>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono mb-4">
              {t('settingsDangerZoneDesc')}
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-2.5 text-xs font-semibold text-red-500 dark:text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-xl transition-all"
            >
              {t('deleteAccount')}
            </button>
          </div>
        </>
      )}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => {
            setShowDeleteModal(false);
            router.push('/login');
          }}
        />
      )}
    </DashboardLayout>
  );
}

function DeleteAccountModal({ onClose, onDeleted }: { onClose: () => void; onDeleted: () => void }) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'confirm' | 'otp'>('confirm');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleRequestOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/delete-account/request', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request OTP');
      setStep('otp');
      setTimer(60);
      toast({ title: 'OTP Sent', description: 'Check your email for the verification code.' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/delete-account/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP code');
      
      toast({ title: 'Success', description: 'Account permanently deleted.' });
      onDeleted();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0D1420] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-2">
            <LogOut className="w-5 h-5 text-white" />
            <span className="text-sm font-bold text-white">{t('delAccVerifyTitle')}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-mono">
              {error}
            </div>
          )}

          {step === 'confirm' ? (
            <>
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{t('delAccConfirmQuestion')}</p>
                <div className="p-3.5 bg-red-500/5 border border-red-500/15 rounded-2xl text-xs text-red-600 dark:text-red-400 space-y-2 leading-relaxed">
                  <p className="font-bold">{t('delAccWarning')}</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>{t('delAccBullet1')}</li>
                    <li>{t('delAccBullet2')}</li>
                    <li>{t('delAccBullet3')}</li>
                  </ul>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  {t('delAccOtpNote')}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold text-slate-650 dark:text-slate-300 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('delAccSendOtp')}
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleVerifyDelete} className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  {t('delAccOtpSentDesc')}
                </p>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-2">{t('delAccOtpCodeLabel')}</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('delAccOtpPlaceholder')}
                    className="w-full text-center tracking-[0.5em] text-lg font-black h-12 bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl px-4 focus:outline-none focus:border-red-500/50 transition-all font-mono text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 dark:text-gray-500">{t('delAccDidNotReceive')}</span>
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={loading || timer > 0}
                  className="text-red-500 hover:underline font-bold disabled:opacity-50 disabled:no-underline cursor-pointer"
                >
                  {timer > 0 ? `${t('delAccResendTimer')} ${timer}s` : t('delAccResendCode')}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('confirm')}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold text-slate-650 dark:text-slate-300 transition-colors"
                >
                  {t('back')}
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold shadow-lg shadow-red-600/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('delAccConfirmBtn')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
