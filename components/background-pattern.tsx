import React from 'react';

export function BackgroundPattern() {
  const horizontalLines = 16;
  const verticalLines = 24;
  const segments = 40;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Dark background */}
      <div className="absolute inset-0 bg-[#090C10]" />
      <svg 
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800" 
        preserveAspectRatio="xMidYMid slice" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="opacity-[0.07]">
          {/* Horizontal lines (Cyan) */}
          {Array.from({ length: horizontalLines }).map((_, i) => {
            const v = i / (horizontalLines - 1);
            
            let d = '';
            for (let j = 0; j <= segments; j++) {
              const u = j / segments;
              
              const baseX = u * 1600 - 200;
              const baseY = v * 1200 - 200;
              
              const warpX = Math.sin(v * Math.PI * 2) * 80 + Math.cos(u * Math.PI) * 60;
              const warpY = Math.sin(u * Math.PI * 1.5) * 160 + Math.cos(v * Math.PI) * 90;
              
              const x = (baseX + warpX).toFixed(2);
              const y = (baseY + warpY).toFixed(2);
              
              if (j === 0) d += `M ${x} ${y}`;
              else d += ` L ${x} ${y}`;
            }
            
            return (
              <path
                key={`h-${i}`}
                d={d}
                fill="none"
                stroke="#00D9FF"
                strokeWidth={1}
              />
            );
          })}

          {/* Vertical lines (Green) */}
          {Array.from({ length: verticalLines }).map((_, i) => {
            const u = i / (verticalLines - 1);
            
            let d = '';
            for (let j = 0; j <= segments; j++) {
              const v = j / segments;
              
              const baseX = u * 1600 - 200;
              const baseY = v * 1200 - 200;
              
              const warpX = Math.sin(v * Math.PI * 2) * 80 + Math.cos(u * Math.PI) * 60;
              const warpY = Math.sin(u * Math.PI * 1.5) * 160 + Math.cos(v * Math.PI) * 90;
              
              const x = (baseX + warpX).toFixed(2);
              const y = (baseY + warpY).toFixed(2);
              
              if (j === 0) d += `M ${x} ${y}`;
              else d += ` L ${x} ${y}`;
            }
            
            return (
              <path
                key={`v-${i}`}
                d={d}
                fill="none"
                stroke="#00FF88"
                strokeWidth={1}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
