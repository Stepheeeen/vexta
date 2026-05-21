'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation, Language } from '@/components/translation-provider';
import { Check } from 'lucide-react';

const flags: Record<string, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  vi: '🇻🇳',
  th: '🇹🇭',
  pt: '🇵🇹',
  ko: '🇰🇷',
  fr: '🇫🇷',
};

const langNames: Record<string, string> = {
  en: 'English',
  es: 'Español',
  vi: 'Tiếng Việt',
  th: 'ภาษาไทย',
  pt: 'Português',
  ko: '한국어',
  fr: 'Français',
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(event: Event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, []);

  return (
    <div className="fixed top-6 right-6 z-50" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-[#1A1F2E]/80 border border-slate-200 dark:border-[#00D9FF]/30 backdrop-blur-md shadow-sm text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#1A1F2E] transition-all text-xs font-mono"
        title="Select Language"
      >
        <span className="text-base select-none">{flags[language]}</span>
        <span className="hidden sm:inline font-sans">{langNames[language]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#0A0F14]/95 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden font-sans">
          <div className="py-1">
            {(Object.keys(flags) as Array<Language>).map((lang) => (
              <button
                type="button"
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-slate-100 dark:hover:bg-white/5 transition-all ${
                  language === lang ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-gray-300'
                }`}
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
  );
}
