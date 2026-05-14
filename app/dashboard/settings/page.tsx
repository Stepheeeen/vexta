'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Bell, Lock, Eye, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    twoFactorAuth: true,
    publicProfile: false,
    marketAlerts: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">Settings</h1>
        <p className="text-[#A0A0A0]">Manage your account preferences and security</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-[#FFFFFF] mb-6">Profile Information</h3>
        
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF] mb-2">First Name</label>
              <input
                type="text"
                defaultValue="John"
                className="w-full bg-[#0F1419] border border-[#2A2E3E] rounded-lg px-4 py-3 text-[#FFFFFF] focus:outline-none focus:border-[#00D9FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF] mb-2">Last Name</label>
              <input
                type="text"
                defaultValue="Doe"
                className="w-full bg-[#0F1419] border border-[#2A2E3E] rounded-lg px-4 py-3 text-[#FFFFFF] focus:outline-none focus:border-[#00D9FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-2">Email</label>
            <input
              type="email"
              defaultValue="john@example.com"
              className="w-full bg-[#0F1419] border border-[#2A2E3E] rounded-lg px-4 py-3 text-[#FFFFFF] focus:outline-none focus:border-[#00D9FF]"
            />
          </div>

          <button className="w-full py-3 bg-[#00FF88] hover:bg-[#00E070] text-[#0F1419] font-bold rounded-lg transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-[#FFFFFF] mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#00D9FF]" />
          Security Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg border border-[#2A2E3E]">
            <div>
              <p className="text-[#FFFFFF] font-medium">Change Password</p>
              <p className="text-sm text-[#A0A0A0]">Update your password regularly</p>
            </div>
            <button className="px-4 py-2 text-[#00D9FF] hover:bg-[#00D9FF]/10 border border-[#00D9FF] rounded-lg font-medium transition-colors">
              Change
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg border border-[#2A2E3E]">
            <div>
              <p className="text-[#FFFFFF] font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-[#A0A0A0]">Add an extra layer of security</p>
            </div>
            <button
              onClick={() => handleToggle('twoFactorAuth')}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings.twoFactorAuth ? 'bg-[#00FF88]' : 'bg-[#2A2E3E]'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-[#0F1419] rounded-full transition-transform ${
                  settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg border border-[#2A2E3E]">
            <div>
              <p className="text-[#FFFFFF] font-medium">API Access</p>
              <p className="text-sm text-[#A0A0A0]">Manage API keys for trading bots</p>
            </div>
            <button className="px-4 py-2 text-[#00D9FF] hover:bg-[#00D9FF]/10 border border-[#00D9FF] rounded-lg font-medium transition-colors">
              Manage
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg border border-[#2A2E3E]">
            <div>
              <p className="text-[#FFFFFF] font-medium">Active Sessions</p>
              <p className="text-sm text-[#A0A0A0]">View and manage your active sessions</p>
            </div>
            <button className="px-4 py-2 text-[#00D9FF] hover:bg-[#00D9FF]/10 border border-[#00D9FF] rounded-lg font-medium transition-colors">
              View
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-[#FFFFFF] mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#00D9FF]" />
          Notifications
        </h3>

        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'marketAlerts', label: 'Market Alerts', desc: 'Get notified on price movements' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg border border-[#2A2E3E]">
              <div>
                <p className="text-[#FFFFFF] font-medium">{label}</p>
                <p className="text-sm text-[#A0A0A0]">{desc}</p>
              </div>
              <button
                onClick={() => handleToggle(key as keyof typeof settings)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  settings[key as keyof typeof settings] ? 'bg-[#00FF88]' : 'bg-[#2A2E3E]'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-[#0F1419] rounded-full transition-transform ${
                    settings[key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-[#FFFFFF] mb-6 flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#00D9FF]" />
          Privacy Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg border border-[#2A2E3E]">
            <div>
              <p className="text-[#FFFFFF] font-medium">Public Profile</p>
              <p className="text-sm text-[#A0A0A0]">Allow others to view your profile</p>
            </div>
            <button
              onClick={() => handleToggle('publicProfile')}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings.publicProfile ? 'bg-[#00FF88]' : 'bg-[#2A2E3E]'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-[#0F1419] rounded-full transition-transform ${
                  settings.publicProfile ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#2A0000] border border-red-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-red-500 mb-6 flex items-center gap-2">
          <LogOut className="w-5 h-5" />
          Danger Zone
        </h3>

        <div className="space-y-4">
          <button className="w-full py-3 px-4 border-2 border-red-500 text-red-500 hover:bg-red-500/10 font-bold rounded-lg transition-colors">
            Delete Account
          </button>
          <p className="text-xs text-red-400">
            This action cannot be undone. All your data will be permanently deleted.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
