'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, TrendingUp, Users, Wallet, BarChart3, Settings, LogOut, Bell, X, Check, Globe, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import { BackgroundPattern } from '@/components/background-pattern';
import { VextaLogo } from '@/components/vexta-logo';
import { useTranslation } from '@/components/translation-provider';
import { useState, useEffect, useRef } from 'react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'alert';
}

function isActive(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href;
  return pathname.startsWith(href) && href !== '/dashboard';
}

const flags = {
  en: '🇺🇸',
  es: '🇪🇸',
  vi: '🇻🇳',
  th: '🇹🇭',
  pt: '🇵🇹',
  ko: '🇰🇷',
  fr: '🇫🇷'
};

const langNames = {
  en: 'English',
  es: 'Español',
  vi: 'Tiếng Việt',
  th: 'ภาษาไทย',
  pt: 'Português',
  ko: '한국어',
  fr: 'Français'
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();
  const [showNotif, setShowNotif] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userInitials, setUserInitials] = useState('U');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: '/dashboard',            icon: LayoutGrid,     labelKey: 'overview',  exact: true },
    { href: '/dashboard/portfolio',  icon: TrendingUp,     labelKey: 'portfolio' },
    { href: '/dashboard/arbitrage',  icon: BarChart3,      labelKey: 'arbitrage' },
    { href: '/dashboard/deposit',    icon: ArrowDownRight, labelKey: 'deposit' },
    { href: '/dashboard/withdraw',   icon: ArrowUpRight,   labelKey: 'withdraw' },
    { href: '/dashboard/earnings',   icon: Wallet,         labelKey: 'earnings'  },
    { href: '/dashboard/referrals',  icon: Users,          labelKey: 'referrals' },
    { href: '/dashboard/settings',   icon: Settings,       labelKey: 'settings'  },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLang(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch stats & profile for layout
  useEffect(() => {
    const loadLayoutData = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meJson = await meRes.json();
          const first = meJson.user.firstName || '';
          const last = meJson.user.lastName || '';
          setUserName(`${first} ${last}`.trim() || 'User');
          setUserInitials(
            ((first ? first.charAt(0) : '') + (last ? last.charAt(0) : '')) || 'U'
          );
        }

        const statsRes = await fetch('/api/dashboard/stats');
        const defaultNotifs: NotificationItem[] = [
          {
            id: 'welcome',
            title: 'Welcome to VEXTA',
            message: 'Your growth portfolio is ready. Secure it by verifying your credentials.',
            time: 'Just now',
            read: true,
            type: 'info',
          },
          {
            id: 'simulate-tip',
            title: 'Sandbox Mode Active',
            message: 'Use the Simulation Controls on the dashboard to test deposits and yields.',
            time: '5m ago',
            read: true,
            type: 'success',
          }
        ];

        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          const txs = statsJson.recentTransactions || [];
          const txNotifs: NotificationItem[] = txs.map((tx: any) => {
            const isDeposit = tx.type === 'deposit';
            const isWithdraw = tx.type === 'withdrawal';
            const isEarn = tx.type === 'commission' || tx.type === 'roi';
            
            return {
              id: tx.id,
              title: isDeposit ? 'Funds Deposited' : isWithdraw ? 'Withdrawal Requested' : 'Earnings Credited',
              message: `${tx.description || tx.type.toUpperCase()}: $${tx.amount.toLocaleString()} (${tx.status.toUpperCase()})`,
              time: new Date(tx.createdAt).toLocaleDateString(),
              read: true,
              type: isEarn || isDeposit ? 'success' : isWithdraw ? 'alert' : 'info',
            };
          });
          setNotifications([...txNotifs, ...defaultNotifs]);
        } else {
          setNotifications(defaultNotifs);
        }
      } catch (err) {
        console.error('Error fetching layout data:', err);
      }
    };

    loadLayoutData();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' });
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090f] text-slate-900 dark:text-white relative transition-colors duration-250">
      <BackgroundPattern />

      {/* ── Desktop Top Navbar ─────────────────────────────── */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-14 items-center justify-between px-6 bg-white/80 dark:bg-[#09090f]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <VextaLogo className="w-9 h-9" variant="transparent" />
          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-widest font-sans uppercase">vexta</span>
        </Link>

        <div className="flex items-center gap-5 relative">
          {/* Language Switcher (Standalone Icon - No container/radius) */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLang(!showLang)}
              className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-all flex items-center justify-center"
              title="Select Language"
            >
              <span className="text-base select-none">{flags[language]}</span>
            </button>
            {showLang && (
              <div className="absolute right-0 top-9 w-40 bg-white dark:bg-[#0A0F14]/95 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden font-sans">
                <div className="py-1">
                  {(Object.keys(flags) as Array<keyof typeof flags>).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setShowLang(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-slate-100 dark:hover:bg-white/5 transition-all ${language === lang ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-gray-300'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{flags[lang]}</span>
                        <span>{langNames[lang]}</span>
                      </span>
                      {language === lang && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notification bell (Standalone Icon - No container/radius) */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-all flex items-center justify-center"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-9 w-80 bg-white dark:bg-[#0A0F14]/95 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden font-sans">
                <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">Recent Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] font-mono text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3.5 transition-all relative group flex items-start gap-2.5 ${notif.read ? 'opacity-65' : 'bg-violet-500/2 dark:bg-violet-500/1'}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${notif.type === 'success' ? 'bg-green-500' : notif.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-slate-800 dark:text-white truncate">{notif.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                          <span className="text-[8px] text-slate-400 dark:text-gray-500 font-mono mt-1 block">{notif.time}</span>
                        </div>
                        <button
                          onClick={() => clearNotification(notif.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-gray-500 font-mono py-8 text-center">No notifications.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile initials & Logout */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-white/5">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase">
              {userInitials}
            </div>
            
            {/* Logout (Standalone Icon - No container/radius) */}
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 transition-all flex items-center justify-center"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Desktop Left Slim Sidebar (links only) ───────────── */}
      <aside className="hidden md:flex fixed top-14 bottom-0 left-0 z-40 w-20 flex-col items-center py-6 bg-white/80 dark:bg-[#09090f]/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-white/5">
        <nav className="flex flex-col items-center gap-3.5 w-full px-2">
          {navItems.map(({ href, icon: Icon, labelKey, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`w-full flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-200 group relative ${
                  active
                    ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
                    : 'text-slate-400 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white'
                }`}
                title={t(labelKey)}
              >
                <Icon className="w-5 h-5 mb-1 group-hover:scale-105 transition-transform" />
                <span className="text-[8px] font-sans font-medium tracking-wide text-center uppercase scale-90">{t(labelKey)}</span>
                {active && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-violet-600 dark:bg-violet-400 rounded-r-md" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Mobile Top Bar ────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-white/85 dark:bg-[#09090f]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5" ref={notifRef}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <VextaLogo className="w-9 h-9" variant="transparent" />
          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-widest font-sans uppercase">vexta</span>
        </Link>
        <div className="flex items-center gap-2">
          {/* Mobile Bell (Standalone Icon - No container/radius) */}
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative text-slate-500 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white transition-all flex items-center justify-center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
            )}
          </button>
          
          {showNotif && (
            <div className="absolute right-4 top-12 w-72 bg-white dark:bg-[#0A0F14]/95 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden font-sans">
              <div className="p-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/2">
                <span className="text-xs font-semibold text-slate-800 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[9px] font-mono text-violet-600 dark:text-violet-400">Mark read</button>
                )}
              </div>
              <div className="max-h-[240px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3 flex items-start gap-2 relative">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${notif.type === 'success' ? 'bg-green-500' : notif.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-slate-800 dark:text-white truncate">{notif.title}</p>
                        <p className="text-[9px] text-slate-500 dark:text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                      </div>
                      <button onClick={() => clearNotification(notif.id)} className="p-0.5 text-slate-400">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 font-mono py-6 text-center">No notifications.</p>
                )}
              </div>
            </div>
          )}

          <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase">
            {userInitials}
          </div>
        </div>
      </header>

      {/* ── Page Content ───────────────────────────────────── */}
      <main className="relative z-10 pt-14 pb-20 md:pb-4 min-h-screen md:pl-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Navigation Bar ───────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/95 dark:bg-[#09090f]/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-white/5 flex items-center justify-around px-2">
        {navItems.map(({ href, icon: Icon, labelKey, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[52px] ${
                active ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-gray-600 hover:text-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 transition-all ${active ? 'scale-110' : ''}`} />
              <span className="text-[9px] font-medium tracking-wide">{t(labelKey)}</span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-violet-600 dark:bg-violet-400 -mt-0.5" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
