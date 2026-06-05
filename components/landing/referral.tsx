'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';

import { useTranslation } from '@/components/translation-provider';

export function ReferralSystem() {
  const { t } = useTranslation();

  const levels = [
    { level: 1, commission: '10%', labelKey: 'referralLvl1Label', descKey: 'referralLvl1Desc', width: 'w-full', color: 'bg-violet-500', textColor: 'text-violet-600' },
    { level: 2, commission: '5%', labelKey: 'referralLvl2Label', descKey: 'referralLvl2Desc', width: 'w-[90%]', color: 'bg-violet-400', textColor: 'text-violet-500' },
    { level: 3, commission: '3%', labelKey: 'referralLvl3Label', descKey: 'referralLvl3Desc', width: 'w-[80%]', color: 'bg-blue-500', textColor: 'text-blue-600' },
    { level: 4, commission: '2%', labelKey: 'referralLvl4Label', descKey: 'referralLvl4Desc', width: 'w-[70%]', color: 'bg-blue-400', textColor: 'text-blue-500' },
    { level: 5, commission: '1.5%', labelKey: 'referralLvl5Label', descKey: 'referralLvl5Desc', width: 'w-[60%]', color: 'bg-indigo-400', textColor: 'text-indigo-600' },
    { level: 6, commission: '1.5%', labelKey: 'referralLvl6Label', descKey: 'referralLvl6Desc', width: 'w-[55%]', color: 'bg-indigo-400', textColor: 'text-indigo-600' },
    { level: 7, commission: '1%', labelKey: 'referralLvl7Label', descKey: 'referralLvl7Desc', width: 'w-[50%]', color: 'bg-indigo-400', textColor: 'text-indigo-600' },
    { level: 8, commission: '1%', labelKey: 'referralLvl8Label', descKey: 'referralLvl8Desc', width: 'w-[45%]', color: 'bg-indigo-400', textColor: 'text-indigo-600' },
    { level: 9, commission: '1%', labelKey: 'referralLvl9Label', descKey: 'referralLvl9Desc', width: 'w-[40%]', color: 'bg-indigo-400', textColor: 'text-indigo-600' },
    { level: 10, commission: '1%', labelKey: 'referralLvl10Label', descKey: 'referralLvl10Desc', width: 'w-[35%]', color: 'bg-indigo-400', textColor: 'text-indigo-600' },
    { level: 11, commission: '1%', labelKey: 'referralLvl11Label', descKey: 'referralLvl11Desc', width: 'w-[30%]', color: 'bg-indigo-400', textColor: 'text-indigo-600' },
    { level: 12, commission: '1%', labelKey: 'referralLvl12Label', descKey: 'referralLvl12Desc', width: 'w-[25%]', color: 'bg-indigo-400', textColor: 'text-indigo-600' },
    { level: 13, commission: '1%', labelKey: 'referralLvl13Label', descKey: 'referralLvl13Desc', width: 'w-[20%]', color: 'bg-indigo-400', textColor: 'text-indigo-600' },
  ];
  return (
    <section id="referral" className="py-24 bg-slate-50 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-3">{t('referralSubtitle')}</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              {t('referralTitle1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
                {t('referralTitleHighlight')}
              </span>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              {t('referralDescription')}
            </p>

            <div className="space-y-3 mb-10">
              {[
                t('referralBullet1'),
                t('referralBullet2'),
                t('referralBullet3'),
                t('referralBullet4'),
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                  </div>
                  <span className="text-slate-600 text-sm">{point}</span>
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-md shadow-violet-600/15 group"
            >
              <Users className="w-4 h-4" />
              {t('referralStartBuilding')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right: Visual */}
          <div className="bg-white border border-slate-200 shadow-sm shadow-slate-100/50 rounded-2xl p-8">
            {/* Network illustration */}
            <div className="mb-6 rounded-xl bg-slate-50 border border-slate-100 p-4 h-48 flex items-center justify-center overflow-hidden">
              <Image
                src="/illustrations/analytics.svg"
                alt="Network referral analytics illustration"
                width={320}
                height={180}
                className="w-full object-contain"
                style={{ height: 'auto' }}
              />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">{t('referralBreakdown')}</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {levels.map(({ level, commission, labelKey, descKey, width, color, textColor }) => (
                <div key={level} className="group/row">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-12">{t("refLevelLabel")} {level}</span>
                      <div>
                        <span className="text-sm font-medium text-slate-800 block">
                          {t(labelKey).startsWith('referralLvl')
                            ? `${t('referralLevel')} ${level}`
                            : t(labelKey)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {t(descKey).startsWith('referralLvl')
                            ? `${level} ${t('referralDegreesDesc')}`
                            : t(descKey)}
                        </span>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${textColor}`}>{commission}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} ${width} rounded-full transition-all duration-500 group-hover/row:opacity-100 opacity-70`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">{t('referralTotalComm')}</span>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">20%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
