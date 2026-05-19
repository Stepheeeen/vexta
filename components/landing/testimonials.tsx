'use client';

import { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';

const withdrawals = [
  { name: 'Emeka J.', amount: '$320', timeStr: '2 mins ago' },
  { name: 'Fatima A.', amount: '$1,500', timeStr: '5 mins ago' },
  { name: 'Kevin M.', amount: '$780', timeStr: '11 mins ago' },
  { name: 'Nkechi B.', amount: '$230', timeStr: '18 mins ago' },
  { name: 'Olu S.', amount: '$2,100', timeStr: '24 mins ago' },
  { name: 'Amara D.', amount: '$645', timeStr: '31 mins ago' },
  { name: 'Chidi U.', amount: '$410', timeStr: '40 mins ago' },
  { name: 'Grace L.', amount: '$3,200', timeStr: '52 mins ago' },
];

import { useTranslation } from '@/components/translation-provider';

export function Testimonials() {
  const { t } = useTranslation();
  const tickerRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      nameKey: 'testi1Name',
      locPlanKey: 'testi1LocPlan',
      withdrawn: '$1,240',
      textKey: 'testi1Text',
      initials: 'MO',
      color: 'bg-violet-600',
    },
    {
      nameKey: 'testi2Name',
      locPlanKey: 'testi2LocPlan',
      withdrawn: '$430',
      textKey: 'testi2Text',
      initials: 'SK',
      color: 'bg-blue-600',
    },
    {
      nameKey: 'testi3Name',
      locPlanKey: 'testi3LocPlan',
      withdrawn: '$5,800',
      textKey: 'testi3Text',
      initials: 'DA',
      color: 'bg-indigo-600',
    },
  ];

  const getMinsAgo = (timeStr: string) => {
    const match = timeStr.match(/(\d+)/);
    if (!match) return timeStr;
    const mins = match[1];
    return t('timeMinsAgo').replace('{mins}', mins);
  };

  return (
    <section id="testimonials" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-3">{t('testimonialsSubtitle')}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{t('testimonialsTitle')}</h2>
          <p className="text-slate-650 text-lg max-w-xl mx-auto">
            {t('testimonialsDescription')}
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {testimonials.map(({ nameKey, locPlanKey, withdrawn, textKey, initials, color }) => (
            <div
              key={nameKey}
              className="flex flex-col p-6 rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-100 hover:border-slate-350 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-650 text-sm leading-relaxed mb-6 flex-grow">"{t(textKey)}"</p>

              {/* Footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{t(nameKey)}</div>
                  <div className="text-xs text-slate-400">{t(locPlanKey)}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-slate-400">{t('testimonialsWithdrawn')}</div>
                  <div className="text-sm font-bold text-green-600">{withdrawn}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live withdrawal ticker */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">{t('testimonialsRecentWith')}</span>
            <span className="text-xs text-slate-400">— {t('testimonialsLiveFeed')}</span>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200 py-4 shadow-sm shadow-slate-100">
            <div className="flex gap-6 animate-ticker whitespace-nowrap">
              {[...withdrawals, ...withdrawals].map(({ name, amount, timeStr }, i) => (
                <div
                  key={`${name}-${i}`}
                  className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 flex-shrink-0"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-slate-700 font-medium">{name}</span>
                  <span className="text-sm font-bold text-green-600">{amount}</span>
                  <span className="text-xs text-slate-400">{getMinsAgo(timeStr)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
