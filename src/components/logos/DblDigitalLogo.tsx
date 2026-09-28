import React from 'react';

interface LogoProps {
  className?: string;
  height?: number | string;
}

export const DblDigitalLogo: React.FC<LogoProps> = ({ className = '', height = 40 }) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 180 180"
        height={height}
        style={{ height: `${height}px`, width: 'auto' }}
        className="shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hexagon cluster graphic in #f15a24 */}
        <g fill="#f15a24">
          {/* Hexagon 1: Top Center Large */}
          <polygon points="85,3 103,13 103,35 85,45 67,35 67,13" />

          {/* Hexagon 2: Mid-Left */}
          <polygon points="56,22 71,30 71,48 56,56 41,48 41,30" />

          {/* Hexagon 3: Mid-Right */}
          <polygon points="107,31 123,40 123,60 107,69 91,60 91,40" />

          {/* Hexagon 4: Far Left Upper */}
          <polygon points="34,44 46,51 46,65 34,72 22,65 22,51" />

          {/* Hexagon 5: Far Left Lower */}
          <polygon points="37,67 48,73 48,87 37,93 26,87 26,73" />

          {/* Hexagon 6: Mid-Right Lower */}
          <polygon points="135,46 148,53 148,68 135,75 122,68 122,53" />

          {/* Hexagon 7: Lower Center Right */}
          <polygon points="137,68 147,74 147,87 137,93 127,87 127,74" />
        </g>

        {/* 'dbl' text in official navy */}
        <g fill="#23384e">
          {/* 'd' */}
          <path d="M 76,82 L 76,145 L 64,145 C 62,149 58,151 52,151 C 36,151 26,137 26,120 C 26,103 36,89 52,89 C 58,89 62,91 64,95 L 64,82 Z M 64,120 C 64,109 58,102 51,102 C 44,102 38,109 38,120 C 38,131 44,138 51,138 C 58,138 64,131 64,120 Z" />

          {/* 'b' */}
          <path d="M 83,82 L 95,82 L 95,95 C 97,91 101,89 107,89 C 123,89 133,103 133,120 C 133,137 123,151 107,151 C 101,151 97,149 95,145 L 95,151 L 83,151 Z M 95,120 C 95,131 101,138 108,138 C 115,138 121,131 121,120 C 121,109 115,102 108,102 C 101,102 95,109 95,120 Z" />

          {/* 'l' */}
          <rect x="139" y="82" width="12" height="69" />
        </g>

        {/* 'D I G I T A L' subtext in orange #f15a24 */}
        <text
          x="90"
          y="172"
          fontSize="15"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="600"
          letterSpacing="11"
          textAnchor="middle"
          fill="#f15a24"
        >
          DIGITAL
        </text>
      </svg>
    </div>
  );
};
