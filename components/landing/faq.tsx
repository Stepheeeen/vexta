'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What is the minimum deposit amount?',
    a: 'The minimum deposit varies by plan. Plan A starts at $100, Plan B at $500, and Plan C at $2,000. You can deposit in supported cryptocurrencies or local payment methods where available.',
  },
  {
    q: 'How are withdrawals processed?',
    a: 'Withdrawal requests are reviewed and processed within 24 hours on business days. Funds are sent directly to your registered wallet or account. There is no minimum withdrawal threshold once your plan has matured.',
  },
  {
    q: 'Are there any fees on deposits or withdrawals?',
    a: 'Vexta does not charge platform fees on deposits. A small network fee may apply on cryptocurrency withdrawals depending on the blockchain used. This fee is disclosed at the time of withdrawal.',
  },
  {
    q: 'When and how are referral commissions paid out?',
    a: 'Referral commissions are credited to your account automatically each time someone in your network completes a qualifying deposit. Commissions can be withdrawn independently of your investment plans at any time.',
  },
  {
    q: 'What are the risks of investing on this platform?',
    a: 'All investments carry risk, and past performance does not guarantee future results. Returns are projected based on plan structure and are not guaranteed. You should only invest capital you can afford to lose. We recommend reading our full risk disclosure before proceeding.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-3">Common Questions</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-600 text-lg">
            Everything you need to know before getting started.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all duration-300 ${
                open === i ? 'bg-violet-50/20 border-violet-500/30 shadow-sm shadow-slate-100/50' : 'bg-white border border-slate-200 hover:border-slate-350 shadow-sm shadow-slate-100/50'
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
                <p className="px-6 pb-5 text-sm text-slate-550 leading-relaxed">{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
