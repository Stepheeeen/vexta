export function VextaLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 900" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="900" height="900" fill="#0F1419"/>
      
      {/* Checkmark - Blue */}
      <g opacity="0.9">
        <path d="M200 450 L350 600 L450 400" stroke="#00D9FF" strokeWidth="60" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </g>
      
      {/* Bull Head */}
      <g>
        {/* Head */}
        <ellipse cx="500" cy="380" rx="80" ry="100" fill="#1A3A4A"/>
        {/* Horns */}
        <path d="M460 300 Q420 250 430 180" stroke="#00D9FF" strokeWidth="30" strokeLinecap="round" fill="none"/>
        <path d="M540 300 Q580 250 570 180" stroke="#00D9FF" strokeWidth="30" strokeLinecap="round" fill="none"/>
        {/* Body */}
        <ellipse cx="500" cy="500" rx="60" ry="120" fill="#0F1419" stroke="#00D9FF" strokeWidth="8"/>
        {/* Eyes */}
        <circle cx="480" cy="360" r="8" fill="#00D9FF"/>
      </g>
      
      {/* Arrow - Green */}
      <g>
        <path d="M700 250 L750 550 M750 550 L820 480 M750 550 L680 480" stroke="#00FF88" strokeWidth="50" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Bar chart */}
        <rect x="700" y="500" width="40" height="150" fill="#00FF88"/>
        <rect x="760" y="420" width="40" height="230" fill="#00FF88"/>
        <rect x="820" y="350" width="40" height="300" fill="#00FF88"/>
      </g>
    </svg>
  );
}

export function VextaLogoText() {
  return (
    <div className="flex items-center gap-2">
      <VextaLogo className="h-10 w-10" />
      <span className="text-2xl font-bold text-[#FFFFFF]">VEXTA</span>
    </div>
  );
}
