'use client';

import Link from 'next/link';
import { useState } from 'react';
import { VextaLogoText } from '@/components/vexta-logo';
import { TrendingUp, CheckCircle2, Users } from 'lucide-react';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to dashboard (backend will handle auth)
    window.location.href = '/dashboard';
  };

  if (showLogin) {
    return (
      <main className="min-h-screen bg-[#0F1419] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <VextaLogoText />
          </div>
          
          <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-8">
            <h1 className="text-2xl font-bold text-[#FFFFFF] mb-2">Welcome Back</h1>
            <p className="text-[#A0A0A0] text-sm mb-6">Sign in to your verified growth account</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#FFFFFF] mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0F1419] border border-[#2A2E3E] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#606060] focus:outline-none focus:border-[#00D9FF]"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#FFFFFF] mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0F1419] border border-[#2A2E3E] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#606060] focus:outline-none focus:border-[#00D9FF]"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#00FF88] hover:bg-[#00E070] text-[#0F1419] font-bold py-3 rounded-lg transition-colors"
              >
                Sign In
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-[#A0A0A0] text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-[#00D9FF] hover:text-[#00E8FF] font-medium">
                  Sign up
                </Link>
              </p>
            </div>
            
            <button
              onClick={() => setShowLogin(false)}
              className="w-full mt-4 text-[#00D9FF] hover:text-[#00E8FF] font-medium text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F1419]">
      {/* Navigation */}
      <nav className="border-b border-[#2A2E3E] bg-[#0F1419]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <VextaLogoText />
          <button
            onClick={() => setShowLogin(true)}
            className="px-6 py-2 bg-[#00FF88] hover:bg-[#00E070] text-[#0F1419] font-bold rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-[#FFFFFF] mb-6 leading-tight">
          Verified Growth Through Market Intelligence
        </h1>
        <p className="text-xl text-[#A0A0A0] mb-12 max-w-3xl mx-auto">
          Build verified wealth with our advanced investment platform. Real returns, transparent tracking, and community-powered growth.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/signup"
            className="px-8 py-4 bg-[#00FF88] hover:bg-[#00E070] text-[#0F1419] font-bold rounded-lg transition-colors"
          >
            Start Growing
          </Link>
          <button
            onClick={() => setShowLogin(true)}
            className="px-8 py-4 border-2 border-[#00D9FF] text-[#00D9FF] hover:bg-[#00D9FF]/10 font-bold rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>

        {/* Hero Image */}
        <div className="bg-gradient-to-b from-[#00D9FF]/20 to-transparent rounded-lg p-8 border border-[#2A2E3E] mb-20">
          <div className="bg-[#1A1F2E] rounded-lg h-96 flex items-center justify-center border border-[#2A2E3E]">
            <div className="text-center">
              <div className="text-6xl mb-4">📈</div>
              <p className="text-[#A0A0A0]">Your dashboard awaits</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-[#FFFFFF] mb-12 text-center">
          Why Choose VEXTA
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-8">
            <div className="text-4xl mb-4 flex justify-center">
              <CheckCircle2 className="text-[#00D9FF] w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-[#FFFFFF] mb-3 text-center">Verified Platform</h3>
            <p className="text-[#A0A0A0] text-center">
              Every transaction verified and transparent. Build trust through verified growth records.
            </p>
          </div>
          
          <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-8">
            <div className="text-4xl mb-4 flex justify-center">
              <TrendingUp className="text-[#00FF88] w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-[#FFFFFF] mb-3 text-center">Real Returns</h3>
            <p className="text-[#A0A0A0] text-center">
              Advanced investment algorithms and high-frequency trading strategies for consistent growth.
            </p>
          </div>
          
          <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-8">
            <div className="text-4xl mb-4 flex justify-center">
              <Users className="text-[#00D9FF] w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-[#FFFFFF] mb-3 text-center">Network Growth</h3>
            <p className="text-[#A0A0A0] text-center">
              Earn passive income through our powerful referral network. Grow together with your community.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6 text-center">
            <p className="text-4xl font-bold text-[#00FF88] mb-2">$2.4B</p>
            <p className="text-[#A0A0A0]">Total Value Managed</p>
          </div>
          <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6 text-center">
            <p className="text-4xl font-bold text-[#00D9FF] mb-2">50K+</p>
            <p className="text-[#A0A0A0]">Active Members</p>
          </div>
          <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6 text-center">
            <p className="text-4xl font-bold text-[#00FF88] mb-2">24.5%</p>
            <p className="text-[#A0A0A0]">Average Annual Returns</p>
          </div>
          <div className="bg-[#1A1F2E] border border-[#2A2E3E] rounded-lg p-6 text-center">
            <p className="text-4xl font-bold text-[#00D9FF] mb-2">99.9%</p>
            <p className="text-[#A0A0A0]">Uptime Guarantee</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-[#FFFFFF] mb-6">Ready to Start Your Journey?</h2>
        <p className="text-lg text-[#A0A0A0] mb-8 max-w-2xl mx-auto">
          Join thousands of investors building verified wealth on the VEXTA platform.
        </p>
        <Link
          href="/signup"
          className="inline-block px-10 py-4 bg-[#00FF88] hover:bg-[#00E070] text-[#0F1419] font-bold rounded-lg transition-colors text-lg"
        >
          Create Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2E3E] bg-[#0F1419] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-[#A0A0A0]">
          <p>&copy; 2024 VEXTA. All rights reserved. | Verified Growth Platform</p>
        </div>
      </footer>
    </main>
  );
}
