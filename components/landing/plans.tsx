'use client';

import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

const plans = [
  {
    name: 'Plan A',
    tag: 'Starter',
    minDeposit: '$100',
    dailyROI: '1.5%',
    duration: '30 days',
    totalReturn: '45%',
    featured: false,
    color: 'border-slate-200/80 hover:border-violet-500/30 hover:shadow-lg hover:shadow-slate-100/50',
    badgeColor: 'bg-slate-100 text-slate-600',
    description: 'Ideal for new investors exploring structured returns.',
  },
  {
    name: 'Plan B',
    tag: 'Popular',
    minDeposit: '$500',
    dailyROI: '2.0%',
    duration: '45 days',
    totalReturn: '90%',
    featured: true,
    color: 'border-violet-500/30 hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-500/5',
    badgeColor: 'bg-violet-100 text-violet-600',
    description: 'Balanced risk-return profile suited for intermediate investors.',
  },
  {
    name: 'Plan C',
    tag: 'Advanced',
    minDeposit: '$2,000',
    dailyROI: '2.5%',
    duration: '60 days',
    totalReturn: '150%',
    featured: false,
    color: 'border-slate-200/80 hover:border-blue-500/30 hover:shadow-lg hover:shadow-slate-100/50',
    badgeColor: 'bg-blue-50 text-blue-600',
    description: 'Higher capital deployment for experienced investors.',
  },
];

const stat = (label: string, value: string) => (
  <div key={label} className="flex flex-col">
    <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</span>
    <span className="text-lg font-bold text-slate-800">{value}</span>
  </div>
);

export function InvestmentPlans() {
  return (
    <section id="plans" className="py-24 bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-3">Investment Options</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Choose Your Plan</h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            Three structured tiers to match your capital and risk appetite. All plans include referral commission eligibility.
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
                  <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${plan.badgeColor}`}>
                  {plan.featured && <Star className="w-3 h-3" />}
                  {plan.tag}
                </span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                {stat('Min. Deposit', plan.minDeposit)}
                {stat('Daily ROI', plan.dailyROI)}
                {stat('Duration', plan.duration)}
                {stat('Total Return', plan.totalReturn)}
              </div>

              {/* CTA */}
              <div className="mt-auto">
                <Link
                  href="/signup"
                  className={`group/btn w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.featured
                      ? 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-md shadow-violet-500/10'
                      : 'border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-350'
                  }`}
                >
                  Invest Now
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 max-w-lg mx-auto">
          * Returns are projections based on plan structure, not guarantees. All investments carry risk. See disclaimer below.
        </p>
      </div>
    </section>
  );
}
