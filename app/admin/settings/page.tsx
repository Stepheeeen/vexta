'use client';

import { AdminLayout } from '@/components/admin-layout';
import { Settings, Database, Bell, Shield, DollarSign } from 'lucide-react';
import { useState } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newRegistrations: true,
    emailNotifications: true,
    twoFactorRequired: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">Platform Settings</h1>
        <p className="text-[#A0A0A0]">Configure platform-wide settings and preferences</p>
      </div>

      {/* System Settings */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-[#FFFFFF] mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#00D9FF]" />
          System Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg border border-[#2A2E3E]">
            <div>
              <p className="text-[#FFFFFF] font-medium">Maintenance Mode</p>
              <p className="text-sm text-[#A0A0A0]">Temporarily disable platform for all users</p>
            </div>
            <button
              onClick={() => handleToggle('maintenanceMode')}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-red-500' : 'bg-[#2A2E3E]'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-[#0F1419] rounded-full transition-transform ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg border border-[#2A2E3E]">
            <div>
              <p className="text-[#FFFFFF] font-medium">Allow New Registrations</p>
              <p className="text-sm text-[#A0A0A0]">Enable/disable new user signups</p>
            </div>
            <button
              onClick={() => handleToggle('newRegistrations')}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings.newRegistrations ? 'bg-[#00FF88]' : 'bg-[#2A2E3E]'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-[#0F1419] rounded-full transition-transform ${
                  settings.newRegistrations ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg border border-[#2A2E3E]">
            <div>
              <p className="text-[#FFFFFF] font-medium">Require 2FA for All Users</p>
              <p className="text-sm text-[#A0A0A0]">Enforce two-factor authentication</p>
            </div>
            <button
              onClick={() => handleToggle('twoFactorRequired')}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings.twoFactorRequired ? 'bg-[#00FF88]' : 'bg-[#2A2E3E]'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-[#0F1419] rounded-full transition-transform ${
                  settings.twoFactorRequired ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Commission Settings */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-[#FFFFFF] mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#00D9FF]" />
          Commission Settings
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-2">Referral Commission Rate (%)</label>
            <input
              type="number"
              defaultValue="15"
              className="w-full bg-[#0F1419] border border-[#2A2E3E] rounded-lg px-4 py-3 text-[#FFFFFF] focus:outline-none focus:border-[#00D9FF]"
            />
            <p className="text-xs text-[#A0A0A0] mt-2">Percentage of each referral&apos;s activity credited to referrer</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-2">Trading Fee (%)</label>
            <input
              type="number"
              defaultValue="2"
              className="w-full bg-[#0F1419] border border-[#2A2E3E] rounded-lg px-4 py-3 text-[#FFFFFF] focus:outline-none focus:border-[#00D9FF]"
            />
            <p className="text-xs text-[#A0A0A0] mt-2">Fee charged on each trade execution</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-2">Withdrawal Fee (%)</label>
            <input
              type="number"
              defaultValue="1"
              className="w-full bg-[#0F1419] border border-[#2A2E3E] rounded-lg px-4 py-3 text-[#FFFFFF] focus:outline-none focus:border-[#00D9FF]"
            />
            <p className="text-xs text-[#A0A0A0] mt-2">Fee charged on withdrawals</p>
          </div>

          <button className="w-full mt-4 py-3 bg-[#00FF88] hover:bg-[#00E070] text-[#0F1419] font-bold rounded-lg transition-colors">
            Save Commission Settings
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-[#FFFFFF] mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#00D9FF]" />
          Notification Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg border border-[#2A2E3E]">
            <div>
              <p className="text-[#FFFFFF] font-medium">Email Notifications</p>
              <p className="text-sm text-[#A0A0A0]">Send alerts to admins</p>
            </div>
            <button
              onClick={() => handleToggle('emailNotifications')}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings.emailNotifications ? 'bg-[#00FF88]' : 'bg-[#2A2E3E]'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-[#0F1419] rounded-full transition-transform ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="p-4 bg-[#0F1419] rounded-lg border border-[#2A2E3E]">
            <p className="text-[#FFFFFF] font-medium mb-3">Alert Thresholds</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-[#A0A0A0] mb-1">Large Withdrawal Alert ($)</label>
                <input
                  type="number"
                  defaultValue="50000"
                  className="w-full bg-[#0F1419] border border-[#2A2E3E] rounded-lg px-4 py-2 text-[#FFFFFF] focus:outline-none focus:border-[#00D9FF]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#A0A0A0] mb-1">Suspicious Activity Alert</label>
                <select className="w-full bg-[#0F1419] border border-[#2A2E3E] rounded-lg px-4 py-2 text-[#A0A0A0] focus:outline-none focus:border-[#00D9FF]">
                  <option>Medium (3+ failed logins)</option>
                  <option>High (1+ failed login)</option>
                  <option>Critical (Any failed login)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#FFFFFF] mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#00D9FF]" />
          Security Settings
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-2">Max Failed Login Attempts</label>
            <input
              type="number"
              defaultValue="5"
              className="w-full bg-[#0F1419] border border-[#2A2E3E] rounded-lg px-4 py-3 text-[#FFFFFF] focus:outline-none focus:border-[#00D9FF]"
            />
            <p className="text-xs text-[#A0A0A0] mt-2">After this many attempts, account is locked</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              defaultValue="30"
              className="w-full bg-[#0F1419] border border-[#2A2E3E] rounded-lg px-4 py-3 text-[#FFFFFF] focus:outline-none focus:border-[#00D9FF]"
            />
            <p className="text-xs text-[#A0A0A0] mt-2">Automatic logout after inactivity</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-2">IP Whitelist</label>
            <textarea
              defaultValue="192.168.1.1&#10;10.0.0.0/8"
              className="w-full bg-[#0F1419] border border-[#2A2E3E] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#606060] focus:outline-none focus:border-[#00D9FF] h-24 font-mono text-sm"
              placeholder="Enter IPs (one per line)"
            />
            <p className="text-xs text-[#A0A0A0] mt-2">Only these IPs can access admin panel</p>
          </div>

          <button className="w-full mt-4 py-3 bg-[#00FF88] hover:bg-[#00E070] text-[#0F1419] font-bold rounded-lg transition-colors">
            Save Security Settings
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
