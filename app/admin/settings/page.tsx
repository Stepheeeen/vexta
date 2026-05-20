'use client';

import { AdminLayout } from '@/components/admin-layout';
import { Settings, Bell, Shield, DollarSign, Check, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newRegistrations: true,
    twoFactorRequired: false,
    referralRate: 15,
    tradingFee: 2,
    withdrawalFee: 1,
  });

  const [loading, setLoading] = useState(true);
  const [savingCommissions, setSavingCommissions] = useState(false);
  const [savedCommissions, setSavedCommissions] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savedNotifications, setSavedNotifications] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [savedSecurity, setSavedSecurity] = useState(false);

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
    } catch (err: any) {
      alert(err.message || 'Failed to update setting');
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
      setTimeout(() => setSavedCommissions(false), 2000);
    } catch (err: any) {
      alert(err.message || 'An error occurred');
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
      setTimeout(() => setSavedSecurity(false), 2000);
    }, 800);
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Platform Settings</h1>
        <p className="text-slate-500 dark:text-gray-400">Configure platform-wide settings and preferences</p>
      </div>

      {/* System Settings */}
      <div className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          System Controls
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200 dark:border-white/5">
            <div>
              <p className="text-slate-900 dark:text-white font-medium text-sm">Maintenance Mode</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Temporarily disable platform for all users</p>
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
              <p className="text-slate-900 dark:text-white font-medium text-sm">Allow New Registrations</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Enable/disable new user signups</p>
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
              <p className="text-slate-900 dark:text-white font-medium text-sm">Require 2FA for All Users</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Enforce two-factor authentication</p>
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
          Commission & Fee Settings
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Referral Commission Rate (%)</label>
            <input
              type="number"
              value={settings.referralRate}
              onChange={(e) => setSettings({ ...settings, referralRate: Number(e.target.value) })}
              required
              className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">Percentage of each referral&apos;s activity credited to referrer</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Trading Fee (%)</label>
            <input
              type="number"
              value={settings.tradingFee}
              onChange={(e) => setSettings({ ...settings, tradingFee: Number(e.target.value) })}
              required
              className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">Fee charged on each trade execution</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Withdrawal Fee (%)</label>
            <input
              type="number"
              value={settings.withdrawalFee}
              onChange={(e) => setSettings({ ...settings, withdrawalFee: Number(e.target.value) })}
              required
              className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">Fee charged on withdrawals</p>
          </div>

          <button
            type="submit"
            disabled={savingCommissions}
            className="w-full mt-4 py-3 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {savingCommissions ? 'Saving...' : savedCommissions ? <><Check className="w-5 h-5" /> Saved</> : 'Save Commission & Fee Settings'}
          </button>
        </div>
      </form>

      {/* Notification Settings */}
      <form onSubmit={handleSaveNotifications} className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          Notification Thresholds
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200 dark:border-white/5">
            <div>
              <p className="text-slate-900 dark:text-white font-medium text-sm">Email Notifications</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Send alerts to admins</p>
            </div>
            <button
              type="button"
              className="relative w-12 h-7 rounded-full bg-violet-600 dark:bg-violet-500"
            >
              <div className="absolute top-1 w-5 h-5 bg-white dark:bg-[#0F1419] rounded-full translate-x-6" />
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200 dark:border-white/5">
            <p className="text-slate-900 dark:text-white font-medium mb-3 text-sm">Alert Thresholds</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Large Withdrawal Alert ($)</label>
                <input
                  type="number"
                  defaultValue="50000"
                  required
                  className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Suspicious Activity Alert</label>
                <select className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 text-slate-700 dark:text-gray-300 focus:outline-none focus:border-violet-500 text-sm">
                  <option>Medium (3+ failed logins)</option>
                  <option>High (1+ failed login)</option>
                  <option>Critical (Any failed login)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingNotifications}
            className="w-full mt-4 py-3 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {savingNotifications ? 'Saving...' : savedNotifications ? <><Check className="w-5 h-5" /> Saved</> : 'Save Notification Settings'}
          </button>
        </div>
      </form>

      {/* Security Settings */}
      <form onSubmit={handleSaveSecurity} className="bg-white dark:bg-[#0A0F14]/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          Security Controls
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Max Failed Login Attempts</label>
            <input
              type="number"
              defaultValue="5"
              required
              className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">After this many attempts, account is locked</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              defaultValue="30"
              required
              className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">Automatic logout after inactivity</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">IP Whitelist</label>
            <textarea
              defaultValue="192.168.1.1&#10;10.0.0.0/8"
              className="w-full bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 h-24 font-mono text-xs"
              placeholder="Enter IPs (one per line)"
            />
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">Only these IPs can access admin panel</p>
          </div>

          <button
            type="submit"
            disabled={savingSecurity}
            className="w-full mt-4 py-3 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {savingSecurity ? 'Saving...' : savedSecurity ? <><Check className="w-5 h-5" /> Saved</> : 'Save Security Settings'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
