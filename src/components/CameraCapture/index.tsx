
import { useFaceDetector } from './useFaceDetector';
import { useWebcam } from './useWebcam';
import { CameraFrame } from './CameraFrame';
import { CameraControls } from './CameraControls';

interface CameraCaptureProps {
  onImageCapture: (image: string) => void;
}

export default function CameraCapture({ onImageCapture }: CameraCaptureProps) {
  const {
    webcamRef,
    isVideoReady,
    handleUserMedia
  } = useWebcam();

  const {
    isValid,
    validationMessage,
    checkFacePosition
  } = useFaceDetector(webcamRef, isVideoReady);

  const handleCapture = () => {
    if (!webcamRef.current || !isValid || !isVideoReady) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      onImageCapture(imageSrc);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-[4/3] bg-black rounded-lg overflow-hidden">
      <CameraFrame
        webcamRef={webcamRef}
        onUserMedia={handleUserMedia}
        isValid={isValid}
        checkFacePosition={checkFacePosition}
      />
      <CameraControls
        isValid={isValid}
        isVideoReady={isVideoReady}
        validationMessage={validationMessage}
        onCapture={handleCapture}
      />
    </div>
  );
}