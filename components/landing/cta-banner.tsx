'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { VextaLogo } from '@/components/vexta-logo';

export function CTABanner() {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />

      {/* Background orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl border border-violet-500/10 bg-gradient-to-br from-violet-50 via-white to-blue-50 p-12 lg:p-16 text-center backdrop-blur-sm shadow-xl shadow-slate-200/30">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 mb-8 shadow-lg shadow-violet-500/25">
            <VextaLogo className="w-10 h-10" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Ready to Start Growing?
          </h2>
          <p className="text-slate-600 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of investors building structured passive income through the Vexta referral investment network.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 rounded-xl transition-all hover:-translate-y-0.5 duration-200 shadow-md shadow-violet-500/10"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#plans"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl transition-all duration-200"
            >
              Explore Plans
            </a>
          </div>

          {/* Trust text */}
          <p className="mt-8 text-xs text-slate-400">
            No commitment required. Invest at your own pace.
          </p>
        </div>
      </div>
    </section>
  );
}
