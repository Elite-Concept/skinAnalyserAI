import { useState, useCallback, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';
import type Webcam from 'react-webcam';

interface ValidationResult {
  isValid: boolean;
  message: string;
}

export function useFaceDetector(
  webcamRef: React.RefObject<Webcam>,
  isVideoReady: boolean
) {
  const [detector, setDetector] = useState<faceDetection.FaceDetector | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('Position your face in the center');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const model = await faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector,
          { runtime: 'tfjs' }
        );
        setDetector(model);
      } catch (error) {
        console.error('Error loading face detector:', error);
        setValidationMessage('Failed to load face detector');
      }
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
  }, [detector, isVideoReady, webcamRef]);

  return {
    isValid,
    validationMessage,
    checkFacePosition
  };
}