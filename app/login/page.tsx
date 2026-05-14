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
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 1) {
      setError('Password is required.');
      return;
    }
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

        <div className="bg-[#0A0F14]/60 backdrop-blur-3xl border border-white/5 rounded-2xl p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          <h1 className="text-3xl font-light text-[#FFFFFF] mb-2 font-sans tracking-tight">
            Welcome <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#00FF88]">Back</span>
          </h1>
          <p className="text-[#808A9D] text-sm mb-8 font-mono">
            Sign in to access your account
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group/input">
              <label className="flex items-center gap-2 text-sm font-medium text-[#FFFFFF] mb-2 font-mono uppercase tracking-widest text-[10px] text-white/50">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3.5 text-[#FFFFFF] placeholder-white/20 focus:outline-none focus:border-[#00D9FF]/50 focus:ring-1 focus:ring-[#00D9FF]/50 focus:bg-white/10 transition-all duration-300 font-mono text-sm"
                  placeholder="0x... / you@example.com"
                  required
                />
              </div>
            </div>

            <div className="group/input">
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#FFFFFF] font-mono uppercase tracking-widest text-[10px] text-white/50">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[10px] text-white/40 hover:text-[#00D9FF] transition-colors font-mono uppercase tracking-wider">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3.5 text-[#FFFFFF] placeholder-white/20 focus:outline-none focus:border-[#00FF88]/50 focus:ring-1 focus:ring-[#00FF88]/50 focus:bg-white/10 transition-all duration-300 font-mono"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 px-4 py-4 bg-white text-black hover:bg-gray-100 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden"
            >
              <span className="relative z-10 font-mono tracking-widest text-sm uppercase">Sign In</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-[#808A9D] text-xs font-mono uppercase tracking-widest">
              Don't have an account?{' '}
              <Link href="/signup" className="text-white hover:text-white/80 font-semibold tracking-wider underline decoration-white/30 underline-offset-4">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
