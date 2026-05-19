'use client';

import Image from 'next/image';

import { useTranslation } from '@/components/translation-provider';

export function WhyUs() {
  const { t } = useTranslation();

  const features = [
    {
      src: '/illustrations/wallet.svg',
      alt: 'Instant withdrawals',
      titleKey: 'whyUsFeat1Title',
      descKey: 'whyUsFeat1Desc',
      accent: 'group-hover:border-yellow-500/30 group-hover:bg-yellow-50/50 hover:shadow-md hover:shadow-slate-100',
    },
    {
      src: '/illustrations/dashboard.svg',
      alt: 'Transparent earnings dashboard',
      titleKey: 'whyUsFeat2Title',
      descKey: 'whyUsFeat2Desc',
      accent: 'group-hover:border-violet-500/30 group-hover:bg-violet-50/50 hover:shadow-md hover:shadow-slate-100',
    },
    {
      src: '/illustrations/security.svg',
      alt: 'Secure platform',
      titleKey: 'whyUsFeat3Title',
      descKey: 'whyUsFeat3Desc',
      accent: 'group-hover:border-green-500/30 group-hover:bg-green-50/50 hover:shadow-md hover:shadow-slate-100',
    },
    {
      src: '/illustrations/referral.svg',
      alt: '24/7 support',
      titleKey: 'whyUsFeat4Title',
      descKey: 'whyUsFeat4Desc',
      accent: 'group-hover:border-blue-500/30 group-hover:bg-blue-50/50 hover:shadow-md hover:shadow-slate-100',
    },
  ];
  return (
    <section id="why-us" className="py-24 bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-3">{t('whyUsSubtitle')}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{t('whyUsTitle')}</h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            {t('whyUsDescription')}
          </p>
        </div>

        {/* Feature grid — 1 col mobile, 2 col large */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map(({ src, alt, titleKey, descKey, accent }) => (
            <div
              key={titleKey}
              className={`group flex flex-col p-7 rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-100/50 transition-all duration-300 hover:-translate-y-0.5 min-h-[260px] ${accent}`}
            >
              {/* Illustration — top left */}
              <div className="w-20 h-20 mb-5 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-2.5 self-start border border-slate-100">
                <Image
                  src={src}
                  alt={alt}
                  width={72}
                  height={72}
                  className="w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  style={{ height: 'auto' }}
                />
              </div>

              {/* Text */}
              <h3 className="text-base font-semibold text-slate-800 mb-2">{t(titleKey)}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
