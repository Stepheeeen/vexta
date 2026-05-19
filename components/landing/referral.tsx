'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';

const levels = [
  { level: 1, commission: '10%', label: 'Direct Referrals', description: 'People you personally invite', width: 'w-full', color: 'bg-violet-500', textColor: 'text-violet-600' },
  { level: 2, commission: '5%', label: 'Your Referrals\' Network', description: 'Investors your referrals bring in', width: 'w-5/6', color: 'bg-violet-400', textColor: 'text-violet-500' },
  { level: 3, commission: '3%', label: 'Third Generation', description: 'Three degrees from your network', width: 'w-4/6', color: 'bg-blue-500', textColor: 'text-blue-600' },
  { level: 4, commission: '2%', label: 'Fourth Generation', description: 'Four degrees from your network', width: 'w-3/6', color: 'bg-blue-400', textColor: 'text-blue-500' },
  { level: 5, commission: '1%', label: 'Fifth Generation', description: 'Five degrees from your network', width: 'w-2/6', color: 'bg-indigo-400', textColor: 'text-indigo-600' },
];

export function ReferralSystem() {
  return (
    <section id="referral" className="py-24 bg-slate-50 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-3">Passive Income</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Earn Across{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
                5 Referral Levels
              </span>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Every investor you bring to the platform generates commission not just from their investment, but from the entire network they help build — up to 5 levels deep.
            </p>

            <div className="space-y-3 mb-10">
              {[
                'Commissions credited automatically to your account',
                'No cap on referral earnings',
                'Track your network activity in real-time',
                'Withdraw referral income independently of your plans',
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                  </div>
                  <span className="text-slate-600 text-sm">{point}</span>
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 rounded-xl transition-all shadow-md shadow-violet-500/10 group"
            >
              <Users className="w-4 h-4" />
              Start Building Your Network
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right: Visual */}
          <div className="bg-white border border-slate-200 shadow-sm shadow-slate-100/50 rounded-2xl p-8">
            {/* Network illustration */}
            <div className="mb-6 rounded-xl bg-slate-50 border border-slate-100 p-4 h-48 flex items-center justify-center overflow-hidden">
              <Image
                src="/illustrations/analytics.svg"
                alt="Network referral analytics illustration"
                width={320}
                height={180}
                className="w-full object-contain"
                style={{ height: 'auto' }}
              />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">Commission Breakdown</h3>
            <div className="space-y-4">
              {levels.map(({ level, commission, label, description, width, color, textColor }) => (
                <div key={level} className="group/row">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-12">LVL {level}</span>
                      <div>
                        <span className="text-sm font-medium text-slate-800 block">{label}</span>
                        <span className="text-xs text-slate-400">{description}</span>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${textColor}`}>{commission}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} ${width} rounded-full transition-all duration-500 group-hover/row:opacity-100 opacity-70`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">Total possible commission</span>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">21%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
