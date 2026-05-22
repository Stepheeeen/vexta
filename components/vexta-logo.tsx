import React from 'react';
import { SYSTEM_CONFIG } from '@/lib/config/system';

interface LogoProps {
  className?: string;
  variant?: 'transparent' | 'light' | 'dark' | 'icon-only';
}

export function VextaLogo({ className = "h-8 w-8", variant = "transparent" }: LogoProps) {
  // If a custom logo image URL is configured, use it instead of the default SVG
  if (SYSTEM_CONFIG.brand.logoUrl) {
    return (
      <img 
        src={SYSTEM_CONFIG.brand.logoUrl} 
        className={className} 
        alt={SYSTEM_CONFIG.brand.name} 
      />
    );
  }

  const bgClass = 
    variant === 'dark' ? 'bg-[#090C10] p-1 rounded-xl' :
    variant === 'light' ? 'bg-white p-1 rounded-xl border border-slate-200' :
    '';

  const svgElement = (
    <svg 
      viewBox="0 0 200 200" 
      className={variant === 'transparent' ? className : "w-full h-full"} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Cyan/Blue Left Leg Gradient */}
        <linearGradient id="leftLegGrad" x1="40" y1="40" x2="110" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00D9FF" />
          <stop offset="100%" stopColor="#005B94" />
        </linearGradient>
        
        {/* Green/Emerald Trend Arrow Gradient */}
        <linearGradient id="arrowGrad" x1="100" y1="140" x2="170" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#008060" />
          <stop offset="50%" stopColor="#00FF88" />
          <stop offset="100%" stopColor="#05FFA6" />
        </linearGradient>

        {/* Bull Metallic Gradient */}
        <linearGradient id="bullGrad" x1="90" y1="50" x2="130" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7F9AA5" />
          <stop offset="50%" stopColor="#2E4A56" />
          <stop offset="100%" stopColor="#0A1820" />
        </linearGradient>
      </defs>

      {/* ── Left branch of "V" (Cyan/Blue Ribbon) ──────────────────────── */}
      <path 
        d="M 35 55 L 58 55 L 100 135 L 85 147 Z M 85 147 L 100 135 L 108 135 L 94 147 Z" 
        fill="url(#leftLegGrad)" 
      />
      <path 
        d="M 35 55 L 100 135 L 93 147 L 30 65 Z" 
        fill="url(#leftLegGrad)" 
        opacity="0.85"
      />

      {/* ── Center: Stylized Bull Head & Body Silhouette ──────────────── */}
      <g id="bull-silhouette">
        {/* Hump and neck back line */}
        <path 
          d="M 75 75 Q 85 70 95 85 Q 105 100 100 115 L 90 120 Z" 
          fill="url(#bullGrad)" 
        />
        {/* Head profile */}
        <path 
          d="M 98 85 Q 108 72 125 78 Q 128 85 125 90 Q 120 95 110 93 L 105 102 Z" 
          fill="url(#bullGrad)" 
        />
        {/* Left horn pointing forward/up */}
        <path 
          d="M 112 79 Q 125 65 130 55 Q 120 62 110 77 Z" 
          fill="#00D9FF" 
        />
        {/* Right horn behind */}
        <path 
          d="M 106 75 Q 118 60 122 52 Q 114 59 104 73 Z" 
          fill="#005B94" 
          opacity="0.7"
        />
        {/* Eye glow (cyan) */}
        <circle cx="115" cy="82" r="2.2" fill="#00D9FF" />
        
        {/* Strong shoulder/chest shadow detail */}
        <path 
          d="M 95 85 L 100 115 L 88 120 Z" 
          fill="#0F1419" 
          opacity="0.3" 
        />
      </g>

      {/* ── Right branch: Dynamic Arrow and Growing Bar Chart ────────── */}
      <g id="growth-chart">
        {/* Main trend arrow line */}
        <path 
          d="M 92 135 L 165 48" 
          stroke="url(#arrowGrad)" 
          strokeWidth="11" 
          strokeLinecap="round" 
        />
        {/* Arrow head */}
        <path 
          d="M 152 44 L 170 42 L 166 60 Z" 
          fill="#05FFA6" 
        />

        {/* Bar Chart bars rising vertically along the diagonal path */}
        {/* Bar 1 */}
        <rect 
          x="115" 
          y="110" 
          width="8" 
          height="22" 
          rx="1.5" 
          fill="#00FF88" 
          opacity="0.6" 
        />
        {/* Bar 2 */}
        <rect 
          x="127" 
          y="95" 
          width="8" 
          height="37" 
          rx="1.5" 
          fill="#00FF88" 
          opacity="0.75" 
        />
        {/* Bar 3 */}
        <rect 
          x="139" 
          y="80" 
          width="8" 
          height="52" 
          rx="1.5" 
          fill="#00FF88" 
          opacity="0.9" 
        />
        {/* Bar 4 */}
        <rect 
          x="151" 
          y="65" 
          width="8" 
          height="67" 
          rx="1.5" 
          fill="#05FFA6" 
        />
      </g>
    </svg>
  );

  if (variant === 'transparent') {
    return svgElement;
  }

  return (
    <div className={`${bgClass} ${className} flex items-center justify-center`}>
      {svgElement}
    </div>
  );
}

// Transparent Favicon / Icon-only version
export function VextaLogoFavicon({ className = "h-16 w-16" }: { className?: string }) {
  return <VextaLogo className={className} variant="transparent" />;
}

// Light theme specific container logo
export function VextaLogoLight({ className = "h-8 w-8" }: { className?: string }) {
  return <VextaLogo className={className} variant="light" />;
}

// Dark theme specific container logo (matching original upload)
export function VextaLogoDark({ className = "h-8 w-8" }: { className?: string }) {
  return <VextaLogo className={className} variant="dark" />;
}

// Logo with VEXTA Title text that adapts dynamically to dark/light theme
export function VextaLogoText() {
  return (
    <div className="flex items-center gap-2">
      <VextaLogo className="h-10 w-10" />
      <span className="text-2xl font-bold text-slate-900 dark:text-[#FFFFFF] tracking-widest font-sans">
        {SYSTEM_CONFIG.brand.name.toUpperCase()}
      </span>
    </div>
  );
}
