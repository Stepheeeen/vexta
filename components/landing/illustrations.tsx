// Custom SVG illustration components for the Vexta landing page
// Each illustration is a self-contained, themed SVG using the violet/blue palette

import { useTranslation } from '@/components/translation-provider';

export function IllustrationCreateAccount() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background circle */}
      <circle cx="60" cy="60" r="58" fill="url(#bg1)" opacity="0.15" />

      {/* Monitor / card outline */}
      <rect x="20" y="30" width="80" height="52" rx="6" fill="#1a1a2e" stroke="#7c3aed" strokeWidth="1.5" />
      <rect x="20" y="30" width="80" height="10" rx="6" fill="#7c3aed" opacity="0.3" />
      {/* Monitor dots */}
      <circle cx="28" cy="35" r="2" fill="#ef4444" />
      <circle cx="35" cy="35" r="2" fill="#f59e0b" />
      <circle cx="42" cy="35" r="2" fill="#22c55e" />

      {/* Form lines */}
      <rect x="30" y="48" width="60" height="5" rx="2.5" fill="#3730a3" opacity="0.6" />
      <rect x="30" y="58" width="60" height="5" rx="2.5" fill="#3730a3" opacity="0.4" />
      <rect x="30" y="68" width="40" height="5" rx="2.5" fill="#3730a3" opacity="0.4" />

      {/* User avatar ring */}
      <circle cx="85" cy="68" r="10" fill="#7c3aed" opacity="0.2" stroke="#7c3aed" strokeWidth="1.5" />
      <circle cx="85" cy="65" r="4" fill="#a78bfa" />
      <path d="M78 76 Q85 70 92 76" stroke="#a78bfa" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Check badge */}
      <circle cx="95" cy="38" r="10" fill="#7c3aed" />
      <path d="M90 38 L93.5 41.5 L100 35" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Monitor stand */}
      <rect x="52" y="82" width="16" height="6" rx="1" fill="#3730a3" opacity="0.5" />
      <rect x="45" y="87" width="30" height="3" rx="1.5" fill="#3730a3" opacity="0.4" />

      <defs>
        <radialGradient id="bg1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function IllustrationDeposit() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="58" fill="url(#bg2)" opacity="0.12" />

      {/* Wallet body */}
      <rect x="18" y="38" width="74" height="50" rx="8" fill="#1a1a2e" stroke="#7c3aed" strokeWidth="1.5" />
      <rect x="18" y="38" width="74" height="14" rx="8" fill="#7c3aed" opacity="0.25" />

      {/* Coin slot / pocket */}
      <rect x="72" y="52" width="26" height="22" rx="5" fill="#0f0f1a" stroke="#7c3aed" strokeWidth="1.5" opacity="0.9" />
      <circle cx="85" cy="63" r="6" fill="#7c3aed" opacity="0.3" stroke="#a78bfa" strokeWidth="1.5" />
      <text x="82" y="67" fill="#a78bfa" fontSize="8" fontWeight="bold">$</text>

      {/* Card lines inside wallet */}
      <rect x="26" y="60" width="38" height="4" rx="2" fill="#3730a3" opacity="0.6" />
      <rect x="26" y="68" width="25" height="4" rx="2" fill="#3730a3" opacity="0.4" />

      {/* Coins stacked above */}
      <ellipse cx="60" cy="28" rx="14" ry="5" fill="#7c3aed" opacity="0.6" />
      <rect x="46" y="22" width="28" height="6" fill="#7c3aed" opacity="0.4" />
      <ellipse cx="60" cy="22" rx="14" ry="5" fill="#a78bfa" opacity="0.7" />

      {/* Down arrow */}
      <path d="M60 34 L60 40" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
      <path d="M56 38 L60 42 L64 38" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      <defs>
        <radialGradient id="bg2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#2563eb" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function IllustrationEarn() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="58" fill="url(#bg3)" opacity="0.12" />

      {/* Chart base */}
      <rect x="18" y="80" width="84" height="2" rx="1" fill="#3730a3" opacity="0.5" />

      {/* Bar chart */}
      <rect x="28" y="55" width="12" height="25" rx="3" fill="#7c3aed" opacity="0.5" />
      <rect x="46" y="45" width="12" height="35" rx="3" fill="#7c3aed" opacity="0.65" />
      <rect x="64" y="35" width="12" height="45" rx="3" fill="#7c3aed" opacity="0.8" />
      <rect x="82" y="25" width="12" height="55" rx="3" fill="url(#barGrad)" />

      {/* Rising line */}
      <path d="M34 58 L52 47 L70 37 L88 27" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="3 2" />

      {/* Dollar sign badge */}
      <circle cx="88" cy="22" r="12" fill="#7c3aed" />
      <text x="84" y="27" fill="white" fontSize="12" fontWeight="bold">$</text>

      {/* Referral dots */}
      <circle cx="30" cy="96" r="4" fill="#a78bfa" opacity="0.7" />
      <circle cx="42" cy="96" r="4" fill="#a78bfa" opacity="0.55" />
      <circle cx="54" cy="96" r="4" fill="#a78bfa" opacity="0.4" />
      <path d="M34 96 L38 96" stroke="#a78bfa" strokeWidth="1.5" opacity="0.5" />
      <path d="M46 96 L50 96" stroke="#a78bfa" strokeWidth="1.5" opacity="0.5" />

      <defs>
        <radialGradient id="bg3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#2563eb" />
        </radialGradient>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function IllustrationWithdraw() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Card */}
      <rect x="8" y="20" width="64" height="42" rx="7" fill="#1a1a2e" stroke="#eab308" strokeWidth="1.2" />
      <rect x="8" y="20" width="64" height="13" rx="7" fill="#eab308" opacity="0.2" />
      {/* Chip */}
      <rect x="16" y="27" width="10" height="8" rx="2" fill="#eab308" opacity="0.5" />
      {/* Card lines */}
      <rect x="16" y="44" width="30" height="3" rx="1.5" fill="#3730a3" opacity="0.7" />
      <rect x="16" y="50" width="20" height="3" rx="1.5" fill="#3730a3" opacity="0.5" />

      {/* Lightning bolt = fast */}
      <path d="M55 30 L50 42 L54 42 L50 54 L62 38 L57 38 Z" fill="#eab308" opacity="0.9" />
    </svg>
  );
}

export function IllustrationTransparent() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Screen */}
      <rect x="10" y="14" width="60" height="44" rx="5" fill="#1a1a2e" stroke="#7c3aed" strokeWidth="1.2" />
      {/* Top bar */}
      <rect x="10" y="14" width="60" height="8" rx="5" fill="#7c3aed" opacity="0.2" />
      {/* Mini bars inside */}
      <rect x="18" y="30" width="8" height="18" rx="2" fill="#7c3aed" opacity="0.4" />
      <rect x="30" y="24" width="8" height="24" rx="2" fill="#7c3aed" opacity="0.6" />
      <rect x="42" y="18" width="8" height="30" rx="2" fill="#a78bfa" opacity="0.8" />
      <rect x="54" y="28" width="8" height="20" rx="2" fill="#7c3aed" opacity="0.5" />
      {/* Trend line */}
      <path d="M18 35 L30 28 L42 22 L60 26" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Eye = transparency */}
      <ellipse cx="40" cy="66" rx="14" ry="7" fill="#7c3aed" opacity="0.15" stroke="#7c3aed" strokeWidth="1" />
      <circle cx="40" cy="66" r="3.5" fill="#a78bfa" opacity="0.8" />
    </svg>
  );
}

export function IllustrationSecure() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Shield */}
      <path d="M40 12 L62 22 L62 44 C62 57 52 66 40 70 C28 66 18 57 18 44 L18 22 Z" fill="#1a1a2e" stroke="#22c55e" strokeWidth="1.5" />
      <path d="M40 18 L56 26 L56 44 C56 54 48 62 40 65 C32 62 24 54 24 44 L24 26 Z" fill="#22c55e" opacity="0.1" />
      {/* Lock inside */}
      <rect x="32" y="38" width="16" height="12" rx="3" fill="#22c55e" opacity="0.7" />
      <path d="M35 38 L35 34 C35 30 45 30 45 34 L45 38" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="40" cy="43" r="2" fill="#0f0f1a" />
      {/* Key dots */}
      <circle cx="26" cy="20" r="2" fill="#22c55e" opacity="0.4" />
      <circle cx="54" cy="20" r="2" fill="#22c55e" opacity="0.4" />
    </svg>
  );
}

export function IllustrationSupport() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Headphone arc */}
      <path d="M20 42 C20 26 60 26 60 42" stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Left ear cup */}
      <rect x="14" y="40" width="12" height="18" rx="5" fill="#1a1a2e" stroke="#3b82f6" strokeWidth="1.5" />
      <rect x="16" y="44" width="8" height="10" rx="3" fill="#3b82f6" opacity="0.3" />
      {/* Right ear cup */}
      <rect x="54" y="40" width="12" height="18" rx="5" fill="#1a1a2e" stroke="#3b82f6" strokeWidth="1.5" />
      <rect x="56" y="44" width="8" height="10" rx="3" fill="#3b82f6" opacity="0.3" />
      {/* Mic arm */}
      <path d="M54 56 L54 64 L48 68" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="46" cy="68" r="3" fill="#3b82f6" opacity="0.7" />
      {/* Sound waves */}
      <path d="M36 33 Q40 30 44 33" stroke="#3b82f6" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M33 36 Q40 31 47 36" stroke="#3b82f6" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export function IllustrationNetwork() {
  return (
    <svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Root node */}
      <circle cx="70" cy="18" r="10" fill="#7c3aed" opacity="0.9" />
      <circle cx="70" cy="18" r="6" fill="#a78bfa" />

      {/* Level 1 nodes */}
      <line x1="70" y1="28" x2="35" y2="48" stroke="#7c3aed" strokeWidth="1.5" opacity="0.5" />
      <line x1="70" y1="28" x2="105" y2="48" stroke="#7c3aed" strokeWidth="1.5" opacity="0.5" />
      <circle cx="35" cy="52" r="9" fill="#5b21b6" opacity="0.8" />
      <circle cx="35" cy="52" r="5" fill="#8b5cf6" />
      <circle cx="105" cy="52" r="9" fill="#5b21b6" opacity="0.8" />
      <circle cx="105" cy="52" r="5" fill="#8b5cf6" />

      {/* Level 2 nodes */}
      <line x1="35" y1="61" x2="18" y2="76" stroke="#7c3aed" strokeWidth="1" opacity="0.4" />
      <line x1="35" y1="61" x2="52" y2="76" stroke="#7c3aed" strokeWidth="1" opacity="0.4" />
      <line x1="105" y1="61" x2="88" y2="76" stroke="#7c3aed" strokeWidth="1" opacity="0.4" />
      <line x1="105" y1="61" x2="122" y2="76" stroke="#7c3aed" strokeWidth="1" opacity="0.4" />
      <circle cx="18" cy="79" r="7" fill="#3730a3" opacity="0.7" />
      <circle cx="52" cy="79" r="7" fill="#3730a3" opacity="0.7" />
      <circle cx="88" cy="79" r="7" fill="#3730a3" opacity="0.7" />
      <circle cx="122" cy="79" r="7" fill="#3730a3" opacity="0.7" />

      {/* Pulsing outer rings on root */}
      <circle cx="70" cy="18" r="14" stroke="#7c3aed" strokeWidth="1" opacity="0.3" />
      <circle cx="70" cy="18" r="18" stroke="#7c3aed" strokeWidth="0.5" opacity="0.15" />

      {/* Commission labels */}
      <text x="74" y="22" fill="#c4b5fd" fontSize="6" fontWeight="bold">10%</text>
      <text x="38" y="54" fill="#c4b5fd" fontSize="5">5%</text>
      <text x="108" y="54" fill="#c4b5fd" fontSize="5">5%</text>
      <text x="8" y="81" fill="#818cf8" fontSize="4.5">3%</text>
      <text x="43" y="81" fill="#818cf8" fontSize="4.5">3%</text>
      <text x="78" y="81" fill="#818cf8" fontSize="4.5">3%</text>
      <text x="113" y="81" fill="#818cf8" fontSize="4.5">3%</text>
    </svg>
  );
}

export function IllustrationHeroChart() {
  const { t } = useTranslation();
  return (
    <svg viewBox="0 0 500 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Card background */}
      <rect x="10" y="10" width="480" height="300" rx="16" fill="#0f0f1e" stroke="#7c3aed" strokeWidth="1" opacity="0.6" />

      {/* Header bar */}
      <rect x="10" y="10" width="480" height="50" rx="16" fill="#7c3aed" opacity="0.12" />
      <text x="32" y="40" fill="#a78bfa" fontSize="14" fontWeight="600">{t("illusPortfolioOverview")}</text>
      <rect x="380" y="25" width="90" height="22" rx="6" fill="#7c3aed" opacity="0.3" />
      <text x="394" y="40" fill="#a78bfa" fontSize="10">+24.8% ↑</text>

      {/* Grid lines */}
      <line x1="32" y1="80" x2="468" y2="80" stroke="#ffffff" strokeWidth="0.5" opacity="0.05" />
      <line x1="32" y1="120" x2="468" y2="120" stroke="#ffffff" strokeWidth="0.5" opacity="0.05" />
      <line x1="32" y1="160" x2="468" y2="160" stroke="#ffffff" strokeWidth="0.5" opacity="0.05" />
      <line x1="32" y1="200" x2="468" y2="200" stroke="#ffffff" strokeWidth="0.5" opacity="0.05" />

      {/* Area fill */}
      <path
        d="M32 240 L32 210 C80 200 110 180 150 160 C190 140 210 130 250 110 C290 90 320 95 360 80 C390 68 430 72 468 60 L468 240 Z"
        fill="url(#areaGrad)"
        opacity="0.3"
      />

      {/* Main line */}
      <path
        d="M32 210 C80 200 110 180 150 160 C190 140 210 130 250 110 C290 90 320 95 360 80 C390 68 430 72 468 60"
        stroke="url(#lineGrad)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Data points */}
      <circle cx="150" cy="160" r="4" fill="#a78bfa" />
      <circle cx="250" cy="110" r="4" fill="#a78bfa" />
      <circle cx="360" cy="80" r="5" fill="white" stroke="#7c3aed" strokeWidth="2" />
      {/* Tooltip on last point */}
      <rect x="330" y="54" width="72" height="22" rx="5" fill="#7c3aed" opacity="0.9" />
      <text x="342" y="69" fill="white" fontSize="10" fontWeight="600">$2,840</text>

      {/* Bottom stats row */}
      <rect x="32" y="258" width="130" height="38" rx="8" fill="#ffffff" opacity="0.03" />
      <text x="44" y="272" fill="#6b7280" fontSize="8" fontWeight="500">{t("illusTotalInv")}</text>
      <text x="44" y="288" fill="white" fontSize="14" fontWeight="700">$12,400</text>

      <rect x="176" y="258" width="130" height="38" rx="8" fill="#ffffff" opacity="0.03" />
      <text x="188" y="272" fill="#6b7280" fontSize="8" fontWeight="500">{t("illusDailyRet")}</text>
      <text x="188" y="288" fill="#4ade80" fontSize="14" fontWeight="700">+$248.00</text>

      <rect x="320" y="258" width="130" height="38" rx="8" fill="#ffffff" opacity="0.03" />
      <text x="332" y="272" fill="#6b7280" fontSize="8" fontWeight="500">{t("illusRefEarn")}</text>
      <text x="332" y="288" fill="#a78bfa" fontSize="14" fontWeight="700">$1,320</text>

      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
