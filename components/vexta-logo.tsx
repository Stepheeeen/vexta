import Image from 'next/image';

interface VextaLogoProps {
  className?: string;
  /** Pass true when the navbar is over a light background (light mode + scrolled or non-home page).
   *  On mobile only: switches between vexta-dark.png (for dark bg) and vexta-light.png (for light bg).
   *  Desktop always uses logo1.png (the full bull/V mark). */
  isLight?: boolean;
  variant?: 'transparent' | 'light' | 'dark' | 'icon-only';
}

export function VextaLogo({
  className = 'h-[72px] w-auto',
  isLight = false,
  variant,
}: VextaLogoProps) {
  // If variant is icon-only or any of the legacy variants, always show the bull logo (logo1.png)
  const isIconOnly = variant && ['icon-only', 'transparent', 'light', 'dark'].includes(variant);

  if (isIconOnly) {
    return (
      <Image
        src="/logo1.png"
        alt="VEXTA"
        width={1008}
        height={871}
        className={`object-contain ${className}`}
        style={{ width: 'auto', height: 'auto' }}
        priority
      />
    );
  }

  const mobileSrc = isLight ? '/vexta-light.png' : '/vexta-dark.png';
  const mobileWidth = isLight ? 208 : 220; // Matches cropped dimensions at 32px height

  return (
    <>
      {/* Mobile: compact wordmark, adapts to navbar background */}
      <Image
        src={mobileSrc}
        alt="VEXTA"
        width={mobileWidth}
        height={32}
        className={`${className} block lg:hidden max-h-[32px] w-auto object-contain`}
        style={{ width: 'auto', height: 'auto' }}
        priority
      />

      {/* Desktop: full bull/V logo */}
      <Image
        src="/logo1.png"
        alt="VEXTA"
        width={200}
        height={72}
        className={`${className} hidden lg:block`}
        style={{ width: 'auto', height: 'auto' }}
        priority
      />
    </>
  );
}

export function VextaLogoText() {
  return (
    <div className="flex items-center justify-center mb-4">
      <VextaLogo className="w-[180px] h-auto drop-shadow-md" variant="icon-only" />
    </div>
  );
}

