import { useRef, useCallback, useState } from 'react';
import type Webcam from 'react-webcam';

export function useWebcam() {
  const webcamRef = useRef<Webcam>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const handleUserMedia = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  return {
    webcamRef,
    isVideoReady,
    handleUserMedia
  };
}