import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/navbar';
import { HftHero } from '@/components/landing/hft-hero';
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
  title: 'Vexta — AI-Powered High-Frequency Arbitrage (HFT) Platform',
  description:
    'Vexta is a financial infrastructure specialised in AI-driven high-frequency arbitrage (HFT). Earn daily returns, build a 13-level referral network, and withdraw with full transparency.',
  keywords: [
    'HFT arbitrage', 'AI trading', 'investment platform', 'high-frequency trading',
    'referral system', 'passive income', 'daily returns', 'vexta', 'financial AI',
  ],
  openGraph: {
    title: 'Vexta — AI-Powered High-Frequency Arbitrage',
    description:
      'Earn daily returns through AI-driven HFT arbitrage and passive referral commissions. 13-level referral depth, transparent dashboard, prompt withdrawals.',
    type: 'website',
    url: 'https://vexta.app',
    siteName: 'Vexta',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Vexta HFT Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vexta — AI-Powered HFT Platform',
    description: 'AI-driven arbitrage + 13-level referral commissions. Transparent, secure, instant.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen text-slate-900 dark:text-white font-sans antialiased">
      <Navbar />
      <main>
        {/* ── 1. HFT / AI Hero (from HTML reference — dark, full viewport) ── */}
        <HftHero />

        {/* ── 2. Light-mode sections scroll in below ───────────────────── */}
        <div className="bg-white dark:bg-[#0F1419]">
          <Hero />
          <HowItWorks />
          <InvestmentPlans />
          <ReferralSystem />
          <WhyUs />
          <Testimonials />
          <FAQ />
          <CTABanner />
        </div>
      </main>
      <Footer />
    </div>
  );
}
