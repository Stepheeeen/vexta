'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, Bell, LogOut, Check, Globe } from 'lucide-react';
import { VextaLogo } from '@/components/vexta-logo';
import { useTranslation } from '@/components/translation-provider';
import { useRouter, usePathname } from 'next/navigation';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');

  // Session & User States
  const [user, setUser] = useState<any>(null);
  const [userInitials, setUserInitials] = useState('U');
  const [showNotif, setShowNotif] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const { language, setLanguage, t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { label: t('navHowItWorks'), href: '/#how-it-works' },
    { label: t('navPlans'), href: '/#plans' },
    { label: t('navWhyUs'), href: '/#why-us' },
    { label: t('navFAQ'), href: '/#faq' },
    { label: t('handoverTitle'), href: '/handover', external: true },
  ];

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

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['how-it-works', 'plans', 'why-us', 'faq'];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActive(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch session & notifications on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meJson = await meRes.json();
          setUser(meJson.user);
          const first = meJson.user.firstName || '';
          const last = meJson.user.lastName || '';
          setUserInitials(
            ((first ? first.charAt(0) : '') + (last ? last.charAt(0) : '')) || 'U'
          );

          // If logged in, fetch notifications/stats
          const statsRes = await fetch('/api/dashboard/stats');
          const defaultNotifs = [
            {
              id: 'welcome',
              title: 'Welcome to VEXTA',
              message: 'Start growing your assets today with our 5-level system.',
              time: 'Just now',
              read: false,
              type: 'info' as const,
            }
          ];
          if (statsRes.ok) {
            const statsJson = await statsRes.json();
            const txs = statsJson.recentTransactions || [];
            const txNotifs = txs.map((tx: any) => {
              const isEarn = tx.type === 'EARNING' || tx.type === 'REFERRAL';
              const isDeposit = tx.type === 'DEPOSIT';
              const isWithdraw = tx.type === 'WITHDRAWAL';
              return {
                id: tx.id,
                title: tx.type === 'REFERRAL' ? 'Referral Commission' : `${tx.type.charAt(0) + tx.type.slice(1).toLowerCase()} Completed`,
                message: `$${tx.amount.toLocaleString()} has been ${isEarn ? 'earned' : isDeposit ? 'deposited' : 'withdrawn'}.`,
                time: new Date(tx.createdAt).toLocaleDateString(),
                read: true,
                type: isEarn || isDeposit ? 'success' as const : isWithdraw ? 'alert' as const : 'info' as const,
              };
            });
            setNotifications([...txNotifs, ...defaultNotifs]);
          } else {
            setNotifications(defaultNotifs);
          }
        }
      } catch (err) {
        console.error('Error fetching session in landing navbar:', err);
      }
    };
    fetchSession();
  }, []);

  // Click outside to close dropdowns
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' });
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === '/') {
      e.preventDefault();
      const id = href.replace('/#', '').replace('#', '');
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If we are not on the landing page, force a route change to landing page section
      e.preventDefault();
      router.push(href);
    }
    setIsOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/95 dark:bg-[#090C10]/95 backdrop-blur-xl border-b border-slate-850 dark:border-white/5 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <VextaLogo className="h-8 w-8 transition-transform duration-300 group-hover:scale-105" />
            <span className={`text-xl font-bold tracking-tight transition-colors ${scrolled ? 'text-white' : 'text-slate-900 dark:text-white'}`}>vexta</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const id = item.href.replace('/#', '').replace('#', '');
              if ((item as any).external) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === '/handover'
                        ? 'text-white bg-violet-600/40 dark:text-violet-400 dark:bg-violet-500/10'
                        : scrolled
                        ? 'text-violet-400 bg-white/5 hover:bg-white/10'
                        : 'text-violet-600 bg-violet-50/60 dark:text-violet-400 dark:bg-violet-500/10 hover:bg-violet-100/70 dark:hover:bg-violet-500/20'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNav(e, item.href)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active === id
                      ? scrolled
                        ? 'text-violet-400 bg-white/5'
                        : 'text-violet-600 bg-violet-50 dark:text-violet-450 dark:bg-white/5'
                      : scrolled
                      ? 'text-slate-300 hover:text-white hover:bg-white/5'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA buttons / Session Actions */}
          <div className="hidden md:flex items-center gap-5">
            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setShowLang(!showLang)}
                className={`transition-all flex items-center justify-center cursor-pointer animate-fade-in ${
                  scrolled ? 'text-slate-300 hover:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={t('navSelectLanguage')}
              >
                <span className="text-base select-none">{flags[language]}</span>
              </button>
              {showLang && (
                <div className="absolute right-0 top-8 w-40 bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-white/5 rounded-xl shadow-xl z-50 overflow-hidden font-sans">
                  <div className="py-1">
                    {(Object.keys(flags) as Array<keyof typeof flags>).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setShowLang(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-slate-100 dark:hover:bg-white/5 transition-all ${
                          language === lang
                            ? 'text-violet-600 bg-slate-50 dark:text-violet-400 dark:bg-white/5'
                            : 'text-slate-700 dark:text-slate-350'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{flags[lang]}</span>
                          <span>{langNames[lang]}</span>
                        </span>
                        {language === lang && <Check className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotif(!showNotif)}
                    className={`relative transition-all flex items-center justify-center cursor-pointer ${
                      scrolled ? 'text-slate-300 hover:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </button>

                  {showNotif && (
                    <div className="absolute right-0 top-8 w-80 bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl z-50 overflow-hidden font-sans">
                      <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/3">
                        <span className="text-xs font-semibold text-slate-800 dark:text-white">{t('navRecentNotifications')}</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-[10px] font-mono text-violet-600 dark:text-violet-400 hover:underline"
                          >
                            {t('navMarkRead')}
                          </button>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3.5 transition-all relative group flex items-start gap-2.5 ${notif.read ? 'opacity-65' : 'bg-violet-500/5'}`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${notif.type === 'success' ? 'bg-green-500' : notif.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-slate-800 dark:text-white truncate">{notif.title}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-405 mt-0.5 leading-relaxed">{notif.message}</p>
                                <span className="text-[8px] text-slate-400 dark:text-slate-500 font-mono mt-1 block">{notif.time}</span>
                              </div>
                              <button
                                onClick={() => clearNotification(notif.id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 dark:text-slate-505 hover:text-slate-650 dark:hover:text-white transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-405 font-mono py-8 text-center">{t('navNoNotifications')}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile initials & Logout */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-white/10">
                  <Link
                    href={user.role === 'admin' ? '/admin' : '/dashboard'}
                    className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase hover:bg-violet-500/30 transition-all"
                    title={t('navGoToDashboard')}
                  >
                    {userInitials}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className={`transition-all flex items-center justify-center cursor-pointer ${
                      scrolled ? 'text-slate-400 hover:text-red-400' : 'text-slate-400 dark:text-slate-550 hover:text-red-500 dark:hover:text-red-400'
                    }`}
                    title={t('navSignOut')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    scrolled ? 'text-slate-300 hover:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('navLogIn')}
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-all shadow-md shadow-violet-600/15"
                >
                  {t('navGetStarted')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 transition-colors ${
              scrolled ? 'text-slate-300 hover:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-slate-950/95 dark:bg-[#090C10]/95 backdrop-blur-xl border-t border-slate-800 dark:border-white/5 px-4 py-4 space-y-1 shadow-lg shadow-slate-900/50 dark:shadow-none animate-fade-in-up">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={(e) => handleNav(e, href)}
              className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              {label}
            </Link>
          ))}

          <div className="pt-3 flex flex-col gap-2 border-t border-slate-800 dark:border-white/5">
            {/* Mobile Language selector */}
            <div className="relative">
              <button
                onClick={() => setShowLang(!showLang)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-300 bg-white/5 border border-slate-800 dark:border-white/5 rounded-xl hover:bg-white/10 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('navLanguageLabel')}: {langNames[language]}</span>
                </span>
                <span>{flags[language]}</span>
              </button>
              {showLang && (
                <div className="mt-1 border border-slate-800 dark:border-white/5 rounded-xl overflow-hidden bg-slate-900 shadow-md max-h-48 overflow-y-auto">
                  {(Object.keys(flags) as Array<keyof typeof flags>).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setShowLang(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-left hover:bg-white/5 transition-all ${language === lang ? 'text-violet-450 bg-white/5' : 'text-slate-300'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{flags[lang]}</span>
                        <span>{langNames[lang]}</span>
                      </span>
                      {language === lang && <Check className="w-3.5 h-3.5 text-violet-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="space-y-3 pt-1">
                {/* Mobile User Profile details */}
                <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 uppercase">
                    {userInitials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
                  </div>
                </div>

                {/* Mobile Dashboard link */}
                <Link
                  href={user.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-4 py-2.5 text-center text-xs font-semibold text-violet-450 bg-violet-500/10 border border-violet-500/20 rounded-xl hover:bg-violet-500/20 transition-all"
                >
                  {t('navGoToDashboard')}
                </Link>

                {/* Mobile Sign Out */}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-center text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t('navSignOut')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-1">
                <Link href="/login" className="block px-4 py-3 text-center text-sm font-medium text-slate-300 border border-white/5 rounded-lg transition-all hover:bg-white/5">
                  {t('navLogIn')}
                </Link>
                <Link href="/signup" className="block px-4 py-3 text-center text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-all">
                  {t('navGetStarted')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
