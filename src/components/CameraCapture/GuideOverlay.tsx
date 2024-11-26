import React from 'react';

interface GuideOverlayProps {
  isValid: boolean;
}

export function GuideOverlay({ isValid }: GuideOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
      <div className="relative w-[280px] h-[380px] mt-12">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 280 380" 
          className="filter drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.5))' }}
        >
          {/* Guide background */}
          <path
            d="M140 40 
               C 80 40, 40 120, 40 190
               C 40 260, 80 340, 140 340
               C 200 340, 240 260, 240 190
               C 240 120, 200 40, 140 40"
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="40"
          />
          {/* Guide outline */}
          <path
            d="M140 40 
               C 80 40, 40 120, 40 190
               C 40 260, 80 340, 140 340
               C 200 340, 240 260, 240 190
               C 240 120, 200 40, 140 40"
            fill="none"
            stroke={isValid ? '#22c55e' : 'rgba(255, 255, 255, 0.9)'}
            strokeWidth="3"
            strokeDasharray={isValid ? "0" : "8 8"}
            className="transition-all duration-300"
          />
          {/* Guide markers */}
          <circle cx="140" cy="100" r="4" fill={isValid ? '#22c55e' : 'white'} className="animate-pulse" />
          <circle cx="140" cy="280" r="4" fill={isValid ? '#22c55e' : 'white'} className="animate-pulse" />
          <circle cx="70" cy="190" r="4" fill={isValid ? '#22c55e' : 'white'} className="animate-pulse" />
          <circle cx="210" cy="190" r="4" fill={isValid ? '#22c55e' : 'white'} className="animate-pulse" />
        </svg>
      </div>
    </div>
  );
}