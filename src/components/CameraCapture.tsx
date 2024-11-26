import { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';
import { Camera, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onImageCapture: (image: string) => void;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
}

export default function CameraCapture({ onImageCapture }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [detector, setDetector] = useState<faceDetection.FaceDetector | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('Position your face in the center');
  const [isValid, setIsValid] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const model = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        { runtime: 'tfjs' }
      );
      setDetector(model);
    };
    loadModel();
  }, []);

  const validateFace = async (imageData: ImageData): Promise<ValidationResult> => {
    if (!detector) return { isValid: false, message: 'Face detector not ready' };

    try {
      const faces = await detector.estimateFaces(imageData);
      
      if (faces.length === 0) {
        return { isValid: false, message: 'No face detected' };
      }
      
      if (faces.length > 1) {
        return { isValid: false, message: 'Multiple faces detected' };
      }

      const face = faces[0];
      const { box } = face;
      const imageCenter = imageData.width / 2;
      const faceCenter = box.xMin + (box.width / 2);
      
      const centerThreshold = imageData.width * 0.1;
      if (Math.abs(faceCenter - imageCenter) > centerThreshold) {
        return { isValid: false, message: 'Center your face in the frame' };
      }

      const minFaceSize = imageData.width * 0.3;
      if (box.width < minFaceSize) {
        return { isValid: false, message: 'Move closer to the camera' };
      }

      const maxFaceSize = imageData.width * 0.8;
      if (box.width > maxFaceSize) {
        return { isValid: false, message: 'Move back from the camera' };
      }

      return { isValid: true, message: 'Perfect! Hold still...' };
    } catch (error) {
      console.error('Face validation error:', error);
      return { isValid: false, message: 'Error validating face position' };
    }
  };

  const checkFacePosition = useCallback(async () => {
    if (!webcamRef.current || !detector || !isVideoReady) return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      const result = await validateFace(imageData);
      setValidationMessage(result.message);
      setIsValid(result.isValid);
    } catch (error) {
      console.error('Error checking face position:', error);
      setValidationMessage('Error checking face position');
      setIsValid(false);
    }
  }, [detector, isVideoReady]);

  useEffect(() => {
    const interval = setInterval(checkFacePosition, 500);
    return () => clearInterval(interval);
  }, [checkFacePosition]);

  const handleUserMedia = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  const capture = useCallback(() => {
    if (!webcamRef.current || !isValid || !isVideoReady) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      onImageCapture(imageSrc);
    }
  }, [onImageCapture, isValid, isVideoReady]);

  return (
    <div className="relative">
      <div className="rounded-lg overflow-hidden bg-black">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: "user"
          }}
          onUserMedia={handleUserMedia}
          className="w-full"
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-full w-full flex items-center justify-center">
            <div className={`w-64 h-64 rounded-full border-4 transition-colors ${
              isValid ? 'border-green-500' : 'border-white/50'
            }`} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-4">
        <div className={`px-4 py-2 rounded-full backdrop-blur-md ${
          isValid ? 'bg-green-500/90 text-white' : 'bg-white/90 text-gray-900'
        }`}>
          <div className="flex items-center gap-2">
            {isValid ? (
              <Camera className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{validationMessage}</span>
          </div>
        </div>

        <button
          onClick={capture}
          disabled={!isValid || !isVideoReady}
          className="btn btn-primary rounded-full px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Capture Photo
        </button>
      </div>
    </div>
  );
}