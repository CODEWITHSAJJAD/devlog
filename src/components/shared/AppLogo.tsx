import React from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtext?: string;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  subtext,
  className = '',
}) => {
  const iconDimensions = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  }[size];

  const textStyles = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector App Icon */}
      <div
        className={`relative ${iconDimensions} rounded-xl p-[1px] bg-gradient-to-b from-white/90 to-black/10 shadow-[0_2px_8px_rgba(0,113,227,0.2),0_1px_2px_rgba(0,0,0,0.06)] flex-shrink-0 transition-transform hover:scale-105 active:scale-95`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full rounded-[11px] overflow-hidden"
        >
          <defs>
            {/* Background Plate Gradient */}
            <linearGradient id="dl-plate" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0B132B" />
              <stop offset="0.5" stopColor="#004085" />
              <stop offset="1" stopColor="#0071E3" />
            </linearGradient>

            {/* Specular Highlight */}
            <linearGradient id="dl-glow" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" stopOpacity="0.8" />
              <stop offset="1" stopColor="#0071E3" stopOpacity="0" />
            </linearGradient>

            {/* Facet Gradient: Left D-Stem */}
            <linearGradient id="dl-stem" x1="12" y1="12" x2="20" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#E0F2FE" />
            </linearGradient>

            {/* Facet Gradient: Forward Chevron */}
            <linearGradient id="dl-chevron" x1="18" y1="14" x2="36" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="0.5" stopColor="#0071E3" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>

            {/* Facet Gradient: Bottom Accent */}
            <linearGradient id="dl-accent" x1="20" y1="30" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34C759" />
              <stop offset="1" stopColor="#0071E3" />
            </linearGradient>

            {/* Outer Ring Ambient Shadow */}
            <filter id="dl-shadow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Rounded Squircle Container */}
          <rect width="48" height="48" rx="12" fill="url(#dl-plate)" />

          {/* Subtle Grid / Circuit Watermark */}
          <path
            d="M0 24H48M24 0V48"
            stroke="white"
            strokeOpacity="0.06"
            strokeWidth="0.75"
          />

          {/* Corner Specular Sheen */}
          <path
            d="M2 12C2 6.47715 6.47715 2 12 2H36C41.5228 2 46 6.47715 46 12V24C46 24 34 16 20 20C8 23.5 2 30 2 30V12Z"
            fill="url(#dl-glow)"
            opacity="0.35"
          />

          {/* Core Geometry: Monolithic D & Chevron Stack */}
          {/* 1. Left Vertical Pillar (D Backbone) */}
          <rect
            x="11"
            y="12"
            width="5.5"
            height="24"
            rx="2.75"
            fill="url(#dl-stem)"
          />

          {/* 2. Upper Forward Terminal Curve (D Upper Arc) */}
          <path
            d="M16.5 12H27C31.4183 12 35 15.5817 35 20C35 22.8687 33.4886 25.3854 31.2 26.75L26 23.5C27.2 22.7 28 21.4 28 20C28 17.8 26.2 16 24 16H16.5V12Z"
            fill="url(#dl-chevron)"
          />

          {/* 3. Lower Engineering Cursor Chevron (> Forward Motion) */}
          <path
            d="M16.5 24L26 29.5L16.5 36V31L21 28.5L16.5 26V24Z"
            fill="#FFFFFF"
            opacity="0.9"
          />

          {/* 4. Dynamic Lower Foundation Rail */}
          <path
            d="M23 32H33C35.2 32 36.5 33.8 35.5 35.5C34.8 36.5 33.8 37 32.5 37H20L23 32Z"
            fill="url(#dl-accent)"
          />

          {/* 5. Center Diamond Spark / Pulse Point */}
          <circle cx="28" cy="24" r="2.2" fill="#FFFFFF" />
          <circle cx="28" cy="24" r="1.2" fill="#0071E3" />
        </svg>
      </div>

      {/* Brand Typographic Lockup */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-extrabold tracking-tight text-[#1D1D1F] ${textStyles} font-display`}
            >
              Dev<span className="text-[#0071E3]">Log</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-[#E8F2FE] text-[#0071E3] border border-[#0071E3]/20">
              PRO
            </span>
          </div>
          {subtext && (
            <span className="text-[10px] text-[#86868B] font-mono tracking-normal mt-0.5">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
