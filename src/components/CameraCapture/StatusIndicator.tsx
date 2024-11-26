import React from 'react';

interface StatusIndicatorProps {
  isValid: boolean;
}

export function StatusIndicator({ isValid }: StatusIndicatorProps) {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
      <div className={`px-8 py-3 rounded-[30px] shadow-lg backdrop-blur-md transition-all duration-300 ${
        isValid 
          ? 'bg-green-500 text-white' 
          : 'bg-white/90 text-gray-900'
      }`}>
        <p className="text-sm font-medium flex items-center gap-2 whitespace-nowrap">
          {isValid ? '✓ Perfect position!' : 'Align your face with the guide'}
        </p>
      </div>
    </div>
  );
}