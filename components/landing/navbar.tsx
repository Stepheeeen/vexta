'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, Bell, LogOut, Check, Globe } from 'lucide-react';
import { VextaLogo } from '@/components/vexta-logo';
import { useTranslation } from '@/components/translation-provider';
import { useRouter } from 'next/navigation';

const navLinks = [
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Plans', href: '#plans' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'FAQ', href: '#faq' },
];

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
    e.preventDefault();
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm shadow-slate-100/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <VextaLogo className="h-8 w-8 transition-transform duration-300 group-hover:scale-105" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">vexta</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => {
              const id = href.replace('#', '');
              return (
                <a
                  key={href}
                  href={href}
                  onClick={(e) => handleNav(e, href)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active === id
                      ? 'text-violet-600 bg-violet-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                  }`}
                >
                  {label}
                </a>
              );
            })}
          </nav>

          {/* CTA buttons / Session Actions */}
          <div className="hidden md:flex items-center gap-5">
            {user ? (
              <>
                {/* Language Switcher */}
                <div className="relative" ref={langRef}>
                  <button
                    onClick={() => setShowLang(!showLang)}
                    className="text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center"
                    title="Select Language"
                  >
                    <span className="text-base select-none cursor-pointer">{flags[language]}</span>
                  </button>
                  {showLang && (
                    <div className="absolute right-0 top-8 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden font-sans">
                      <div className="py-1">
                        {(Object.keys(flags) as Array<keyof typeof flags>).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => {
                              setLanguage(lang);
                              setShowLang(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-slate-100 transition-all ${language === lang ? 'text-violet-600 bg-slate-50' : 'text-slate-700'}`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{flags[lang]}</span>
                              <span>{langNames[lang]}</span>
                            </span>
                            {language === lang && <Check className="w-3.5 h-3.5 text-violet-605" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotif(!showNotif)}
                    className="relative text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </button>

                  {showNotif && (
                    <div className="absolute right-0 top-8 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden font-sans">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <span className="text-xs font-semibold text-slate-800">Recent Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-[10px] font-mono text-violet-600 hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3.5 transition-all relative group flex items-start gap-2.5 ${notif.read ? 'opacity-65' : 'bg-violet-500/5'}`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${notif.type === 'success' ? 'bg-green-500' : notif.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-slate-800 truncate">{notif.title}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                <span className="text-[8px] text-slate-400 font-mono mt-1 block">{notif.time}</span>
                              </div>
                              <button
                                onClick={() => clearNotification(notif.id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-600 transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 font-mono py-8 text-center">No notifications.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile initials & Logout */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                  <Link
                    href={user.role === 'admin' ? '/admin' : '/dashboard'}
                    className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-600 uppercase hover:bg-violet-500/30 transition-all"
                    title="Go to Dashboard"
                  >
                    {userInitials}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-red-500 transition-all flex items-center justify-center cursor-pointer"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 rounded-lg transition-all shadow-md shadow-violet-500/10"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
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
        <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-4 space-y-1 shadow-lg shadow-slate-100">
          {navLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => handleNav(e, href)}
              className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              {label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2 border-t border-slate-200">
            {user ? (
              <div className="space-y-3 pt-2">
                {/* Mobile User Profile details */}
                <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-600 uppercase">
                    {userInitials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{user.email}</p>
                  </div>
                </div>

                {/* Mobile Dashboard link */}
                <Link
                  href={user.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-4 py-2.5 text-center text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-500/20 rounded-xl hover:bg-violet-100 transition-all"
                >
                  Go to Dashboard
                </Link>

                {/* Mobile Language selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowLang(!showLang)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      <span>Language: {langNames[language]}</span>
                    </span>
                    <span>{flags[language]}</span>
                  </button>
                  {showLang && (
                    <div className="mt-1 border border-slate-150 rounded-xl overflow-hidden bg-white shadow-md max-h-48 overflow-y-auto">
                      {(Object.keys(flags) as Array<keyof typeof flags>).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setLanguage(lang);
                            setShowLang(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-left hover:bg-slate-50 transition-all ${language === lang ? 'text-violet-600 bg-violet-50/50' : 'text-slate-650'}`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{flags[lang]}</span>
                            <span>{langNames[lang]}</span>
                          </span>
                          {language === lang && <Check className="w-3 h-3 text-violet-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Sign Out */}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-center text-xs font-semibold text-red-650 bg-red-50 hover:bg-red-100 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-3 text-center text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-all hover:bg-slate-50">
                  Log In
                </Link>
                <Link href="/signup" className="block px-4 py-3 text-center text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 rounded-lg transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
