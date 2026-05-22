import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { InvestmentPlans } from '@/components/landing/plans';
import { ReferralSystem } from '@/components/landing/referral';
import { WhyUs } from '@/components/landing/why-us';
import { Testimonials } from '@/components/landing/testimonials';
import { FAQ } from '@/components/landing/faq';
import { CTABanner } from '@/components/landing/cta-banner';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://vexta.app'),
  title: 'Vexta — 13-Level Referral Investment Platform',
  description:
    'Grow your capital with Vexta\'s structured 13-level referral investment system. Earn daily returns, build a referral network, and withdraw with transparency.',
  keywords: ['investment platform', 'MLM investment', 'referral system', 'passive income', 'daily returns', 'vexta'],
  openGraph: {
    title: 'Vexta — 13-Level Referral Investment Platform',
    description:
      'Earn daily returns and passive referral commissions on Vexta. 13-level referral depth, transparent dashboard, prompt withdrawals.',
    type: 'website',
    url: 'https://vexta.app',
    siteName: 'Vexta',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vexta Investment Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vexta — 13-Level Referral Investment Platform',
    description: 'Structured daily returns + 13-level referral commissions. Transparent, secure, and prompt withdrawals.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1419] text-slate-900 dark:text-white font-sans antialiased">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <InvestmentPlans />
        <ReferralSystem />
        <WhyUs />
        <Testimonials />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
