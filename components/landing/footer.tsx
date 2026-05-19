'use client';

import Link from 'next/link';
import { VextaLogo } from '@/components/vexta-logo';

const footerLinks = {
  Platform: [
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Investment Plans', href: '#plans' },
    { label: 'Referral System', href: '#referral' },
    { label: 'Why Choose Us', href: '#why-us' },
  ],
  Account: [
    { label: 'Sign Up', href: '/signup' },
    { label: 'Log In', href: '/login' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Forgot Password', href: '/forgot-password' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Risk Disclosure', href: '#' },
    { label: 'AML Policy', href: '#' },
  ],
};

export function Footer() {
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
              A structured multi-level referral investment platform. Built for transparency and accountability.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Platform Operational</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-widest mb-4">{group}</h4>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-slate-600 hover:text-slate-950 transition-colors"
                    >
                      {label}
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
              <span className="font-semibold text-yellow-750">Risk Disclaimer: </span>
              This platform involves financial risk. Investment returns are not guaranteed. The value of investments may go down as well as up. <strong>Invest only what you can afford to lose.</strong> Past performance is not indicative of future results. This is not financial advice. Please consult a qualified financial advisor before making investment decisions.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Vexta. All rights reserved.</p>
            <p>Platform is not regulated by any financial authority. Trade at your own risk.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
