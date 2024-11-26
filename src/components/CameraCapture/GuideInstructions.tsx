import React from 'react';

export function GuideInstructions() {
  return (
    <div className="absolute top-4 left-0 right-0 z-20">
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 max-w-md mx-auto transform -translate-y-2">
        <div className="flex flex-col items-center gap-1">
          <p className="text-white/90 text-sm text-center">
            Center your face in the oval guide and maintain a neutral expression
          </p>
        </div>
      </div>
    </div>
  );
}