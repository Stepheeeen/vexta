'use client';

import Link from 'next/link';
import { ArrowRight, Star, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';

export function InvestmentPlans() {
  const { t } = useTranslation();

  const plans = [
    {
      name: t('planAStarter'),
      tag: t('tagEntryLevel'),
      depositRange: t('depositRangeStarter'),
      featured: false,
      color: 'border-slate-200 hover:border-slate-300 bg-white dark:border-white/10 dark:bg-[#0A0F14]/40',
      badgeColor: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400',
      features: [
        'planAFeatures1',
        'planAFeatures2',
        'planAFeatures3',
        'planAFeatures4',
        'planAFeatures5',
      ],
      benefits: null,
      darkTheme: false,
    },
    {
      name: t('planBPopular'),
      tag: t('tagBestValue'),
      depositRange: t('depositRangePrime'),
      featured: true,
      color: 'border-violet-500/50 hover:border-violet-400 bg-slate-50 dark:border-violet-500/30 dark:bg-[#0A0F14]/80 shadow-xl shadow-violet-500/10',
      badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
      features: [
        'planBFeatures1',
        'planBFeatures2',
        'planBFeatures3',
        'planBFeatures4',
      ],
      benefits: {
        title: 'planBBenefitsTitle',
        deposit: 'planBBenefitsDeposit',
        bonus: 'planBBenefitsBonus',
        total: 'planBBenefitsTotal',
      },
      darkTheme: false,
    },
    {
      name: t('planCAdvanced'),
      tag: t('tagInstitutional'),
      depositRange: t('depositRangeUltra'),
      featured: false,
      color: 'border-slate-800 hover:border-slate-700 bg-slate-950 text-white dark:border-white/5 dark:bg-[#050505]',
      badgeColor: 'bg-slate-800 text-slate-300 dark:bg-white/5 dark:text-slate-400',
      features: [
        'planCFeatures1',
        'planCFeatures2',
        'planCFeatures3',
        'planCFeatures4',
      ],
      benefits: {
        title: 'planCBenefitsTitle',
        deposit: 'planCBenefitsDeposit',
        bonus: 'planCBenefitsBonus',
        total: 'planCBenefitsTotal',
      },
      darkTheme: true,
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
        <div className="grid lg:grid-cols-3 gap-8 justify-center max-w-6xl mx-auto items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 group w-full ${plan.color} ${
                plan.featured ? 'scale-[1.02] lg:scale-105 z-10' : ''
              }`}
            >
              {/* Featured glow */}
              {plan.featured && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />
              )}

              {/* Plan name + tag */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className={`text-2xl font-bold tracking-tight ${plan.darkTheme ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.name}</h3>
                  <p className={`text-sm mt-1 font-mono tracking-wider uppercase ${plan.darkTheme ? 'text-slate-400' : 'text-slate-500 dark:text-gray-400'}`}>{plan.depositRange}</p>
                </div>
                <span className={`flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${plan.badgeColor}`}>
                  {plan.featured && <Star className="w-3 h-3 fill-current" />}
                  {plan.tag}
                </span>
              </div>

              {/* Features List */}
              <div className="flex-grow">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((featureKey) => (
                    <li key={featureKey} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${plan.darkTheme ? 'text-slate-400' : (plan.featured ? 'text-violet-500' : 'text-slate-400')}`} />
                      <span className={`text-sm leading-relaxed ${plan.darkTheme ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        {t(featureKey as any)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Benefits / Example Section */}
                {plan.benefits && (
                  <div className={`mt-6 p-4 rounded-xl border ${plan.darkTheme ? 'bg-slate-900/50 border-white/10' : 'bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${plan.darkTheme ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {t(plan.benefits.title as any)}
                    </p>
                    <div className="space-y-2 text-sm font-medium">
                      <div className={`flex justify-between ${plan.darkTheme ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                        <span>{t(plan.benefits.deposit as any).split(':')[0]}:</span>
                        <span>{t(plan.benefits.deposit as any).split(':')[1]}</span>
                      </div>
                      <div className={`flex justify-between ${plan.featured ? 'text-violet-600 dark:text-violet-400' : (plan.darkTheme ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400')}`}>
                        <span>{t(plan.benefits.bonus as any).split(':')[0]}:</span>
                        <span>{t(plan.benefits.bonus as any).split(':')[1]}</span>
                      </div>
                      <div className={`pt-2 mt-2 border-t flex justify-between font-bold ${plan.darkTheme ? 'border-white/10 text-white' : 'border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'}`}>
                        <span>{t(plan.benefits.total as any).split(':')[0]}:</span>
                        <span>{t(plan.benefits.total as any).split(':')[1]}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="mt-8">
                <Link
                  href="/signup"
                  className={`group/btn w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.featured
                      ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/25'
                      : (plan.darkTheme
                          ? 'bg-white hover:bg-slate-200 text-slate-950 shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white shadow-sm'
                        )
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
