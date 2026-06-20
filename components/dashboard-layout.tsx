'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, TrendingUp, Users, Wallet, BarChart3, Settings, LogOut, Bell, X, Check, Globe, ArrowUpRight, ArrowDownRight, FileText, AlertTriangle, Sun, Moon } from 'lucide-react';
import { BackgroundPattern } from '@/components/background-pattern';
import { VextaLogo } from '@/components/vexta-logo';
import { SYSTEM_CONFIG } from '@/lib/config/system';
import { useTranslation } from '@/components/translation-provider';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

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
  fr: '🇫🇷',
  zh: '🇨🇳',
  ar: '🇸🇦',
  ru: '🇷🇺',
  hi: '🇮🇳',
  de: '🇩🇪'
};

const langNames = {
  en: 'English',
  es: 'Español',
  vi: 'Tiếng Việt',
  th: 'ภาษาไทย',
  pt: 'Português',
  ko: '한국어',
  fr: 'Français',
  zh: '简体中文',
  ar: 'العربية',
  ru: 'Русский',
  hi: 'हिन्दी',
  de: 'Deutsch'
};

interface NavItem {
  href: string;
  icon: any;
  labelKey: string;
  exact?: boolean;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();
  const [showNotif, setShowNotif] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [userInitials, setUserInitials] = useState('U');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileProfileRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const coreNavItems: NavItem[] = [
    { href: '/dashboard',            icon: LayoutGrid,     labelKey: 'overview',  exact: true },
    { href: '/dashboard/portfolio',  icon: TrendingUp,     labelKey: 'portfolio' },
    { href: '/dashboard/arbitrage',  icon: BarChart3,      labelKey: 'arbitrage' },
    { href: '/dashboard/deposit',    icon: ArrowDownRight, labelKey: 'deposit' },
    { href: '/dashboard/withdraw',   icon: ArrowUpRight,   labelKey: 'withdraw' },
  ];

  const extraNavItems: NavItem[] = [
    { href: '/dashboard/earnings',   icon: Wallet,         labelKey: 'earnings'  },
    { href: '/dashboard/referrals',  icon: Users,          labelKey: 'referrals' },
    { href: '/dashboard/resources',  icon: FileText,       labelKey: 'materials' },
    { href: '/dashboard/settings',   icon: Settings,       labelKey: 'settings'  },
  ];

  const navItems = [
    ...coreNavItems,
    ...extraNavItems.filter(item => item.labelKey !== 'materials' && item.labelKey !== 'settings')
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
      if (
        profileRef.current && 
        !profileRef.current.contains(event.target as Node) &&
        (!mobileProfileRef.current || !mobileProfileRef.current.contains(event.target as Node))
      ) {
        setShowProfile(false);
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
          setUserEmail(meJson.user.email || '');
        }

        const statsRes = await fetch('/api/dashboard/stats');
        const defaultNotifs: NotificationItem[] = [
          {
            id: 'welcome',
            title: t('notifWelcomeTitle') || 'Welcome to VEXTA',
            message: t('notifWelcomeDesc') || 'Your growth portfolio is ready. Secure it by verifying your credentials.',
            time: t('notifJustNow') || 'Just now',
            read: true,
            type: 'info',
          },
          {
            id: 'simulate-tip',
            title: t('notifSandboxTitle') || 'Sandbox Mode Active',
            message: t('notifSandboxDesc') || 'Use the Simulation Controls on the dashboard to test deposits and yields.',
            time: t('notif5mAgo') || '5m ago',
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
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-20 items-center justify-between px-6 bg-white/80 dark:bg-[#09090f]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0 py-1">
          <VextaLogo className="h-[64px] w-auto" isLight={mounted && resolvedTheme === 'light'} />
        </Link>

        <div className="flex items-center gap-5 relative">
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
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">{t('notifRecent') || 'Recent Notifications'}</span>
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
                    <p className="text-xs text-slate-400 dark:text-gray-500 font-mono py-8 text-center">{t('notifEmpty') || 'No notifications.'}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile initials & Dropdown */}
          <div className="flex items-center pl-3 border-l border-slate-200 dark:border-white/5 relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase hover:ring-2 hover:ring-violet-500/50 transition-all cursor-pointer"
            >
              {userInitials}
            </button>
            {showProfile && (
              <div className="absolute right-0 top-10 w-72 bg-white/95 dark:bg-[#0A0F14]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-4 space-y-4 font-sans">
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400 uppercase">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{userName}</p>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate">{userEmail}</p>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 dark:border-white/5" />

                {/* Extra Links */}
                <div className="space-y-1">
                  {extraNavItems.map(({ href, icon: Icon, labelKey }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setShowProfile(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive(pathname, href)
                          ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                          : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{t(labelKey)}</span>
                    </Link>
                  ))}
                </div>

                <div className="border-t border-slate-100 dark:border-white/5" />

                {/* Preferences */}
                <div className="space-y-3">
                  {/* Theme */}
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-gray-300">
                    <span className="font-semibold">Theme</span>
                    <div className="flex bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg border border-slate-200/50 dark:border-white/5">
                      <button
                        onClick={() => setTheme('light')}
                        className={`p-1.5 rounded-md transition-all ${(mounted && resolvedTheme === 'light') ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 dark:text-gray-500'}`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-1.5 rounded-md transition-all ${(mounted && resolvedTheme === 'dark') ? 'bg-[#09090f] text-violet-400 shadow-sm' : 'text-slate-400 dark:text-gray-500'}`}
                      >
                        <Moon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Language */}
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-gray-300">
                    <span className="font-semibold">Language</span>
                    <div className="relative" ref={langRef}>
                      <button
                        onClick={() => setShowLang(!showLang)}
                        className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-[11px] font-bold"
                      >
                        <span>{flags[language]}</span>
                        <span>{langNames[language]}</span>
                      </button>
                      {showLang && (
                        <div className="absolute right-0 bottom-7 mb-1 w-36 bg-white dark:bg-[#0A0F14]/95 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                          {(Object.keys(flags) as Array<keyof typeof flags>).map((lang) => (
                            <button
                              key={lang}
                              onClick={() => {
                                setLanguage(lang);
                                setShowLang(false);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-semibold text-left hover:bg-slate-100 dark:hover:bg-white/5 transition-all ${language === lang ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-gray-300'}`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span>{flags[lang]}</span>
                                <span>{langNames[lang]}</span>
                              </span>
                              {language === lang && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/5" />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Desktop Left Slim Sidebar (links only) ───────────── */}
      <aside className="hidden md:flex fixed top-20 bottom-0 left-0 z-40 w-20 flex-col items-center py-6 bg-white/80 dark:bg-[#09090f]/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-white/5">
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
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-4 bg-white/85 dark:bg-[#09090f]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5" ref={notifRef}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <VextaLogo className="h-[56px] w-auto" isLight={mounted && resolvedTheme === 'light'} />
        </Link>
        <div className="flex items-center gap-3">
          {/* Mobile Bell */}
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
                  <button onClick={markAllRead} className="text-[9px] font-mono text-violet-600 dark:text-violet-400">{t('notifMarkRead') || 'Mark read'}</button>
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

          {/* User Profile avatar trigger for sliding drawer */}
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            {userInitials}
          </button>
        </div>
      </header>

      {/* Mobile Profile Drawer Backdrop */}
      {showProfile && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
          onClick={() => setShowProfile(false)}
        />
      )}

      {/* Mobile Profile Drawer Panel */}
      <div
        ref={mobileProfileRef}
        className={`md:hidden fixed inset-y-0 right-0 w-80 bg-white/95 dark:bg-[#0c0d14]/95 backdrop-blur-2xl border-l border-slate-200 dark:border-white/10 shadow-2xl z-[101] transform transition-transform duration-300 ease-out p-6 flex flex-col justify-between ${
          showProfile ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-600 dark:text-violet-400 uppercase">
                {userInitials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={() => setShowProfile(false)}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="border-t border-slate-150 dark:border-white/5" />

          {/* Extra Links */}
          <div className="flex-1 space-y-1.5 overflow-y-auto">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-2 mb-1">Menu Options</p>
            {extraNavItems.map(({ href, icon: Icon, labelKey }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setShowProfile(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive(pathname, href)
                    ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
                    : 'text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t(labelKey)}</span>
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-150 dark:border-white/5" />

          {/* Preferences */}
          <div className="space-y-4">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-2">Preferences</p>
            
            {/* Theme */}
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-gray-300 px-2">
              <span className="font-semibold">Dark Theme</span>
              <div className="flex bg-slate-100 dark:bg-white/5 p-0.5 rounded-xl border border-slate-200/50 dark:border-white/5">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${(mounted && resolvedTheme === 'light') ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 dark:text-gray-500'}`}
                >
                  <Sun className="w-3.5 h-3.5 inline mr-1" /> Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${(mounted && resolvedTheme === 'dark') ? 'bg-[#09090f] text-violet-400 shadow-sm' : 'text-slate-400 dark:text-gray-500'}`}
                >
                  <Moon className="w-3.5 h-3.5 inline mr-1" /> Dark
                </button>
              </div>
            </div>

            {/* Language Selection Grid */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-gray-300 px-2 block">Language</span>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-50 dark:bg-white/2 rounded-2xl border border-slate-150 dark:border-white/5">
                {(Object.keys(flags) as Array<keyof typeof flags>).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      language === lang
                        ? 'bg-violet-600 text-white shadow'
                        : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{flags[lang]}</span>
                    <span>{langNames[lang]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-150 dark:border-white/5" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 transition-all shrink-0 mb-4 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ── Page Content ───────────────────────────────────── */}
      <main className="relative z-10 pt-20 pb-20 md:pb-4 min-h-screen md:pl-20">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Navigation Bar ───────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/95 dark:bg-[#09090f]/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-white/5 flex items-center justify-around px-2">
        {coreNavItems.map(({ href, icon: Icon, labelKey, exact }) => {
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
