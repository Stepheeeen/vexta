'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { useTranslation } from '@/components/translation-provider';

export function FAQ() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
    { q: t('faqQ4'), a: t('faqA4') },
    { q: t('faqQ5'), a: t('faqA5') },
  ];

  return (
    <section id="faq" className="py-24 bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-3">{t('faqSubtitle')}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{t('faqTitle')}</h2>
          <p className="text-slate-600 text-lg">
            {t('faqDescription')}
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all duration-300 ${
                open === i ? 'bg-violet-50/20 border-violet-500/30 shadow-sm shadow-slate-100/50' : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm shadow-slate-100/50'
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className={`font-medium text-sm sm:text-base transition-colors ${open === i ? 'text-violet-750 font-semibold' : 'text-slate-700'}`}>
                  {q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 text-slate-400 transition-transform duration-300 ${open === i ? 'rotate-180 text-violet-600' : ''}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
