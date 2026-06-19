'use client';

import Image from 'next/image';
import { SYSTEM_CONFIG } from '@/lib/config/system';

/**
 * VextaLogo — renders the official Vexta brand mark (logo1.png).
 *
 * The image has a transparent background and works on both
 * dark and light surfaces without any additional wrapper.
 *
 * @param className  Tailwind sizing class, e.g. "h-8 w-8" or "h-10 w-auto"
 * @param variant    Legacy prop — kept for API compatibility, has no visual effect.
 *                   The transparent PNG works universally.
 */
interface LogoProps {
  className?: string;
  variant?: 'transparent' | 'light' | 'dark' | 'icon-only';
}

export function VextaLogo({ className = 'w-auto h-12', variant }: LogoProps) {
  // If a custom external logo URL is configured in env, honour it.
  const src = SYSTEM_CONFIG.brand.logoUrl || '/logo1.png';

  return (
    <Image
      src={src}
      alt={`${SYSTEM_CONFIG.brand.name} logo`}
      width={1008}
      height={871}
      className={`object-contain ${className}`}
      priority={false}
    />
  );
}

/** Convenience alias — renders the logo at favicon size. */
export function VextaLogoFavicon({ className = 'h-16 w-16' }: { className?: string }) {
  return <VextaLogo className={className} />;
}

/** Legacy named export — light surface (transparent PNG adapts automatically). */
export function VextaLogoLight({ className = 'h-8 w-8' }: { className?: string }) {
  return <VextaLogo className={className} />;
}

/** Legacy named export — dark surface (transparent PNG adapts automatically). */
export function VextaLogoDark({ className = 'h-8 w-8' }: { className?: string }) {
  return <VextaLogo className={className} />;
}

/**
 * Used for Login/Registration pages where a large logo is needed.
 */
export function VextaLogoText() {
  return (
    <div className="flex items-center justify-center mb-4">
      <VextaLogo className="w-[180px] h-auto drop-shadow-md" />
    </div>
  );
}
