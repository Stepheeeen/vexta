'use client';

import Link from 'next/link';
import { useState } from 'react';
import { VextaLogoText } from '@/components/vexta-logo';
import { BackgroundPattern } from '@/components/background-pattern';
import { ArrowRight, UserPlus, Shield, Activity, Share2, Hexagon } from 'lucide-react';

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    acceptTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <main className="min-h-screen bg-[#0F1419] flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundPattern />
      
      <div className="w-full max-w-md relative z-10 mt-12 mb-12">
        <div className="mb-8 text-center flex flex-col items-center">
          <Link href="/">
            <VextaLogoText />
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1F2E]/80 border border-[#00FF88]/30 backdrop-blur-md">
            <Activity className="w-4 h-4 text-[#00FF88] animate-pulse" />
            <span className="text-xs text-[#00FF88] font-mono tracking-wider">NODE INITIALIZATION</span>
          </div>
        </div>

        <div className="bg-[#1A1F2E]/80 backdrop-blur-xl border border-[#2A2E3E]/50 rounded-2xl p-8 shadow-2xl shadow-[#00FF88]/5 relative overflow-hidden group">
          {/* Futuristic corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00D9FF] rounded-tl-2xl opacity-50" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00FF88] rounded-tr-2xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00D9FF] rounded-bl-2xl opacity-50" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00FF88] rounded-br-2xl opacity-50" />

          {/* Progress */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 mx-1 rounded-full transition-all duration-500 ${
                  s < step 
                    ? 'bg-[#00D9FF] shadow-[0_0_10px_rgba(0,217,255,0.5)]' 
                    : s === step 
                      ? 'bg-gradient-to-r from-[#00D9FF] to-[#00FF88] shadow-[0_0_10px_rgba(0,255,136,0.5)]' 
                      : 'bg-[#2A2E3E]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 mb-2">
            {step === 1 && <UserPlus className="w-6 h-6 text-[#00D9FF]" />}
            {step === 2 && <Shield className="w-6 h-6 text-[#00D9FF]" />}
            {step === 3 && <Share2 className="w-6 h-6 text-[#00FF88]" />}
            <h1 className="text-2xl font-bold text-[#FFFFFF] font-sans tracking-tight">
              {step === 1 && 'Deploy Profile'}
              {step === 2 && 'Generate Keys'}
              {step === 3 && 'Network Links'}
            </h1>
          </div>
          <p className="text-[#A0A0A0] text-xs mb-8 font-mono tracking-widest uppercase">
            {step === 1 && 'Phase 1: Basic Identity'}
            {step === 2 && 'Phase 2: Security Credentials'}
            {step === 3 && 'Phase 3: Referral Network'}
          </p>

          <div className="min-h-[280px]">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="group/input">
                    <label className="block text-xs font-mono text-[#00D9FF]/80 uppercase tracking-widest mb-2">Given Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full bg-[#0F1419]/80 border border-[#2A2E3E] rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#606060] focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF] transition-all font-mono text-sm"
                      placeholder="Satoshi"
                    />
                  </div>
                  <div className="group/input">
                    <label className="block text-xs font-mono text-[#00D9FF]/80 uppercase tracking-widest mb-2">Family Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-[#0F1419]/80 border border-[#2A2E3E] rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#606060] focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF] transition-all font-mono text-sm"
                      placeholder="Nakamoto"
                    />
                  </div>
                </div>

                <div className="group/input">
                  <label className="block text-xs font-mono text-[#00D9FF]/80 uppercase tracking-widest mb-2">Comms Relay (Email)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#0F1419]/80 border border-[#2A2E3E] rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#606060] focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF] transition-all font-mono text-sm"
                    placeholder="node@network.com"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="group/input">
                  <label className="block text-xs font-mono text-[#00FF88]/80 uppercase tracking-widest mb-2">Access Key (Password)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#0F1419]/80 border border-[#2A2E3E] rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#606060] focus:outline-none focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88] transition-all font-mono"
                    placeholder="••••••••••••"
                  />
                  <p className="text-[10px] text-[#A0A0A0] mt-2 font-mono uppercase tracking-wider">
                    Min. 8 chars / Numbers / Symbols required
                  </p>
                </div>

                <div className="group/input">
                  <label className="block text-xs font-mono text-[#00FF88]/80 uppercase tracking-widest mb-2">Verify Access Key</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-[#0F1419]/80 border border-[#2A2E3E] rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#606060] focus:outline-none focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88] transition-all font-mono"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Referral */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="group/input">
                  <label className="block text-xs font-mono text-[#00D9FF]/80 uppercase tracking-widest mb-2">Invite Code (Optional)</label>
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleChange}
                    className="w-full bg-[#0F1419]/80 border border-[#2A2E3E] rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#606060] focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF] transition-all font-mono text-sm"
                    placeholder="VEXTA_REF_12345"
                  />
                </div>

                <div className="bg-[#0F1419]/80 border border-[#00D9FF]/30 rounded-xl p-5 relative overflow-hidden">
                  <Hexagon className="absolute -right-4 -bottom-4 w-24 h-24 text-[#00D9FF]/10" />
                  <p className="text-[10px] text-[#00D9FF] font-mono tracking-widest uppercase mb-2">Generated Node ID</p>
                  <p className="text-xl font-bold text-[#FFFFFF] font-mono tracking-wider">VXT_N8K2L9</p>
                  <p className="text-[10px] text-[#A0A0A0] mt-2 font-mono uppercase">Distribute to earn network rewards</p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group mt-4">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-md border-2 border-[#2A2E3E] appearance-none checked:bg-[#00FF88] checked:border-[#00FF88] transition-all cursor-pointer peer"
                    />
                    <div className="absolute text-[#0F1419] pointer-events-none opacity-0 peer-checked:opacity-100">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-xs text-[#A0A0A0] font-mono leading-relaxed">
                    I acknowledge the <span className="text-[#00D9FF]">Smart Contract Terms</span> and assume all risks associated with decentralized participation.
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-[#2A2E3E]/50">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 px-4 py-3.5 border-2 border-[#2A2E3E] text-[#A0A0A0] hover:text-[#FFFFFF] hover:border-[#FFFFFF]/30 font-mono text-sm tracking-widest rounded-xl transition-all"
              >
                BACK
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex-[2] px-4 py-3.5 bg-gradient-to-r ${
                step === 3 
                  ? 'from-[#00FF88] to-[#00D9FF] hover:from-[#00FF88]/90 hover:to-[#00D9FF]/90 text-[#0F1419]' 
                  : 'from-[#00D9FF] to-[#00FF88] hover:from-[#00D9FF]/90 hover:to-[#00FF88]/90 text-[#0F1419]'
              } font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out" />
              <span className="relative z-10 font-mono tracking-widest text-sm">
                {step === 3 ? 'DEPLOY NODE' : 'PROCEED'}
              </span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[#A0A0A0] text-xs font-mono">
              Active node?{' '}
              <Link href="/login" className="text-[#00D9FF] hover:text-[#00D9FF]/80 font-bold tracking-wider underline decoration-[#00D9FF]/30 underline-offset-4">
                Initialize Session
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

