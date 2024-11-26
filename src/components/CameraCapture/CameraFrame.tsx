import React, { useEffect } from 'react';
import Webcam from 'react-webcam';
import { GuideOverlay } from './GuideOverlay';
import { GuideInstructions } from './GuideInstructions';
import { StatusIndicator } from './StatusIndicator';

interface CameraFrameProps {
  webcamRef: React.RefObject<Webcam>;
  onUserMedia: () => void;
  isValid: boolean;
  checkFacePosition: () => void;
}

export function CameraFrame({
  webcamRef,
  onUserMedia,
  isValid,
  checkFacePosition
}: CameraFrameProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(checkFacePosition, 500);
    return () => clearInterval(interval);
  }, [checkFacePosition]);

  return (
    <div className="relative w-full h-full">
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored={true}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width: 1080,
          height: 1920,
          facingMode: "user",
          aspectRatio: 9/16
        }}
        onUserMedia={onUserMedia}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <GuideInstructions />
      <GuideOverlay isValid={isValid} />
      <StatusIndicator isValid={isValid} />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
      </div>
    </div>
  );
}