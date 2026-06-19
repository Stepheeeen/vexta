'use client';

import { AdminLayout } from '@/components/admin-layout';
import { Settings, Bell, Shield, DollarSign, Check, Loader2, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/components/translation-provider';
import { useToast } from '@/hooks/use-toast';

// Volume constants (mirrored from /api/liquidity-volume/route.ts)
const LAUNCH_DATE = new Date('2025-01-06T00:00:00Z');
const BASE_VOLUME = 1_000_000;
const INCREMENT_PER_PERIOD = 25_000;
const INCREMENT_DAYS = 15;

function computeCurrentVolume(liquidityBonus: number): number {
  const daysSinceLaunch = Math.max(0,
    Math.floor((Date.now() - LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24))
  );
  const periods = Math.floor(daysSinceLaunch / INCREMENT_DAYS);
  return BASE_VOLUME + periods * INCREMENT_PER_PERIOD + liquidityBonus;
}

export default function AdminSettings() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newRegistrations: true,
    twoFactorRequired: false,
    referralRate: 15,
    tradingFee: 2,
    withdrawalFee: 1,
    liquidityBonus: 0,
  });

  const [loading, setLoading] = useState(true);
  const [savingCommissions, setSavingCommissions] = useState(false);
  const [savedCommissions, setSavedCommissions] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savedNotifications, setSavedNotifications] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [savedSecurity, setSavedSecurity] = useState(false);
  const [savingVolume, setSavingVolume] = useState(false);
  const [savedVolume, setSavedVolume] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/settings');
        if (!res.ok) throw new Error('Failed to fetch settings');
        const data = await res.json();
        if (data.settings) {
          setSettings({
            maintenanceMode: data.settings.maintenanceMode ?? false,
            newRegistrations: data.settings.newRegistrations ?? true,
            twoFactorRequired: data.settings.twoFactorRequired ?? false,
            referralRate: data.settings.referralRate ?? 15,
            tradingFee: data.settings.tradingFee ?? 2,
            withdrawalFee: data.settings.withdrawalFee ?? 1,
            liquidityBonus: data.settings.liquidityBonus ?? 0,
          });
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = async (key: 'maintenanceMode' | 'newRegistrations' | 'twoFactorRequired') => {
    const newVal = !settings[key];
    // Optimistic UI update
    setSettings(prev => ({
      ...prev,
      [key]: newVal
    }));

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newVal }),
      });
      if (!res.ok) throw new Error('Failed to update setting');
      toast({
        title: t('adminAlertSuccess'),
        description: t('adminSettingsUpdateSuccess'),
      });
    } catch (err: any) {
      toast({
        title: t('adminAlertError'),
        description: err.message || 'Failed to update setting',
        variant: 'destructive',
      });
      // Rollback
      setSettings(prev => ({
        ...prev,
        [key]: !newVal
      }));
    }
  };

  const handleSaveCommissions = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCommissions(true);
    setSavedCommissions(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralRate: Number(settings.referralRate),
          tradingFee: Number(settings.tradingFee),
          withdrawalFee: Number(settings.withdrawalFee),
        }),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setSavedCommissions(true);
      toast({
        title: t('adminAlertSuccess'),
        description: t('adminSettingsUpdateSuccess'),
      });
      setTimeout(() => setSavedCommissions(false), 2000);
    } catch (err: any) {
      toast({
        title: t('adminAlertError'),
        description: err.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSavingCommissions(false);
    }
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotifications(true);
    setSavedNotifications(false);
    setTimeout(() => {
      setSavingNotifications(false);
      setSavedNotifications(true);
      toast({
        title: t('adminAlertSuccess'),
        description: t('adminSettingsUpdateSuccess'),
      });
      setTimeout(() => setSavedNotifications(false), 2000);
    }, 800);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSecurity(true);
    setSavedSecurity(false);
    setTimeout(() => {
      setSavingSecurity(false);
      setSavedSecurity(true);
      toast({
        title: t('adminAlertSuccess'),
        description: t('adminSettingsUpdateSuccess'),
      });
      setTimeout(() => setSavedSecurity(false), 2000);
    }, 800);
  };

  const handleSaveVolume = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingVolume(true);
    setSavedVolume(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liquidityBonus: Number(settings.liquidityBonus) }),
      });
      if (!res.ok) throw new Error('Failed to save volume bonus');
      setSavedVolume(true);
      toast({
        title: t('adminAlertSuccess'),
        description: 'Liquidity volume bonus updated successfully.',
      });
      setTimeout(() => setSavedVolume(false), 2000);
    } catch (err: any) {
      toast({
        title: t('adminAlertError'),
        description: err.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSavingVolume(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('adminSettingsTitle')}</h1>
        <p className="text-slate-500 dark:text-gray-400">{t('adminSettingsSub')}</p>
      </div>

      {/* System Settings */}
      <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          {t('adminSettingsSystemControls')}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200 dark:border-white/5">
            <div>
              <p className="text-slate-900 dark:text-white font-medium text-sm">{t('adminSettingsMaintenanceMode')}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{t('adminSettingsMaintenanceDesc')}</p>
            </div>
            <button
              onClick={() => handleToggle('maintenanceMode')}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-200 dark:bg-white/10'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white dark:bg-[#0F1419] rounded-full transition-transform ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200 dark:border-white/5">
            <div>
              <p className="text-slate-900 dark:text-white font-medium text-sm">{t('adminSettingsNewRegistrations')}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{t('adminSettingsNewRegistrationsDesc')}</p>
            </div>
            <button
              onClick={() => handleToggle('newRegistrations')}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings.newRegistrations ? 'bg-violet-600 dark:bg-violet-500' : 'bg-slate-200 dark:bg-white/10'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white dark:bg-[#0F1419] rounded-full transition-transform ${
                  settings.newRegistrations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200 dark:border-white/5">
            <div>
              <p className="text-slate-900 dark:text-white font-medium text-sm">{t('adminSettingsRequire2fa')}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{t('adminSettingsRequire2faDesc')}</p>
            </div>
            <button
              onClick={() => handleToggle('twoFactorRequired')}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings.twoFactorRequired ? 'bg-violet-600 dark:bg-violet-500' : 'bg-slate-200 dark:bg-white/10'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white dark:bg-[#0F1419] rounded-full transition-transform ${
                  settings.twoFactorRequired ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Commission Settings */}
      <form onSubmit={handleSaveCommissions} className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          {t('adminSettingsCommissionFeeSettings')}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">{t('adminSettingsReferralRate')}</label>
            <input
              type="number"
              value={settings.referralRate}
              onChange={(e) => setSettings({ ...settings, referralRate: Number(e.target.value) })}
              required
              className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">{t('adminSettingsReferralHint')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">{t('adminSettingsTradingFee')}</label>
            <input
              type="number"
              value={settings.tradingFee}
              onChange={(e) => setSettings({ ...settings, tradingFee: Number(e.target.value) })}
              required
              className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">{t('adminSettingsTradingFeeHint')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">{t('adminSettingsWithdrawalFee')}</label>
            <input
              type="number"
              value={settings.withdrawalFee}
              onChange={(e) => setSettings({ ...settings, withdrawalFee: Number(e.target.value) })}
              required
              className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">{t('adminSettingsWithdrawalFeeHint')}</p>
          </div>

          <button
            type="submit"
            disabled={savingCommissions}
            className="w-full mt-4 py-3 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {savingCommissions ? t('adminSettingsSaving') : savedCommissions ? <><Check className="w-5 h-5" /> {t('adminSettingsSaved')}</> : t('adminSettingsSaveCommissionBtn')}
          </button>
        </div>
      </form>

      {/* Notification Settings */}
      <form onSubmit={handleSaveNotifications} className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          {t('adminSettingsNotificationThresholds')}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200 dark:border-white/5">
            <div>
              <p className="text-slate-900 dark:text-white font-medium text-sm">{t('adminSettingsEmailNotifications')}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{t('adminSettingsSendAlertsAdmins')}</p>
            </div>
            <button
              type="button"
              className="relative w-12 h-7 rounded-full bg-violet-600 dark:bg-violet-500"
            >
              <div className="absolute top-1 w-5 h-5 bg-white dark:bg-[#0F1419] rounded-full translate-x-6" />
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200 dark:border-white/5">
            <p className="text-slate-900 dark:text-white font-medium mb-3 text-sm">{t('adminSettingsAlertThresholds')}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">{t('adminSettingsLargeWithdrawalAlert')}</label>
                <input
                  type="number"
                  defaultValue="50000"
                  required
                  className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">{t('adminSettingsSuspiciousAlert')}</label>
                <select className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 text-slate-700 dark:text-gray-300 focus:outline-none focus:border-violet-500 text-sm">
                  <option>{t('adminSettingsMediumLogins')}</option>
                  <option>{t('adminSettingsHighLogins')}</option>
                  <option>{t('adminSettingsCriticalLogins')}</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingNotifications}
            className="w-full mt-4 py-3 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {savingNotifications ? t('adminSettingsSaving') : savedNotifications ? <><Check className="w-5 h-5" /> {t('adminSettingsSaved')}</> : t('adminSettingsSaveNotificationsBtn')}
          </button>
        </div>
      </form>

      {/* Liquidity Volume Control */}
      <form onSubmit={handleSaveVolume} className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          Liquidity Volume Control
        </h3>
        <p className="text-xs text-slate-500 dark:text-gray-400 mb-6">
          Manage the displayed operating volume on the arbitrage page. The base volume auto-increments by
          ${INCREMENT_PER_PERIOD.toLocaleString()} every {INCREMENT_DAYS} days since launch (Jan 6, 2025).
          Use the bonus field to add extra volume on top.
        </p>

        {/* Read-only computed stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200 dark:border-white/5">
          <div>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-mono uppercase tracking-wide mb-1">Base Volume</p>
            <p className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">${BASE_VOLUME.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 font-mono">Fixed starting capital</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-mono uppercase tracking-wide mb-1">Auto-increment</p>
            <p className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">
              +${(Math.floor(Math.max(0, (Date.now() - LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24)) / INCREMENT_DAYS) * INCREMENT_PER_PERIOD).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">+$25k per 15 days since launch</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-mono uppercase tracking-wide mb-1">Total Shown to Users</p>
            <p className="text-lg font-extrabold font-mono text-violet-600 dark:text-violet-400">
              ${computeCurrentVolume(settings.liquidityBonus).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">Base + Auto + Bonus</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Manual Bonus Volume (USDT)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={settings.liquidityBonus}
            onChange={(e) => setSettings({ ...settings, liquidityBonus: Number(e.target.value) })}
            required
            className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm font-mono"
          />
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">
            This amount is added to the auto-computed base volume and shown immediately to all users on the arbitrage page.
            Set to 0 to show only the auto-computed volume.
          </p>
        </div>

        <button
          type="submit"
          disabled={savingVolume}
          className="w-full mt-4 py-3 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {savingVolume ? t('adminSettingsSaving') : savedVolume ? <><Check className="w-5 h-5" /> Saved!</> : 'Save Volume Bonus'}
        </button>
      </form>

      {/* Security Settings */}
      <form onSubmit={handleSaveSecurity} className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          {t('adminSettingsSecurityControls')}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">{t('adminSettingsMaxFailedAttempts')}</label>
            <input
              type="number"
              defaultValue="5"
              required
              className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">{t('adminSettingsMaxFailedAttemptsHint')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">{t('adminSettingsSessionTimeout')}</label>
            <input
              type="number"
              defaultValue="30"
              required
              className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">{t('adminSettingsSessionTimeoutHint')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">{t('adminSettingsIpWhitelistLabel')}</label>
            <textarea
              defaultValue="192.168.1.1&#10;10.0.0.0/8"
              className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 h-24 font-mono text-xs"
              placeholder={t('adminSettingsIpWhitelistPlaceholder')}
            />
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">{t('adminSettingsIpWhitelistHint')}</p>
          </div>

          <button
            type="submit"
            disabled={savingSecurity}
            className="w-full mt-4 py-3 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {savingSecurity ? t('adminSettingsSaving') : savedSecurity ? <><Check className="w-5 h-5" /> {t('adminSettingsSaved')}</> : t('adminSettingsSaveSecurityBtn')}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
