'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/components/translation-provider';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';

interface TourStep {
  targetId: string;
  titles: Record<string, string>;
  descriptions: Record<string, string>;
}

export function WelcomeTour() {
  const { language } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    {
      targetId: 'tour-metrics',
      titles: {
        en: 'Account Assets Overview',
        es: 'Resumen de Activos de la Cuenta',
        vi: 'Tổng quan Tài sản Tài khoản',
      },
      descriptions: {
        en: 'Track your available balance, active investments, ROI earned, and referral commissions in real time.',
        es: 'Monitoree su saldo disponible, inversiones activas, ROI obtenido y comisiones de referidos en tiempo real.',
        vi: 'Theo dõi số dư khả dụng, khoản đầu tư hoạt động, ROI kiếm được và hoa hồng giới thiệu trong thời gian thực.',
      }
    },
    {
      targetId: 'tour-simulation',
      titles: {
        en: 'Simulation Control Room',
        es: 'Consola de Simulación',
        vi: 'Phòng điều khiển Mô phỏng',
      },
      descriptions: {
        en: 'Add virtual funds, invest in plans, trigger daily yield, or perform resets to test the MLM ecosystem safely.',
        es: 'Agregue fondos virtuales, invierta en planes, active el rendimiento diario o reinicie para probar el ecosistema MLM de forma segura.',
        vi: 'Thêm tiền ảo, đầu tư vào gói, kích hoạt lợi suất hàng ngày hoặc đặt lại để thử nghiệm hệ sinh thái MLM một cách an toàn.',
      }
    },
    {
      targetId: 'tour-positions',
      titles: {
        en: 'Live Arbitrage Positions',
        es: 'Posiciones de Arbitraje en Vivo',
        vi: 'Vị thế Chênh lệch giá Trực tiếp',
      },
      descriptions: {
        en: 'View your running arbitrage yield contracts and monitor active profit generations.',
        es: 'Vea sus contratos de rendimiento de arbitraje en ejecución y monitoree las ganancias activas.',
        vi: 'Xem hợp đồng sinh lời chênh lệch giá đang chạy và theo dõi lợi nhuận thực tế.',
      }
    },
    {
      targetId: 'tour-referrals',
      titles: {
        en: 'Referral & Network Tree',
        es: 'Enlace y Red de Referidos',
        vi: 'Liên kết & Mạng lưới Giới thiệu',
      },
      descriptions: {
        en: 'Copy your unique code to build your upline and downlines. Supports up to 16 levels of commission distribution.',
        es: 'Copie su código único para construir su red de referidos. Admite hasta 16 niveles de distribución de comisiones.',
        vi: 'Sao chép mã duy nhất của bạn để xây dựng mạng lưới giới thiệu. Hỗ trợ phân phối hoa hồng lên đến 16 cấp.',
      }
    }
  ];

  useEffect(() => {
    // Check local storage or check event triggers
    const completed = localStorage.getItem('vexta_tour_completed');
    const triggerReplay = localStorage.getItem('vexta_tour_replay_trigger');
    
    if (completed !== 'true' || triggerReplay === 'true') {
      // Add a slight delay for dashboard loading transitions
      const timer = setTimeout(() => {
        setIsOpen(true);
        setCurrentStep(0);
        localStorage.removeItem('vexta_tour_replay_trigger');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateCoordinates = () => {
    if (!isOpen || currentStep >= steps.length) return;
    const target = document.getElementById(steps[currentStep].targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Calculate coordinates after scrolling completes or immediately
      setTimeout(() => {
        const rect = target.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }, 250);
    } else {
      // If element not on screen, display popover in center of screen
      setCoords(null);
    }
  };

  useEffect(() => {
    updateCoordinates();
    window.addEventListener('resize', updateCoordinates);
    window.addEventListener('scroll', updateCoordinates);
    return () => {
      window.removeEventListener('resize', updateCoordinates);
      window.removeEventListener('scroll', updateCoordinates);
    };
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const currentData = steps[currentStep];
  const langKey = ['en', 'es', 'vi'].includes(language) ? language : 'en';
  const title = currentData.titles[langKey] || currentData.titles.en;
  const description = currentData.descriptions[langKey] || currentData.descriptions.en;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('vexta_tour_completed', 'true');
  };

  // Coordinates calculation for masks
  const maskTop = coords ? coords.top : 0;
  const maskLeft = coords ? coords.left : 0;
  const maskWidth = coords ? coords.width : 0;
  const maskHeight = coords ? coords.height : 0;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-x-hidden">
      {/* Semi-transparent masks highlighting the targeted element */}
      {coords ? (
        <>
          {/* Top Mask */}
          <div
            className="absolute inset-x-0 top-0 bg-black/60 backdrop-blur-[2px] transition-all duration-300 pointer-events-auto"
            style={{ height: `${maskTop}px` }}
          />
          {/* Bottom Mask */}
          <div
            className="absolute inset-x-0 bg-black/60 backdrop-blur-[2px] transition-all duration-300 pointer-events-auto"
            style={{ top: `${maskTop + maskHeight}px`, height: `calc(100% - ${maskTop + maskHeight}px)` }}
          />
          {/* Left Mask */}
          <div
            className="absolute left-0 bg-black/60 backdrop-blur-[2px] transition-all duration-300 pointer-events-auto"
            style={{ top: `${maskTop}px`, height: `${maskHeight}px`, width: `${maskLeft}px` }}
          />
          {/* Right Mask */}
          <div
            className="absolute right-0 bg-black/60 backdrop-blur-[2px] transition-all duration-300 pointer-events-auto"
            style={{ top: `${maskTop}px`, height: `${maskHeight}px`, left: `${maskLeft + maskWidth}px` }}
          />
          {/* Glowing Cutout Border Overlay */}
          <div
            className="absolute border-2 border-cyan-500/80 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse transition-all duration-300 pointer-events-none"
            style={{
              top: `${maskTop - 4}px`,
              left: `${maskLeft - 4}px`,
              width: `${maskWidth + 8}px`,
              height: `${maskHeight + 8}px`,
            }}
          />
        </>
      ) : (
        // Plain full screen dim mask if no element coordinates match
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px] pointer-events-auto" />
      )}

      {/* Popover Card */}
      <div
        ref={popoverRef}
        className="absolute transition-all duration-300 pointer-events-auto w-[92vw] max-w-[420px]"
        style={
          coords
            ? {
                top: `${maskTop + maskHeight + 16}px`,
                left: `min(calc(100vw - 440px), max(16px, ${maskLeft + maskWidth / 2 - 210}px))`,
                // Ensure popover handles viewports where element is close to the bottom
                ...(maskTop + maskHeight + 300 > window.innerHeight + window.scrollY && {
                  top: `${maskTop - 270}px`,
                }),
              }
            : {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }
        }
      >
        <div className="bg-[#0D1520]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] text-white relative overflow-hidden group">
          {/* Futuristic ambient corner light */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                System Guide ({currentStep + 1}/{steps.length})
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Description */}
          <h3 className="text-base font-bold text-white tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed font-sans mb-5">
            {description}
          </p>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-3.5 border-t border-white/5">
            {/* Step Indicators */}
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'w-4 bg-cyan-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <ArrowLeft className="w-3 h-3" />
                  {language === 'vi' ? 'Quay lại' : language === 'es' ? 'Atrás' : 'Back'}
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 hover:brightness-110 shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all"
              >
                {currentStep === steps.length - 1 ? (
                  language === 'vi' ? 'Hoàn thành' : language === 'es' ? 'Finalizar' : 'Finish'
                ) : (
                  <>
                    {language === 'vi' ? 'Tiếp tục' : language === 'es' ? 'Siguiente' : 'Next'}
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
