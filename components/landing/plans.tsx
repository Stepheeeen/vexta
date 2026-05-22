'use client';

import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

import { useTranslation } from '@/components/translation-provider';

export function InvestmentPlans() {
  const { t } = useTranslation();

  const plans = [
    {
      name: 'Plan A',
      tag: t('planAStarter'),
      minDeposit: '$10',
      dailyROI: '1.5%',
      duration: t('plansDuration30'),
      totalReturn: '45%',
      featured: false,
      color: 'border-slate-200/80 hover:border-violet-500/30 hover:shadow-lg hover:shadow-slate-100/50',
      badgeColor: 'bg-slate-100 text-slate-600',
      descriptionKey: 'planADesc',
    },
    {
      name: 'Plan B',
      tag: t('planBPopular'),
      minDeposit: '$500',
      dailyROI: '2.0%',
      duration: t('plansDuration45'),
      totalReturn: '90%',
      featured: true,
      color: 'border-violet-500/30 hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-500/5',
      badgeColor: 'bg-violet-100 text-violet-600',
      descriptionKey: 'planBDesc',
    },
    {
      name: 'Plan C',
      tag: t('planCAdvanced'),
      minDeposit: '$2,000',
      dailyROI: '2.5%',
      duration: t('plansDuration60'),
      totalReturn: '150%',
      featured: false,
      color: 'border-slate-200/80 hover:border-blue-500/30 hover:shadow-lg hover:shadow-slate-100/50',
      badgeColor: 'bg-blue-50 text-blue-600',
      descriptionKey: 'planCDesc',
    },
  ];
  return (
    <section id="plans" className="py-24 bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-3">{t('plansSubtitle')}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{t('plansTitle')}</h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            {t('plansDescription')}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border bg-white p-8 transition-all duration-300 group shadow-sm shadow-slate-100/50 ${plan.color} ${
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
                  <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{t(plan.descriptionKey)}</p>
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${plan.badgeColor}`}>
                  {plan.featured && <Star className="w-3 h-3" />}
                  {plan.tag}
                </span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('plansMinDeposit')}</span>
                  <span className="text-lg font-bold text-slate-800">{plan.minDeposit}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('plansDailyRoi')}</span>
                  <span className="text-lg font-bold text-slate-800">{plan.dailyROI}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('plansDuration')}</span>
                  <span className="text-lg font-bold text-slate-800">{plan.duration}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('plansTotalReturn')}</span>
                  <span className="text-lg font-bold text-slate-800">{plan.totalReturn}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-auto">
                <Link
                  href="/signup"
                  className={`group/btn w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.featured
                      ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/15'
                      : 'border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-350'
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
