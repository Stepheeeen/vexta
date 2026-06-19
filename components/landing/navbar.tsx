'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Bell, LogOut, Check, Globe, Sun, Moon, X, ChevronDown } from 'lucide-react';
import { VextaLogo } from '@/components/vexta-logo';
import { SYSTEM_CONFIG } from '@/lib/config/system';
import { useTranslation, Language } from '@/components/translation-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const [mounted, setMounted] = useState(false);

  // Session & User
  const [user, setUser] = useState<any>(null);
  const [userInitials, setUserInitials] = useState('U');
  const [showNotif, setShowNotif] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showMobileLang, setShowMobileLang] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const { language, setLanguage, t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  // Mount flag — required for portal & theme to work correctly
  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, mounted]);

  const isLightHeader = mounted && resolvedTheme === 'light' && (pathname !== '/' || scrolled);

  const navLinks = [
    { label: t('navHowItWorks'), href: '/#how-it-works' },
    { label: t('navPlans'),      href: '/#plans' },
    { label: t('navWhyUs'),      href: '/#why-us' },
    { label: t('navFAQ'),        href: '/#faq' },
    { label: t('handoverTitle'), href: '/handover', external: true },
  ];

  const flags: Record<string, string> = {
    en: '🇺🇸', es: '🇪🇸', vi: '🇻🇳', th: '🇹🇭', pt: '🇵🇹', ko: '🇰🇷', fr: '🇫🇷', zh: '🇨🇳', ar: '🇸🇦', ru: '🇷🇺', hi: '🇮🇳', de: '🇩🇪',
  };
  const langNames: Record<string, string> = {
    en: 'English', es: 'Español', vi: 'Tiếng Việt', th: 'ภาษาไทย',
    pt: 'Português', ko: '한국어', fr: 'Français', zh: '中文', ar: 'العربية', ru: 'Русский', hi: 'हिन्दी', de: 'Deutsch',
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotif   = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  // Scroll + section observer
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const sections = ['how-it-works', 'plans', 'why-us', 'faq'];
    const obs: { o: IntersectionObserver; el: HTMLElement }[] = [];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(id); },
        { rootMargin: '-30% 0px -50% 0px', threshold: 0 }
      );
      o.observe(el);
      obs.push({ o, el });
    });
    return () => {
      window.removeEventListener('scroll', onScroll);
      obs.forEach(({ o, el }) => o.unobserve(el));
    };
  }, []);

  // Fetch session & notifications
  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) return;
        const { user: u } = await meRes.json();
        setUser(u);
        setUserInitials(
          ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')) || 'U'
        );
        const defaultNotifs = [{
          id: 'welcome', title: 'Welcome to VEXTA',
          message: 'Start growing your assets today.',
          time: 'Just now', read: false, type: 'info' as const,
        }];
        const statsRes = await fetch('/api/dashboard/stats');
        if (statsRes.ok) {
          const { recentTransactions: txs = [] } = await statsRes.json();
          const txNotifs = txs.map((tx: any) => {
            const isEarn = tx.type === 'EARNING' || tx.type === 'REFERRAL';
            const isDeposit = tx.type === 'DEPOSIT';
            return {
              id: tx.id,
              title: tx.type === 'REFERRAL' ? 'Referral Commission'
                : `${tx.type.charAt(0)}${tx.type.slice(1).toLowerCase()} Completed`,
              message: `$${tx.amount.toLocaleString()} has been ${isEarn ? 'earned' : isDeposit ? 'deposited' : 'withdrawn'}.`,
              time: new Date(tx.createdAt).toLocaleDateString(),
              read: true,
              type: (isEarn || isDeposit ? 'success' : 'alert') as 'success' | 'alert' | 'info',
            };
          });
          setNotifications([...txNotifs, ...defaultNotifs]);
        } else {
          setNotifications(defaultNotifs);
        }
      } catch (e) {
        console.error('Navbar session error:', e);
      }
    })();
  }, []);

  // Close desktop dropdowns on outside click
  useEffect(() => {
    const handler = (e: Event) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (langRef.current  && !langRef.current.contains(e.target as Node))  setShowLang(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' });
      setUser(null);
      router.push('/login');
    } catch (e) { console.error(e); }
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string, external?: boolean) => {
    setIsOpen(false);
    if (external) return;
    e.preventDefault();
    if (pathname === '/') {
      document.getElementById(href.replace('/#', ''))?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(href);
    }
  };

  const navbarBg = scrolled
    ? isLightHeader
      ? 'bg-white/95 border-b border-slate-200 shadow-sm'
      : 'bg-[#090C10]/95 backdrop-blur-xl border-b border-white/5 shadow-lg'
    : 'bg-transparent';

  // ─────────────────────────────────────────────────────────────────────────────
  // Portal content — only rendered on client, so no SSR hydration mismatch
  // ─────────────────────────────────────────────────────────────────────────────
  const drawerPortal = mounted ? createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
        className={`bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9999, width: 'min(320px, 90vw)' }}
        className={`bg-white dark:bg-[#0a0f1a] flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden ${
          isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-20 border-b border-slate-100 dark:border-white/6 shrink-0">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <VextaLogo className="h-[60px] w-auto" />
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8 transition-all cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-1">
          {navLinks.map(({ label, href, external }) => {
            const id = href.replace('/#', '').replace('#', '');
            const isCurrent = active === id || (external && pathname === '/handover');
            return (
              <Link key={href} href={href}
                onClick={e => handleNav(e, href, external)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                  isCurrent
                    ? 'text-violet-600 dark:text-violet-400 bg-violet-500/8 dark:bg-violet-500/12'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                }`}>
                {label}
              </Link>
            );
          })}

          <div className="pt-3 pb-1"><div className="h-px bg-slate-100 dark:bg-white/6" /></div>

          {/* Theme toggle */}
          <button type="button"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-3">
              {resolvedTheme === 'dark'
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-violet-500" />}
              {t('navTheme') || 'Theme'}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Language selector */}
          <div>
            <button type="button"
              onClick={() => setShowMobileLang(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-violet-500" />
                {t('navLanguageLabel') || 'Language'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-base">{flags[language]}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showMobileLang ? 'rotate-180' : ''}`} />
              </span>
            </button>
            {showMobileLang && (
              <div className="mx-1 mt-1 mb-2 border border-slate-100 dark:border-white/6 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-white/3">
                {(Object.keys(flags) as Language[]).map(lang => (
                  <button type="button" key={lang}
                    onClick={() => { setLanguage(lang); setShowMobileLang(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
                      language === lang
                        ? 'text-violet-600 dark:text-violet-400 bg-violet-500/6'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}>
                    <span className="flex items-center gap-2.5">
                      <span className="text-base">{flags[lang]}</span>
                      <span>{langNames[lang]}</span>
                    </span>
                    {language === lang && <Check className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer footer */}
        <div className="px-4 pb-8 pt-4 border-t border-slate-100 dark:border-white/6 shrink-0 space-y-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/4">
                <div className="w-9 h-9 rounded-full bg-violet-600/10 dark:bg-violet-500/20 border border-violet-200 dark:border-violet-500/30 text-violet-700 dark:text-violet-400 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</p>
                </div>
              </div>
              <Link
                href={user.role === 'admin' ? '/admin' : '/dashboard'}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-600/15"
              >
                {t('navGoToDashboard') || 'Go to Dashboard'}
              </Link>
              <button type="button"
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold text-red-500 dark:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                {t('navSignOut') || 'Sign Out'}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full py-3.5 rounded-2xl text-sm font-bold border border-slate-200 dark:border-white/8 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                {t('navLogIn') || 'Log In'}
              </Link>
              <Link href="/signup" onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-600/15">
                {t('navGetStarted') || 'Get Started'}
              </Link>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  ) : null;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Top bar — server-rendered, no hydration issues ──────────── */}
      <header className={`fixed top-0 left-0 right-0 z-[900] transition-all duration-300 ${navbarBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <VextaLogo className="h-[72px] w-auto transition-transform duration-300 group-hover:scale-105" />
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(item => {
                const id = item.href.replace('/#', '').replace('#', '');
                if ((item as any).external) {
                  return (
                    <Link key={item.href} href={item.href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        pathname === '/handover'
                          ? isLightHeader ? 'text-violet-600 bg-violet-50' : 'text-violet-400 bg-violet-500/10'
                          : isLightHeader ? 'text-violet-600 bg-slate-100 hover:bg-slate-200' : 'text-violet-400 bg-white/5 hover:bg-white/10'
                      }`}>
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <Link key={item.href} href={item.href}
                    onClick={e => handleNav(e, item.href, item.external)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      active === id
                        ? isLightHeader ? 'text-violet-600 bg-slate-100' : 'text-violet-400 bg-white/5'
                        : isLightHeader ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop right actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Theme */}
              <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all cursor-pointer ${
                  isLightHeader ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`} title="Toggle theme">
                {mounted ? (resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <span className="w-4 h-4" />}
              </button>

              {/* Language */}
              <div className="relative" ref={langRef}>
                <button type="button" onClick={() => setShowLang(v => !v)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                    isLightHeader ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}>
                  <span className="text-base select-none">{flags[language]}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showLang ? 'rotate-180' : ''}`} />
                </button>
                {showLang && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-white/8 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="py-1.5">
                      {(Object.keys(flags) as Language[]).map(lang => (
                        <button type="button" key={lang}
                          onClick={() => { setLanguage(lang); setShowLang(false); }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition-all ${
                            language === lang
                              ? 'text-violet-600 dark:text-violet-400 bg-violet-500/5'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                          }`}>
                          <span className="flex items-center gap-2"><span>{flags[lang]}</span><span>{langNames[lang]}</span></span>
                          {language === lang && <Check className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              {user && (
                <div className="relative" ref={notifRef}>
                  <button onClick={() => setShowNotif(v => !v)}
                    className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-all cursor-pointer ${
                      isLightHeader ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}>
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                  </button>
                  {showNotif && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#0f141c] border border-slate-200 dark:border-white/8 rounded-2xl shadow-2xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 dark:text-white">{t('navRecentNotifications')}</span>
                        {unreadCount > 0 && <button onClick={markAllRead} className="text-[10px] font-mono text-violet-600 dark:text-violet-400 hover:underline">{t('navMarkRead')}</button>}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                        {notifications.length > 0 ? notifications.map(n => (
                          <div key={n.id} className={`px-4 py-3 flex items-start gap-3 group ${n.read ? 'opacity-60' : 'bg-violet-500/3'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold text-slate-800 dark:text-white truncate">{n.title}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                              <span className="text-[9px] text-slate-400 font-mono mt-1 block">{n.time}</span>
                            </div>
                            <button onClick={() => clearNotif(n.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )) : <p className="text-xs text-slate-400 font-mono py-8 text-center">{t('navNoNotifications')}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Auth */}
              {user ? (
                <div className={`flex items-center gap-3 pl-3 border-l ${isLightHeader ? 'border-slate-200' : 'border-white/10'}`}>
                  <Link href={user.role === 'admin' ? '/admin' : '/dashboard'}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold uppercase transition-all ${
                      isLightHeader
                        ? 'bg-violet-100 border border-violet-200 text-violet-700 hover:bg-violet-200'
                        : 'bg-violet-500/20 border border-violet-500/30 text-violet-400 hover:bg-violet-500/30'
                    }`} title={t('navGoToDashboard')}>
                    {userInitials}
                  </Link>
                  <button onClick={handleLogout}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer ${
                      isLightHeader ? 'text-slate-500 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                    }`} title={t('navSignOut')}>
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login"
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      isLightHeader ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}>
                    {t('navLogIn')}
                  </Link>
                  <Link href="/signup"
                    className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-all shadow-md shadow-violet-600/20">
                    {t('navGetStarted')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setIsOpen(v => !v)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              className={`lg:hidden flex flex-col items-center justify-center w-11 h-11 rounded-xl gap-[5px] transition-all cursor-pointer shrink-0 ${
                isLightHeader ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
              }`}
            >
              <span className={`block w-5 h-[2px] bg-current rounded-full transition-all duration-300 origin-center ${isOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block w-5 h-[2px] bg-current rounded-full transition-all duration-300 ${isOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block w-5 h-[2px] bg-current rounded-full transition-all duration-300 origin-center ${isOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer & backdrop — portaled to document.body, client-only, no SSR mismatch */}
      {drawerPortal}
    </>
  );
}
