import React from 'react';

interface LogoProps {
  className?: string;
  height?: number | string;
}

export const DblGroupLogo: React.FC<LogoProps> = ({ className = '', height = 40 }) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 200 180"
        height={height}
        style={{ height: `${height}px`, width: 'auto' }}
        className="shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Blue top pointer triangle */}
        <polygon points="68,36 84,2 80,30" fill="#0072bc" />

        {/* Green rounded pill/leaf shape */}
        <path
          d="M 40,30 C 18,30 2,46 2,68 C 2,90 18,106 40,106 C 62,106 100,68 100,68 C 100,68 62,30 40,30 Z"
          fill="#7ac142"
          transform="rotate(-15, 50, 68)"
        />

        {/* Blue tear / droplet shape */}
        <path
          d="M 68,38 C 96,15 138,5 152,40 C 162,65 142,95 120,95 C 90,95 62,55 68,38 Z"
          fill="#0072bc"
          transform="rotate(5, 110, 55)"
        />

        {/* 'dbl' text in official navy */}
        <g fill="#23384e">
          {/* 'd' */}
          <path d="M 88,85 L 88,148 L 76,148 C 74,152 70,154 64,154 C 48,154 38,140 38,123 C 38,106 48,92 64,92 C 70,92 74,94 76,98 L 76,85 Z M 76,123 C 76,112 70,105 63,105 C 56,105 50,112 50,123 C 50,134 56,141 63,141 C 70,141 76,134 76,123 Z" />

          {/* 'b' */}
          <path d="M 95,85 L 107,85 L 107,98 C 109,94 113,92 119,92 C 135,92 145,106 145,123 C 145,140 135,154 119,154 C 113,154 109,152 107,148 L 107,154 L 95,154 Z M 107,123 C 107,134 113,141 120,141 C 127,141 133,134 133,123 C 133,112 127,105 120,105 C 113,105 107,112 107,123 Z" />

          {/* 'l' */}
          <rect x="151" y="85" width="12" height="69" />

          {/* Registered trademark (R) */}
          <circle cx="171" cy="91" r="5" fill="none" stroke="#23384e" strokeWidth="1.2" />
          <text
            x="171"
            y="93.5"
            fontSize="7"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            textAnchor="middle"
            fill="#23384e"
          >
            R
          </text>

          {/* 'G  R  O  U  P' subtext */}
          <text
            x="105"
            y="174"
            fontSize="14"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="600"
            letterSpacing="10"
            textAnchor="middle"
            fill="#23384e"
          >
            GROUP
          </text>
        </g>
      </svg>
    </div>
  );
};
