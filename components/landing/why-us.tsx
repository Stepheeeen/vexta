'use client';

import Image from 'next/image';

const features = [
  {
    src: '/illustrations/wallet.svg',
    alt: 'Instant withdrawals',
    title: 'Instant Withdrawals',
    description: 'Withdrawal requests are processed promptly. Access your earnings without unnecessary delays or hold periods.',
    accent: 'group-hover:border-yellow-500/30 group-hover:bg-yellow-50/50 hover:shadow-md hover:shadow-slate-100',
  },
  {
    src: '/illustrations/dashboard.svg',
    alt: 'Transparent earnings dashboard',
    title: 'Transparent Earnings',
    description: 'Your dashboard provides a real-time, itemised view of daily returns, referral commissions, and withdrawal history.',
    accent: 'group-hover:border-violet-500/30 group-hover:bg-violet-50/50 hover:shadow-md hover:shadow-slate-100',
  },
  {
    src: '/illustrations/security.svg',
    alt: 'Secure platform',
    title: 'Secure Platform',
    description: 'All accounts are protected with SSL encryption, manual KYC verification, and two-factor authentication.',
    accent: 'group-hover:border-green-500/30 group-hover:bg-green-50/50 hover:shadow-md hover:shadow-slate-100',
  },
  {
    src: '/illustrations/referral.svg',
    alt: '24/7 support',
    title: '24/7 Support',
    description: 'Our dedicated support team is available around the clock to assist with account queries and technical issues.',
    accent: 'group-hover:border-blue-500/30 group-hover:bg-blue-50/50 hover:shadow-md hover:shadow-slate-100',
  },
];

export function WhyUs() {
  return (
    <section id="why-us" className="py-24 bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-3">Our Advantages</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Why Choose Vexta</h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            We built Vexta on the principles of transparency, security, and investor-first design.
          </p>
        </div>

        {/* Feature grid — 1 col mobile, 2 col large */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map(({ src, alt, title, description, accent }) => (
            <div
              key={title}
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
              <h3 className="text-base font-semibold text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
