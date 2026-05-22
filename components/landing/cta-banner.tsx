'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { VextaLogo } from '@/components/vexta-logo';
import { useTranslation } from '@/components/translation-provider';
import { BackgroundPattern } from '@/components/background-pattern';

export function CTABanner() {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-slate-50 dark:bg-[#090C10] relative overflow-hidden transition-colors duration-250">
      <BackgroundPattern />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 dark:via-white/5 to-transparent pointer-events-none" />

      {/* Background orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-violet-600/5 dark:bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl border border-violet-500/10 dark:border-violet-500/25 bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-[#0F141C]/85 dark:via-[#1e1b4b]/20 dark:to-[#0F141C]/85 p-12 lg:p-16 text-center backdrop-blur-md shadow-xl shadow-slate-200/30 dark:shadow-none">
          {/* Icon */}
          <div className="inline-flex items-center justify-center mb-8">
            <VextaLogo className="w-16 h-16" variant="transparent" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            {t('ctaSubtitle')}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            {t('ctaDescription')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all hover:-translate-y-0.5 duration-200 shadow-md shadow-violet-600/15"
            >
              {t('ctaBtnCreate')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#plans"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all duration-200"
            >
              {t('ctaBtnExplore')}
            </a>
          </div>

          {/* Trust text */}
          <p className="mt-8 text-xs text-slate-400 dark:text-slate-500">
            {t('ctaTrustText')}
          </p>
        </div>
      </div>
    </section>
  );
}

