'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VextaLogo } from '@/components/vexta-logo';
import {
  LayoutGrid,
  TrendingUp,
  Users,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: LayoutGrid, label: 'Overview', exact: true },
    { href: '/dashboard/portfolio', icon: TrendingUp, label: 'Portfolio' },
    { href: '/dashboard/arbitrage', icon: BarChart3, label: 'Arbitrage' },
    { href: '/dashboard/referrals', icon: Users, label: 'Referrals' },
    { href: '/dashboard/earnings', icon: Wallet, label: 'Earnings' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#0F1419] flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen bg-[#1A1F2E] border-r border-[#2A2E3E] flex flex-col transition-transform z-50 md:z-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-[#2A2E3E]">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <VextaLogo className="h-8 w-8" />
            <span className="font-bold text-[#FFFFFF]">VEXTA</span>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30'
                    : 'text-[#A0A0A0] hover:bg-[#2A2E3E]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#2A2E3E] p-6">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-[#A0A0A0] hover:text-[#FFFFFF] hover:bg-[#2A2E3E] rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#1A1F2E] border-b border-[#2A2E3E] px-6 py-4 flex items-center justify-between">
          <button
            className="md:hidden text-[#FFFFFF]"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex-1 mx-4 md:mx-0 text-center md:text-left">
            <h2 className="text-[#FFFFFF] font-bold">Dashboard</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#00D9FF]/20 border border-[#00D9FF] flex items-center justify-center text-[#00D9FF] font-bold">
              JD
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
