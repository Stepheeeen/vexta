'use client';

import Link from 'next/link';
import { VextaLogo } from '@/components/vexta-logo';
import { useTranslation } from '@/components/translation-provider';

export function Footer() {
  const { t } = useTranslation();

  const footerLinks = [
    {
      groupKey: 'footerLinkPlatform',
      links: [
        { labelKey: 'navHowItWorks', href: '#how-it-works' },
        { labelKey: 'navPlans', href: '#plans' },
        { labelKey: 'footerLinkRefSystem', href: '#referral' },
        { labelKey: 'footerLinkWhyUs', href: '#why-us' },
      ],
    },
    {
      groupKey: 'footerLinkAccount',
      links: [
        { labelKey: 'footerLinkSignUp', href: '/signup' },
        { labelKey: 'navLogIn', href: '/login' },
        { labelKey: 'footerLinkDashboard', href: '/dashboard' },
        { labelKey: 'footerLinkForgotPw', href: '/forgot-password' },
      ],
    },
    {
      groupKey: 'footerLinkLegal',
      links: [
        { labelKey: 'footerLinkTerms', href: '#' },
        { labelKey: 'footerLinkPrivacy', href: '#' },
        { labelKey: 'footerLinkRisk', href: '#' },
        { labelKey: 'footerLinkAml', href: '#' },
      ],
    },
  ];
  return (
    <footer className="bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <VextaLogo className="h-8 w-8 transition-transform duration-300 group-hover:scale-105" />
              <span className="text-xl font-bold text-slate-900 tracking-tight">vexta</span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {t('footerBrandDesc')}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{t('footerStatus')}</span>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map(({ groupKey, links }) => (
            <div key={groupKey}>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-4">{t(groupKey)}</h4>
              <ul className="space-y-3">
                {links.map(({ labelKey, href }) => (
                  <li key={labelKey}>
                    <Link
                      href={href}
                      className="text-sm text-slate-600 hover:text-slate-950 transition-colors"
                    >
                      {t(labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="border-t border-slate-200/80 pt-8">
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
            <p className="text-xs text-yellow-800 leading-relaxed">
              <span className="font-semibold text-yellow-750">{t('footerRiskDisclaimerTitle')} </span>
              {t('footerRiskDisclaimerText')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Vexta. {t('footerRightsReserved')}</p>
            <p>{t('footerNotRegulated')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
