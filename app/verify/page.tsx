"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { BackgroundPattern } from "@/components/background-pattern";

export default function VerifyPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (index + i < 6) newCode[index + i] = char;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.join('').length === 6) {
      // Simulate verification
      setIsVerified(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1419] flex flex-col items-center justify-center relative p-4">
      <BackgroundPattern />

      {/* Header/Logo */}
      <div className="absolute top-8 left-8 z-10 flex flex-col items-center gap-4 w-full md:w-auto md:left-1/2 md:-translate-x-1/2">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#00D9FF]">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-widest text-white font-sans">VEXTA</span>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-[#0A0F14]/60 backdrop-blur-3xl border border-white/5 rounded-2xl p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          
          {!isVerified ? (
            <>
              <h1 className="text-3xl font-light text-[#FFFFFF] mb-2 font-sans tracking-tight">
                Verify <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#00FF88]">Email</span>
              </h1>
              <p className="text-[#808A9D] text-sm mb-10 font-mono">
                Enter the 6-digit code we sent to your email address.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="flex justify-between gap-2 mb-8">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center bg-white/5 border border-white/10 rounded-xl text-xl text-[#FFFFFF] focus:outline-none focus:border-[#00D9FF]/50 focus:ring-1 focus:ring-[#00D9FF]/50 focus:bg-white/10 transition-all duration-300 font-mono"
                      required
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-4 bg-white text-black hover:bg-gray-100 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                >
                  <span className="relative z-10 font-mono tracking-widest text-sm uppercase">Verify Code</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-white/5">
                <p className="text-[#808A9D] text-[10px] font-mono uppercase tracking-widest">
                  Didn't receive a code?{' '}
                  <button className="text-white hover:text-[#00D9FF] font-semibold tracking-wider underline decoration-white/30 underline-offset-4 ml-1 transition-colors">
                    Resend Code
                  </button>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 mx-auto flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-[#00D9FF]" />
              </div>
              <h2 className="text-2xl font-light text-[#FFFFFF] mb-2 font-sans tracking-tight">
                Email <span className="font-semibold text-[#00D9FF]">Verified</span>
              </h2>
              <p className="text-[#808A9D] text-xs leading-relaxed font-mono mt-4 mb-8 uppercase tracking-wider">
                Your email has been successfully verified. Welcome to Vexta.
              </p>
              <Link href="/dashboard" className="w-full flex items-center justify-center px-4 py-3.5 bg-white text-black hover:bg-gray-100 font-semibold rounded-xl transition-all duration-300 group/btn">
                <span className="relative z-10 font-mono tracking-widest text-sm uppercase">Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-2 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
