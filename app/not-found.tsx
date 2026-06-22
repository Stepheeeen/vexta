'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation, Language } from '@/components/translation-provider';
import { BackgroundPattern } from '@/components/background-pattern';
import { LanguageSwitcher } from '@/components/language-switcher';
import { VextaLogo } from '@/components/vexta-logo';
import { SYSTEM_CONFIG } from '@/lib/config/system';
import { WifiOff, Terminal, ArrowRight, Home, LayoutDashboard, Cpu, HelpCircle } from 'lucide-react';

const translations: Record<Language, {
  code: string;
  title: string;
  desc: string;
  backDashboard: string;
  goHome: string;
  status: string;
  latency: string;
  nodeId: string;
}> = {
  en: {
    code: "ERROR_CODE: 404_NODE_DISCONNECTED",
    title: "Routing Path Lost",
    desc: "The HFT routing engine was unable to locate the requested endpoint. The node might be offline, decommissioned, or the address path is invalid.",
    backDashboard: "Back to Dashboard",
    goHome: "Platform Home",
    status: "STATUS: OFFLINE",
    latency: "LATENCY: UNSYNCED",
    nodeId: "TARGET_NODE: 0x404_NULL"
  },
  es: {
    code: "CÓDIGO_ERROR: 404_NODO_DESCONECTADO",
    title: "Ruta de Enrutamiento Perdida",
    desc: "El motor de enrutamiento HFT no pudo localizar el punto de conexión solicitado. El nodo podría estar fuera de línea, fuera de servicio o la ruta es inválida.",
    backDashboard: "Volver al Panel",
    goHome: "Inicio de la Plataforma",
    status: "ESTADO: FUERA DE LÍNEA",
    latency: "LATENCIA: DESINCRONIZADA",
    nodeId: "NODO_OBJETIVO: 0x404_NULL"
  },
  vi: {
    code: "MÃ_LỖI: 404_NÚT_MẤT_KẾT_NỐI",
    title: "Mất Đường Truyền Định Tuyến",
    desc: "Công cụ định tuyến HFT không thể tìm thấy điểm cuối được yêu cầu. Nút có thể đang ngoại tuyến, ngừng hoạt động hoặc đường dẫn địa chỉ không hợp lệ.",
    backDashboard: "Quay lại Bảng điều khiển",
    goHome: "Trang chủ Nền tảng",
    status: "TRẠNG THÁI: NGOẠI TUYẾN",
    latency: "ĐỘ TRỄ: MẤT ĐỒNG BỘ",
    nodeId: "NÚT MỤC TIÊU: 0x404_NULL"
  },
  th: {
    code: "รหัสข้อผิดพลาด: 404_โหนดขาดการเชื่อมต่อ",
    title: "เส้นทางการกำหนดเส้นทางสูญหาย",
    desc: "ระบบกำหนดเส้นทาง HFT ไม่พบจุดสิ้นสุดที่ร้องขอ โหนดอาจออฟไลน์ เลิกใช้งาน หรือเส้นทางที่อยู่ไม่ถูกต้อง",
    backDashboard: "กลับสู่แดชบอร์ด",
    goHome: "หน้าแรกแพลตฟอร์ม",
    status: "สถานะ: ออฟไลน์",
    latency: "ความหน่วง: ไม่ซิงค์",
    nodeId: "โหนดเป้าหมาย: 0x404_NULL"
  },
  pt: {
    code: "CÓDIGO_ERRO: 404_NÓ_DESCONECTADO",
    title: "Caminho de Roteamento Perdido",
    desc: "O mecanismo de roteamento HFT não conseguiu localizar o endpoint solicitado. O nó pode estar offline, desativado ou o caminho do endereço é inválido.",
    backDashboard: "Voltar ao Painel",
    goHome: "Início da Plataforma",
    status: "STATUS: OFFLINE",
    latency: "LATÊNCIA: DESINCRONIZADA",
    nodeId: "NÓ ALVO: 0x404_NULL"
  },
  ko: {
    code: "에러_코드: 404_노드_연결_끊김",
    title: "라우팅 경로 유실됨",
    desc: "HFT 라우팅 엔진이 요청된 엔드포인트를 찾을 수 없습니다. 노드가 오프라인이거나 폐기되었거나 주소 경로가 잘못되었을 수 있습니다.",
    backDashboard: "대시보드로 돌아가기",
    goHome: "플랫폼 홈",
    status: "상태: 오프라인",
    latency: "지연 시간: 동기화되지 않음",
    nodeId: "대상 노드: 0x404_NULL"
  },
  fr: {
    code: "CODE_ERREUR: 404_NŒUD_DÉCONNECTÉ",
    title: "Chemin de Routage Perdu",
    desc: "Le moteur de routage HFT n'a pas pu localiser le point de terminaison demandé. Le nœud est peut-être hors ligne, déclassé ou le chemin d'adresse est invalide.",
    backDashboard: "Retour au Tableau de Bord",
    goHome: "Accueil de la Plateforme",
    status: "STATUT: HORS LIGNE",
    latency: "LATENCE: DÉSYNCHRONISÉE",
    nodeId: "NŒUD CIBLE: 0x404_NULL"
  },
  zh: {
    code: "错误代码: 404_节点已断开",
    title: "路由路径丢失",
    desc: "HFT路由引擎无法定位请求的的终点。该节点可能处于离线状态、已停用，或者地址路径无效。",
    backDashboard: "返回仪表板",
    goHome: "平台首页",
    status: "状态: 离线",
    latency: "延迟: 未同步",
    nodeId: "目标节点: 0x404_NULL"
  },
  ar: {
    code: "رمز_الخطأ: 404_العقدة_منفصلة",
    title: "مسار التوجيه مفقود",
    desc: "فشل محرك توجيه HFT في تحديد موقع نقطة النهاية المطلوبة. قد تكون العقدة غير متصلة بالإنترنت، أو خارج الخدمة، أو أن مسار العنوان غير صالح.",
    backDashboard: "العودة إلى لوحة التحكم",
    goHome: "الصفحة الرئيسية للمنصة",
    status: "الحالة: غير متصل",
    latency: "الاستجابة: غير متزامن",
    nodeId: "العقدة المستهدفة: 0x404_NULL"
  },
  ru: {
    code: "КОД_ОШИБКИ: 404_УЗЕЛ_ОТКЛЮЧЕН",
    title: "Путь маршрутизации потерян",
    desc: "Маршрутизатор HFT не смог обнаружить запрошенную конечную точку. Узел может быть отключен, выведен из эксплуатации или указан неверный путь.",
    backDashboard: "Вернуться на панель управления",
    goHome: "Главная страница",
    status: "СТАТУС: ВНЕ СЕТИ",
    latency: "ЗАДЕРЖКА: НЕТ СИНХРОНИЗАЦИИ",
    nodeId: "ЦЕЛЕВОЙ УЗЕЛ: 0x404_NULL"
  },
  hi: {
    code: "त्रुटि_कोड: 404_नोड_डिस्कनेक्टेड",
    title: "राउटिंग पथ खो गया",
    desc: "HFT राउटिंग इंजन अनुरोधित एंडपॉइंट का पता लगाने में असमर्थ था। नोड ऑफ़लाइन हो सकता है, सेवा से हटा दिया गया हो सकता है, या पता पथ अमान्य हो सकता है।",
    backDashboard: "डैशबोर्ड पर वापस जाएं",
    goHome: "प्लेटफ़ॉर्म होम",
    status: "स्थिति: ऑफ़लाइन",
    latency: "विलंबता: सिंक नहीं है",
    nodeId: "लक्षित नोड: 0x404_NULL"
  },
  de: {
    code: "FEHLERCODE: 404_KNOTEN_TRENNUNG",
    title: "Routing-Pfad verloren",
    desc: "Die HFT-Routing-Engine konnte den angeforderten Endpunkt nicht finden. Der Knoten ist möglicherweise offline, außer Betrieb oder der Adresspfad ist ungültig.",
    backDashboard: "Zurück zum Dashboard",
    goHome: "Plattform-Startseite",
    status: "STATUS: OFFLINE",
    latency: "LATENZ: NICHT SYNCHRONISIERT",
    nodeId: "ZIELKNOTEN: 0x404_NULL"
  }
};

export default function NotFound() {
  const { language } = useTranslation();
  const t = translations[language] || translations.en;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F1419] text-slate-900 dark:text-white flex flex-col items-center justify-center relative p-4 transition-colors duration-250 overflow-hidden">
      <BackgroundPattern />
      <LanguageSwitcher />

      {/* Decorative blurred gradients */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-violet-600/10 dark:bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#00D9FF]/10 dark:bg-[#00D9FF]/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Brand logo at the top */}
      <div className="absolute top-8 left-8 z-10 flex flex-col items-center gap-4 w-full md:w-auto md:left-1/2 md:-translate-x-1/2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <VextaLogo className="h-8 w-8" variant="icon-only" />
          <span className="text-xl font-bold tracking-widest text-slate-900 dark:text-white font-sans uppercase">
            {SYSTEM_CONFIG.brand.name}
          </span>
        </Link>
      </div>

      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-500 mt-16">
        <div className="bg-white/80 dark:bg-[#0A0F14]/60 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-2xl p-8 md:p-10 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          
          {/* Animated 404 Node Graphics */}
          <div className="relative flex justify-center mb-8 h-32">
            <svg className="w-64 h-full" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer grid connections */}
              <line x1="20" y1="50" x2="60" y2="25" className="stroke-slate-200 dark:stroke-white/10" strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="20" y1="50" x2="60" y2="75" className="stroke-slate-200 dark:stroke-white/10" strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="180" y1="50" x2="140" y2="25" className="stroke-slate-200 dark:stroke-white/10" strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="180" y1="50" x2="140" y2="75" className="stroke-slate-200 dark:stroke-white/10" strokeWidth="1.5" strokeDasharray="4 2" />

              {/* Main Routing Bridge */}
              <line x1="60" y1="25" x2="100" y2="50" className="stroke-slate-300 dark:stroke-white/20" strokeWidth="2" />
              <line x1="60" y1="75" x2="100" y2="50" className="stroke-red-400/50 dark:stroke-red-500/30" strokeWidth="2" strokeDasharray="5 5" />
              <line x1="140" y1="25" x2="100" y2="50" className="stroke-slate-300 dark:stroke-white/20" strokeWidth="2" />
              <line x1="140" y1="75" x2="100" y2="50" className="stroke-red-400/50 dark:stroke-red-500/30" strokeWidth="2" strokeDasharray="5 5" />

              {/* Inactive connection alert lines */}
              <path d="M 60 25 L 140 25" className="stroke-violet-400/40 dark:stroke-violet-500/20" strokeWidth="1.5" />
              <path d="M 60 75 L 140 75" className="stroke-red-500/40 dark:stroke-red-500/20 animate-pulse" strokeWidth="1.5" />

              {/* Active Side Nodes */}
              <circle cx="60" cy="25" r="5" className="fill-violet-500 dark:fill-[#00D9FF]" />
              <circle cx="60" cy="25" r="10" className="stroke-violet-500/40 dark:stroke-[#00D9FF]/40 animate-ping duration-1000" strokeWidth="1" />

              <circle cx="140" cy="25" r="5" className="fill-violet-500 dark:fill-[#00D9FF]" />
              <circle cx="140" cy="25" r="10" className="stroke-violet-500/40 dark:stroke-[#00D9FF]/40 animate-ping duration-1000" strokeWidth="1" />

              {/* Offline/Warning Nodes */}
              <circle cx="60" cy="75" r="5" className="fill-slate-400 dark:fill-slate-600" />
              <circle cx="140" cy="75" r="5" className="fill-slate-400 dark:fill-slate-600" />

              {/* Center 404 Disconnected Node */}
              <g className="translate-y-[2px]">
                <circle cx="100" cy="50" r="8" className="fill-red-500 dark:fill-red-500/80" />
                <circle cx="100" cy="50" r="16" className="stroke-red-500/30 dark:stroke-red-500/20 animate-ping" strokeWidth="1" />
                <circle cx="100" cy="50" r="24" className="stroke-red-500/10 dark:stroke-red-500/10" strokeWidth="1" />
              </g>
              <foreignObject x="94" y="44" width="12" height="12">
                <WifiOff className="w-3 h-3 text-white" />
              </foreignObject>
            </svg>
          </div>

          {/* Error Tag */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] text-red-500 dark:text-red-400 font-mono uppercase tracking-widest animate-pulse">
              <Terminal className="w-3 h-3" />
              {t.code}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-light text-slate-900 dark:text-[#FFFFFF] mb-3 font-sans tracking-tight text-center">
            {t.title}{' '}
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-violet-600 to-blue-600 dark:from-red-400 dark:via-[#00D9FF] dark:to-[#00FF88]">
              404
            </span>
          </h1>

          {/* Description */}
          <p className="text-slate-500 dark:text-[#808A9D] text-sm mb-8 text-center leading-relaxed max-w-sm mx-auto">
            {t.desc}
          </p>

          {/* Info Dashboard Sandbox Panel */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl mb-8 font-mono text-[9px] text-slate-400 dark:text-slate-400">
            <div className="flex flex-col items-center justify-center p-1.5 text-center">
              <span className="text-[8px] uppercase tracking-wider text-slate-400/60">{t.status.split(": ")[0]}</span>
              <span className="font-semibold text-red-500 mt-0.5">{t.status.split(": ")[1]}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 border-x border-slate-200 dark:border-white/10 text-center">
              <span className="text-[8px] uppercase tracking-wider text-slate-400/60">{t.latency.split(": ")[0]}</span>
              <span className="font-semibold text-amber-500 mt-0.5">{t.latency.split(": ")[1]}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 text-center">
              <span className="text-[8px] uppercase tracking-wider text-slate-400/60">{t.nodeId.split(": ")[0]}</span>
              <span className="font-semibold text-slate-500 mt-0.5">{t.nodeId.split(": ")[1]}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href="/dashboard"
              className="flex-1 px-4 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-100 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden text-sm uppercase font-mono tracking-wider"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.backDashboard}</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/"
              className="px-4 py-3.5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-[#FFFFFF] hover:bg-slate-100 dark:hover:bg-white/5 font-mono text-sm tracking-wider rounded-xl transition-all uppercase flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>{t.goHome}</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
