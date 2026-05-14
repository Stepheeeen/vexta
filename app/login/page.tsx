"use client"
import Link from 'next/link';
import { useState } from 'react';
import { VextaLogoText } from '@/components/vexta-logo';
import { BackgroundPattern } from '@/components/background-pattern';
import { ArrowRight, Lock, Mail, Fingerprint, Activity } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/dashboard';
  };

  return (
    <main className="min-h-screen bg-[#0F1419] flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundPattern />

      <div className="w-full max-w-md relative z-10 mt-12 mb-12">
        <div className="mb-8 text-center flex flex-col items-center">
          <Link href="/">
            <VextaLogoText />
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1F2E]/80 border border-[#00D9FF]/30 backdrop-blur-md">
            <Activity className="w-4 h-4 text-[#00D9FF] animate-pulse" />
            <span className="text-xs text-[#00D9FF] font-mono tracking-wider">SECURE CONNECTION</span>
          </div>
        </div>

        <div className="bg-[#1A1F2E]/80 backdrop-blur-xl border border-[#2A2E3E]/50 rounded-2xl p-8 shadow-2xl shadow-[#00D9FF]/5 relative overflow-hidden group">
          {/* Futuristic corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00D9FF] rounded-tl-2xl opacity-50" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00FF88] rounded-tr-2xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00D9FF] rounded-bl-2xl opacity-50" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00FF88] rounded-br-2xl opacity-50" />

          <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2 font-sans tracking-tight">
            Initialize <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#00FF88]">Session</span>
          </h1>
          <p className="text-[#A0A0A0] text-sm mb-8 font-mono">
            Authenticate to access your dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group/input">
              <label className="flex items-center gap-2 text-sm font-medium text-[#FFFFFF] mb-2 font-mono uppercase tracking-widest text-xs text-[#00D9FF]/80">
                <Mail className="w-4 h-4" />
                Wallet / Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#0F1419]/80 border border-[#2A2E3E] rounded-xl px-4 py-3.5 text-[#FFFFFF] placeholder-[#606060] focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF] transition-all duration-300 font-mono text-sm"
                  placeholder="0x... / you@example.com"
                  required
                />
                <div className="absolute inset-0 border border-[#00D9FF]/0 group-focus-within/input:border-[#00D9FF]/20 rounded-xl transition-all duration-300 pointer-events-none scale-105 group-focus-within/input:scale-100" />
              </div>
            </div>

            <div className="group/input">
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#FFFFFF] font-mono uppercase tracking-widest text-xs text-[#00FF88]/80">
                  <Lock className="w-4 h-4" />
                  Access Key
                </label>
                <Link href="/forgot-password" className="text-xs text-[#A0A0A0] hover:text-[#00D9FF] transition-colors font-mono">
                  Decrypt Key?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#0F1419]/80 border border-[#2A2E3E] rounded-xl px-4 py-3.5 text-[#FFFFFF] placeholder-[#606060] focus:outline-none focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88] transition-all duration-300 font-mono"
                  placeholder="••••••••••••"
                  required
                />
                <div className="absolute inset-0 border border-[#00FF88]/0 group-focus-within/input:border-[#00FF88]/20 rounded-xl transition-all duration-300 pointer-events-none scale-105 group-focus-within/input:scale-100" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 px-4 py-4 bg-gradient-to-r from-[#00D9FF] to-[#00FF88] hover:from-[#00D9FF]/90 hover:to-[#00FF88]/90 text-[#0F1419] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out" />
              <Fingerprint className="w-5 h-5 relative z-10" />
              <span className="relative z-10 font-mono tracking-widest">AUTHENTICATE</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-[#2A2E3E]/50">
            <p className="text-[#A0A0A0] text-sm font-mono">
              Unregistered entity?{' '}
              <Link href="/signup" className="text-[#00FF88] hover:text-[#00FF88]/80 font-bold tracking-wider underline decoration-[#00FF88]/30 underline-offset-4">
                Initialize Node
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
