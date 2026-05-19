'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import { useTranslation } from '@/components/translation-provider';

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      step: '01',
      src: '/illustrations/savings.svg',
      alt: 'Create account illustration',
      title: t('howItWorksStep1Title'),
      description: t('howItWorksStep1Desc'),
    },
    {
      step: '02',
      src: '/illustrations/wallet.svg',
      alt: 'Deposit and activate plan illustration',
      title: t('howItWorksStep2Title'),
      description: t('howItWorksStep2Desc'),
    },
    {
      step: '03',
      src: '/illustrations/analytics.svg',
      alt: 'Earn daily and referral bonuses illustration',
      title: t('howItWorksStep3Title'),
      description: t('howItWorksStep3Desc'),
    },
  ];
  return (
    <section id="how-it-works" className="py-24 bg-slate-50 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-3">{t('howItWorksSubtitle')}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{t('howItWorksTitle')}</h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            {t('howItWorksDescription')}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Dashed connector line */}
          <div className="hidden md:block absolute top-[80px] left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px border-t border-dashed border-violet-500/25" />

          {steps.map(({ step, src, alt, title, description }) => (
            <div key={step} className="relative flex flex-col items-center text-center group">
              {/* Illustration */}
              <div className="relative w-40 h-40 mb-6">
                <div className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-slate-50 border border-violet-500/40 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-violet-600">{step}</span>
                </div>
                <div className="w-full h-full rounded-2xl bg-white border border-slate-200 p-3 overflow-hidden shadow-sm shadow-slate-100 group-hover:border-violet-500/30 group-hover:bg-violet-500/5 transition-all duration-300">
                  <Image
                    src={src}
                    alt={alt}
                    width={148}
                    height={148}
                    className="w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    style={{ height: 'auto' }}
                  />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{description}</p>

              {step !== '03' && (
                <div className="md:hidden mt-6 text-slate-400">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
