'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation, Language } from '@/components/translation-provider';
import { Check, ChevronDown } from 'lucide-react';

const flags: Record<string, string> = {
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
  de: '🇩🇪',
};

const langNames: Record<string, string> = {
  en: 'English',
  es: 'Español',
  vi: 'Tiếng Việt',
  th: 'ภาษาไทย',
  pt: 'Português',
  ko: '한국어',
  fr: 'Français',
  zh: '中文',
  ar: 'العربية',
  ru: 'Русский',
  hi: 'हिन्दी',
  de: 'Deutsch',
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
    // Listen to both mousedown and touchstart to ensure maximum reliability across all mobile browsers/Android
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, []);

  // Safe fallback if language is not in flags
  const currentFlag = flags[language] || '🇺🇸';
  const currentName = langNames[language] || 'English';

  return (
    <div className="fixed top-6 right-6 z-[9999]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/95 dark:bg-[#1A1F2E]/95 border border-slate-200/80 dark:border-[#00D9FF]/40 backdrop-blur-md shadow-lg text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-[#1f2638] transition-all text-xs font-mono select-none min-h-[44px] min-w-[44px]"
        title="Select Language"
      >
        <span className="text-base select-none">{currentFlag}</span>
        <span className="hidden sm:inline font-sans font-medium">{currentName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 max-h-[320px] overflow-y-auto bg-white/95 dark:bg-[#0A0F14]/95 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[9999] font-sans divide-y divide-slate-100 dark:divide-white/5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
          <div className="py-1.5">
            {(Object.keys(flags) as Array<Language>).map((lang) => (
              <button
                type="button"
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left hover:bg-slate-100 dark:hover:bg-white/5 transition-all min-h-[44px] cursor-pointer ${
                  language === lang 
                    ? 'text-violet-600 dark:text-violet-400 bg-violet-500/5' 
                    : 'text-slate-700 dark:text-gray-300'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-base select-none">{flags[lang]}</span>
                  <span className="font-sans font-semibold">{langNames[lang]}</span>
                </span>
                {language === lang && <Check className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
