'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Users, CreditCard, BarChart3, Settings, LogOut, Bell, X, Check, ArrowDownRight, AlertTriangle, FileText } from 'lucide-react';
import { BackgroundPattern } from '@/components/background-pattern';
import { VextaLogo } from '@/components/vexta-logo';
import { SYSTEM_CONFIG } from '@/lib/config/system';
import { useTranslation } from '@/components/translation-provider';
import { useState, useEffect, useRef } from 'react';

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

const adminTranslations = {
  en: {
    dashboard: 'Dashboard',
    users: 'Users',
    deposits: 'Deposits',
    transactions: 'Transactions',
    withdrawals: 'Withdrawals',
    analytics: 'Analytics',
    settings: 'Settings',
    resources: 'Resources',
  },
  es: {
    dashboard: 'Tablero',
    users: 'Usuarios',
    deposits: 'Depósitos',
    transactions: 'Transacciones',
    withdrawals: 'Retiros',
    analytics: 'Analítica',
    settings: 'Configuración',
    resources: 'Recursos',
  },
  vi: {
    dashboard: 'Bảng điều khiển',
    users: 'Người dùng',
    deposits: 'Nạp tiền',
    transactions: 'Giao dịch',
    withdrawals: 'Rút tiền',
    analytics: 'Phân tích',
    settings: 'Cài đặt',
    resources: 'Tài nguyên',
  },
  th: {
    dashboard: 'แดชบอร์ด',
    users: 'ผู้ใช้งาน',
    deposits: 'เงินฝาก',
    transactions: 'ธุรกรรม',
    withdrawals: 'การถอนเงิน',
    analytics: 'การวิเคราะห์',
    settings: 'การตั้งค่า',
    resources: 'แหล่งข้อมูล',
  },
  pt: {
    dashboard: 'Painel',
    users: 'Usuários',
    deposits: 'Depósitos',
    transactions: 'Transações',
    withdrawals: 'Saques',
    analytics: 'Análise',
    settings: 'Configurações',
    resources: 'Recursos',
  },
  ko: {
    dashboard: '대시보드',
    users: '사용자 관리',
    deposits: '입금 관리',
    transactions: '거래 관리',
    withdrawals: '출금 관리',
    analytics: '통계 분석',
    settings: '설정',
    resources: '자료실',
  },
  fr: {
    dashboard: 'Tableau de bord',
    users: 'Utilisateurs',
    deposits: 'Dépôts',
    transactions: 'Transactions',
    withdrawals: 'Retraits',
    analytics: 'Analyses',
    settings: 'Paramètres',
    resources: 'Ressources',
  }
};

function isActive(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href;
  return pathname.startsWith(href) && href !== '/admin';
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();
  const [showNotif, setShowNotif] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [adminInitials, setAdminInitials] = useState('AD');
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const getAdminLabel = (key: keyof typeof adminTranslations['en']) => {
    return (adminTranslations as any)[language]?.[key] || adminTranslations['en'][key] || key;
  };

  const navItems = [
    { href: '/admin',             icon: LayoutGrid,     labelKey: 'dashboard' as const,   exact: true },
    { href: '/admin/users',        icon: Users,          labelKey: 'users' as const },
    { href: '/admin/deposits',     icon: ArrowDownRight, labelKey: 'deposits' as const },
    { href: '/admin/transactions', icon: CreditCard,     labelKey: 'transactions' as const },
    { href: '/admin/withdrawals',  icon: BarChart3,      labelKey: 'withdrawals' as const },
    { href: '/admin/analytics',    icon: BarChart3,      labelKey: 'analytics' as const },
    { href: '/admin/resources',    icon: FileText,       labelKey: 'resources' as const },
    { href: '/admin/settings',     icon: Settings,       labelKey: 'settings' as const },
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

  // Fetch admin & alerts for layout
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meJson = await meRes.json();
          if (meJson.user.role !== 'admin') {
            router.push('/dashboard');
            return;
          }
          const first = meJson.user.firstName || '';
          const last = meJson.user.lastName || '';
          setAdminName(`${first} ${last}`.trim() || 'Admin');
          setAdminInitials(
            ((first ? first.charAt(0) : '') + (last ? last.charAt(0) : '')) || 'AD'
          );
        } else {
          router.push('/login');
          return;
        }

        const statsRes = await fetch('/api/admin/stats');
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          const pendingCount = statsJson.stats?.pendingWithdrawalsCount || 0;
          const alerts = [];
          if (pendingCount > 0) {
            alerts.push({
              id: 'pending-withdrawals',
              title: t('pendingWithdrawalsAlertTitle') || 'Pending Withdrawals',
              message: `${pendingCount} ${t('pendingWithdrawalsAlertMessage') || 'withdrawal request(s) require review.'}`,
              type: 'alert',
              time: t('needsAction') || 'Needs Action',
            });
          }
          setNotifications(alerts);
        }
      } catch (err) {
        console.error('Error fetching admin layout data:', err);
      }
    };

    loadAdminData();
  }, [pathname, language]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' });
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090f] text-slate-900 dark:text-white relative transition-colors duration-250">
      <BackgroundPattern />

      {/* ── Desktop Top Navbar ─────────────────────────────── */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-14 items-center justify-between px-6 bg-white/80 dark:bg-[#09090f]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5">
        <Link href="/admin" className="flex items-center gap-2 flex-shrink-0">
          <VextaLogo className="w-9 h-9" variant="transparent" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-widest font-sans uppercase">
              {SYSTEM_CONFIG.brand.name}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              {t('adminBadge') || 'Admin'}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-5 relative">
          {/* Language Switcher (Standalone Icon - No container/radius) */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLang(!showLang)}
              className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-all flex items-center justify-center"
              title={t('selectLanguage') || 'Select Language'}
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
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">{t('adminAlerts') || 'Admin Alerts'}</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3.5 transition-all relative flex items-start gap-2.5 bg-red-500/5"
                      >
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-slate-800 dark:text-white truncate">{notif.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                          <span className="text-[8px] text-red-500 font-mono mt-1 block">{notif.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-gray-500 font-mono py-8 text-center">{t('noActiveAlerts') || 'No active alerts.'}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile initials & Logout */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-white/5">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase">
              {adminInitials}
            </div>
            
            {/* Logout (Standalone Icon - No container/radius) */}
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 transition-all flex items-center justify-center"
              title={t('signOut') || 'Sign out'}
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
                title={getAdminLabel(labelKey)}
              >
                <Icon className="w-5 h-5 mb-1 group-hover:scale-105 transition-transform" />
                <span className="text-[8px] font-sans font-medium tracking-wide text-center uppercase scale-90">{getAdminLabel(labelKey)}</span>
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
        <Link href="/admin" className="flex items-center gap-2">
          <VextaLogo className="w-9 h-9" variant="transparent" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-widest font-sans uppercase">
              {SYSTEM_CONFIG.brand.name}
            </span>
            <span className="px-1 py-0.5 rounded text-[7px] font-bold uppercase bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">{t('adminBadge') || 'Admin'}</span>
          </div>
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
                <span className="text-xs font-semibold text-slate-800 dark:text-white">{t('adminAlerts') || 'Admin Alerts'}</span>
              </div>
              <div className="max-h-[240px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3 flex items-start gap-2 relative bg-red-500/5">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-slate-800 dark:text-white truncate">{notif.title}</p>
                        <p className="text-[9px] text-slate-500 dark:text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 font-mono py-6 text-center">{t('noActiveAlerts') || 'No active alerts.'}</p>
                )}
              </div>
            </div>
          )}

          <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase">
            {adminInitials}
          </div>
        </div>
      </header>

      {/* ── Page Content ───────────────────────────────────── */}
      <main className="relative z-10 pt-14 pb-20 md:pb-4 min-h-screen md:pl-20">
        {/* Test Mode Disclaimer Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/25 px-4 py-2 text-center text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2 select-none backdrop-blur-md relative z-20">
          <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse text-amber-500" />
          <span>{t('demoDisclaimerText')}</span>
          <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-amber-500/30">
            {t('demoDisclaimerBadge')}
          </span>
        </div>
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
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[48px] ${
                active ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-gray-600 hover:text-gray-350'
              }`}
            >
              <Icon className={`w-4 h-4 transition-all ${active ? 'scale-110' : ''}`} />
              <span className="text-[8px] font-medium tracking-wide">{getAdminLabel(labelKey)}</span>
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
