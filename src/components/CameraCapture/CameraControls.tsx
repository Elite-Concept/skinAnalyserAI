
import { Camera } from 'lucide-react';

interface CameraControlsProps {
  isValid: boolean;
  isVideoReady: boolean;
  validationMessage: string;
  onCapture: () => void;
}

export function CameraControls({
  isValid,
  isVideoReady,
  onCapture
}: CameraControlsProps) {
  return (
    <div className="absolute bottom-16 left-0 right-0 flex justify-center z-30">
      <button
        onClick={onCapture}
        disabled={!isValid || !isVideoReady}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-full shadow-lg
          transition-all duration-300 backdrop-blur-md
          ${isValid
            ? 'bg-blue-600 hover:bg-blue-500 text-white'
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }
        `}
      >
        <Camera className="w-5 h-5" />
        <span className="font-medium">Take Photo</span>
      </button>
    </div>
  );
}