'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { FileText, Video, Presentation, Globe, Download, Search, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/components/translation-provider';

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  fileType: 'pdf' | 'video' | 'presentation' | 'business_explanation' | 'marketing';
  language: 'en' | 'es' | 'vi' | 'pt' | 'ko' | 'fr';
  size: string;
}

export default function ResourcesPage() {
  const { t } = useTranslation();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    async function fetchResources() {
      try {
        const res = await fetch('/api/resources');
        if (res.ok) {
          const data = await res.json();
          setResources(data.resources || []);
        }
      } catch (err) {
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  const fileTypes = [
    { value: 'all', label: t('resAllFiles') },
    { value: 'business_explanation', label: t('resBusinessExplainers') },
    { value: 'pdf', label: t('resPdfGuides') },
    { value: 'presentation', label: t('resPresentations') },
    { value: 'video', label: t('resVideos') },
    { value: 'marketing', label: t('resMarketingMedia') }
  ];

  const languages = [
    { value: 'all', label: t('resAllLanguages') },
    { value: 'en', label: 'English 🇺🇸' },
    { value: 'es', label: 'Español 🇪🇸' },
    { value: 'vi', label: 'Tiếng Việt 🇻🇳' },
    { value: 'pt', label: 'Português 🇵🇹' },
    { value: 'ko', label: '한국어 🇰🇷' },
    { value: 'fr', label: 'Français 🇫🇷' }
  ];

  const filteredResources = resources.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    const matchesLang = selectedLanguage === 'all' || item.language === selectedLanguage;
    const matchesType = selectedType === 'all' || item.fileType === selectedType;
    return matchesSearch && matchesLang && matchesType;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-indigo-500" />;
      case 'presentation':
        return <Presentation className="w-5 h-5 text-amber-500" />;
      default:
        return <FileText className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getLangBadge = (lang: string) => {
    const found = languages.find(l => l.value === lang);
    return found ? found.label.split(' ')[1] || '🌐' : '🌐';
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em] mb-1">
          {t('materials') || 'Marketing Materials'}
        </p>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
          {t('materials') || 'Materials & Downloads'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-xl">
          {t('materialsDesc') || 'Access official guides, marketing presentation slides, videos and promotional resources in multiple languages.'}
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-4 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder={t('resSearchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-white/8 rounded-xl bg-slate-50 dark:bg-white/3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-white/5 transition-all"
            />
          </div>

          {/* Languages Selector Tabs */}
          <div className="flex flex-wrap gap-1.5 justify-start w-full md:w-auto">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => setSelectedLanguage(lang.value)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium font-mono border transition-all ${
                  selectedLanguage === lang.value
                    ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 dark:bg-white/3 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Selector Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
          {fileTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedType === type.value
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-50 dark:bg-white/2 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-gray-400'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="min-h-[250px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-white/2 rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
          <FileText className="w-10 h-10 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600 dark:text-gray-400 font-mono">
            {t('noFiles') || 'No files matching criteria found'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:border-violet-500/30 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md group"
            >
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl flex-shrink-0">
                    {getFileIcon(item.fileType)}
                  </div>
                  <span className="text-[14px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 font-mono select-none">
                    {getLangBadge(item.language)} {item.language.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white leading-tight group-hover:text-violet-500 transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 dark:text-gray-500">
                  {item.size || t('resUnknownSize')}
                </span>
                <a
                  href={item.url}
                  download
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('download') || 'Download'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
