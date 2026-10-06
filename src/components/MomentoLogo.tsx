import React from 'react';

interface MomentoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

export const MomentoLogo: React.FC<MomentoLogoProps> = ({
  size = 'md',
  showText = true,
  animated = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: { box: 'w-7 h-7', svg: 28 },
    md: { box: 'w-9 h-9', svg: 36 },
    lg: { box: 'w-12 h-12', svg: 48 },
    xl: { box: 'w-16 h-16', svg: 64 },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon Mark */}
      <div
        className={`relative ${iconDimensions.box} rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-teal-500/30 p-1 shadow-lg shadow-teal-950/40 flex items-center justify-center group overflow-hidden transition-all duration-300 hover:border-teal-400/60 hover:shadow-teal-500/20`}
      >
        {/* Ambient Glow Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/15 via-emerald-500/5 to-cyan-500/15 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -top-3 -right-3 w-7 h-7 bg-teal-400/20 rounded-full blur-md group-hover:bg-teal-400/40 transition-all duration-500" />

        {/* High-Tech Custom SVG Logo Mark */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full relative z-10 ${animated ? 'transition-transform duration-500 group-hover:scale-105' : ''}`}
        >
          <defs>
            {/* Primary Electric Gradient */}
            <linearGradient id="momento-gradient-1" x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* Accent Highlight Gradient */}
            <linearGradient id="momento-gradient-accent" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="60%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* Deep Glass Depth Gradient */}
            <linearGradient id="momento-gradient-dark" x1="24" y1="10" x2="24" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0F766E" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#134E4A" stopOpacity="0.3" />
            </linearGradient>

            {/* Spark Glow Filter */}
            <filter id="momento-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Micro Waveform Grid Dots */}
          <circle cx="10" cy="14" r="1" fill="#2DD4BF" fillOpacity="0.3" />
          <circle cx="38" cy="14" r="1" fill="#2DD4BF" fillOpacity="0.3" />
          <circle cx="10" cy="34" r="1" fill="#2DD4BF" fillOpacity="0.3" />
          <circle cx="38" cy="34" r="1" fill="#2DD4BF" fillOpacity="0.3" />

          {/* Left Audio-Waveform Pillar */}
          <rect
            x="8.5"
            y="14"
            width="4.5"
            height="20"
            rx="2.25"
            fill="url(#momento-gradient-1)"
            className={animated ? 'animate-pulse' : ''}
            style={{ animationDuration: '2.5s' }}
          />

          {/* Right Audio-Waveform Pillar */}
          <rect
            x="35"
            y="14"
            width="4.5"
            height="20"
            rx="2.25"
            fill="url(#momento-gradient-1)"
            className={animated ? 'animate-pulse' : ''}
            style={{ animationDuration: '2.5s', animationDelay: '0.6s' }}
          />

          {/* Central Stylized Folded Ribbon 'M' Path */}
          <path
            d="M 13 16 
               L 24 28 
               L 35 16 
               L 35 22.5 
               L 24 34.5 
               L 13 22.5 
               Z"
            fill="url(#momento-gradient-accent)"
            fillOpacity="0.9"
            filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.5))"
          />

          {/* Upper Converging Chevron (Forming Precision Apex) */}
          <path
            d="M 16 13.5
               L 24 21.5
               L 32 13.5
               L 28.5 10
               L 24 14.5
               L 19.5 10
               Z"
            fill="url(#momento-gradient-1)"
          />

          {/* Core AI Intelligence Spark (Pulsing Diamond Star) */}
          <g filter="url(#momento-glow-filter)">
            <path
              d="M 24 4 
                 Q 24 10 30 10 
                 Q 24 10 24 16 
                 Q 24 10 18 10 
                 Q 24 10 24 4 Z"
              fill="#FFFFFF"
              className={animated ? 'animate-spin' : ''}
              style={{
                transformOrigin: '24px 10px',
                animationDuration: '8s',
                animationTimingFunction: 'linear',
              }}
            />
            {/* Center Core Dot */}
            <circle cx="24" cy="10" r="1.2" fill="#5EEAD4" />
          </g>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-white flex items-center">
              <span>MoM</span>
              <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent ml-0.5">
                ento
              </span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 rounded-full border border-teal-500/25 shadow-sm shadow-teal-950/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
              AI
            </span>
          </div>
          <p className="text-[11px] font-medium text-zinc-400 hidden sm:block tracking-normal">
            Intelligent Minutes of Meeting
          </p>
        </div>
      )}
    </div>
  );
};
