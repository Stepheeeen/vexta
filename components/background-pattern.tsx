import React from 'react';

export function BackgroundPattern() {
  const lines = 12;
  const spacing = 18;
  const strokeWidth = 2;

  const R1 = 150;
  const R2 = 120;
  const R3 = 180;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#0F1419]">
      <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g className="opacity-20">
          {/* First Ribbon */}
          <g transform="translate(100, -200) rotate(-45)">
            {Array.from({ length: lines }).map((_, i) => {
              const offset = (i - (lines - 1) / 2) * spacing;
              const r1 = R1 - offset;
              const x1 = 2 * R1 - offset;
              const r2 = R2 + offset;
              const x2 = 2 * R1 + 2 * R2 + offset;
              const r3 = R3 - offset;
              const x3 = 2 * R1 + 2 * R2 + 2 * R3 - offset;

              return (
                <path
                  key={`path1-${i}`}
                  d={`M ${offset} -1600 
                      L ${offset} 400 
                      A ${r1} ${r1} 0 0 0 ${x1} 400 
                      L ${x1} -200
                      A ${r2} ${r2} 0 0 1 ${x2} -200
                      L ${x2} 600
                      A ${r3} ${r3} 0 0 0 ${x3} 600
                      L ${x3} -1600`}
                  fill="none"
                  stroke="#00D9FF"
                  strokeWidth={strokeWidth}
                />
              );
            })}
          </g>

          {/* Second Ribbon */}
          <g transform="translate(800, 1000) rotate(135)">
            {Array.from({ length: lines }).map((_, i) => {
              const offset = (i - (lines - 1) / 2) * spacing;
              const r1 = R2 - offset;
              const x1 = 2 * R2 - offset;
              const r2 = R1 + offset;
              const x2 = 2 * R2 + 2 * R1 + offset;
              const r3 = R3 - offset;
              const x3 = 2 * R2 + 2 * R1 + 2 * R3 - offset;

              return (
                <path
                  key={`path2-${i}`}
                  d={`M ${offset} -1600 
                      L ${offset} 200 
                      A ${r1} ${r1} 0 0 0 ${x1} 200 
                      L ${x1} -400
                      A ${r2} ${r2} 0 0 1 ${x2} -400
                      L ${x2} 500
                      A ${r3} ${r3} 0 0 0 ${x3} 500
                      L ${x3} -1600`}
                  fill="none"
                  stroke="#00FF88"
                  strokeWidth={strokeWidth}
                />
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}
