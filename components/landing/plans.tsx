'use client';

import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

import { useTranslation } from '@/components/translation-provider';

export function InvestmentPlans() {
  const { t } = useTranslation();

  const plans = [
    {
      name: 'STARTER PLAN',
      tag: 'STARTER PLAN',
      minDeposit: '$10',
      dailyROI: '1.0%',
      totalReturn: '300%',
      featured: false,
      color: 'border-slate-200/60 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 dark:border-white/5 dark:bg-[#0A0F14]/40',
      badgeColor: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
      descriptionKey: 'planADesc',
    },
    {
      name: 'PRIME PLAN',
      tag: 'PRIME PLAN',
      minDeposit: '$1,000',
      dailyROI: '1.0%',
      totalReturn: '300%',
      featured: true,
      color: 'border-violet-500/30 hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-500/5 dark:border-violet-550/20 dark:bg-[#0A0F14]/60',
      badgeColor: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
      descriptionKey: 'planBDesc',
    },
    {
      name: 'ULTRA PLAN',
      tag: 'ULTRA PLAN',
      minDeposit: '$3,000',
      dailyROI: '1.0%',
      totalReturn: '300%',
      featured: false,
      color: 'border-slate-200/60 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 dark:border-white/5 dark:bg-[#0A0F14]/40',
      badgeColor: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400',
      descriptionKey: 'planCDesc',
    },
  ];
  return (
    <section id="plans" className="py-24 bg-white dark:bg-[#09090f] relative transition-colors duration-250">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent dark:via-white/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">{t('plansSubtitle')}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">{t('plansTitle')}</h2>
          <p className="text-slate-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
            {t('plansDescription')}
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 justify-center max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 group shadow-sm w-full ${plan.color} ${
                plan.featured ? 'scale-[1.02] md:scale-105' : ''
              }`}
            >
              {/* Featured glow */}
              {plan.featured && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />
              )}

              {/* Plan name + tag */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{t(plan.descriptionKey)}</p>
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${plan.badgeColor}`}>
                  {plan.featured && <Star className="w-3 h-3" />}
                  {plan.tag}
                </span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2 mb-8 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 text-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-1">{t('plansMinDeposit')}</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{plan.minDeposit}</span>
                </div>
                <div className="flex flex-col border-x border-slate-200 dark:border-white/10">
                  <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-1">{t('plansDailyRoi')}</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{plan.dailyROI}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-1">{t('plansTotalReturn')}</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{plan.totalReturn}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-auto">
                <Link
                  href="/signup"
                  className={`group/btn w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.featured
                      ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/15'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white shadow-sm'
                  }`}
                >
                  {t('plansInvestNow')}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 max-w-lg mx-auto">
          {t('plansDisclaimer')}
        </p>
      </div>
    </section>
  );
}
