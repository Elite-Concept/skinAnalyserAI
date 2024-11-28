import { useState, useEffect } from 'react';
import { analyzeSkinImage } from '../../lib/gemini';
import { AnalysisLoading } from './AnalysisLoading';
import { AnalysisError } from './AnalysisError';
import { AnalysisResults } from './AnalysisResults';
import type { AnalysisResult } from './types';

interface SkinAnalysisProps {
  imageUrl: string;
  userId: string;
  onAnalysisComplete?: (results: AnalysisResult) => void;
}

export function SkinAnalysis({ imageUrl, userId, onAnalysisComplete }: SkinAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const performAnalysis = async () => {
    if (!imageUrl || !userId) {
      setError('Missing required information');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const results = await analyzeSkinImage(imageUrl);
      
      // Validate results structure
      if (!results || !results.skinType || !Array.isArray(results.concerns) || !Array.isArray(results.recommendations)) {
        throw new Error('Invalid analysis results format');
      }

      setAnalysis(results);
      onAnalysisComplete?.(results);

    } catch (err) {
      let errorMessage: string;
      
      if (err instanceof Error) {
        errorMessage = err.message;
        // Log detailed error for debugging
        console.error('Error analyzing skin image:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
      } else {
        errorMessage = 'An unexpected error occurred during analysis';
        console.error('Unknown error during skin analysis:', err);
      }
      
      // Retry logic for specific errors
      if (retryCount < MAX_RETRIES && (
        errorMessage.includes('network') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('Failed to fetch')
      )) {
        setRetryCount(prev => prev + 1);
        setTimeout(performAnalysis, 2000 * (retryCount + 1)); // Exponential backoff
        return;
      }

      // User-friendly error messages
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
        errorMessage = 'Network error: Please check your internet connection and try again';
      } else if (errorMessage.includes('rate limit')) {
        errorMessage = 'Service is temporarily busy. Please try again in a moment';
      } else if (errorMessage.includes('Invalid analysis results')) {
        errorMessage = 'Unable to analyze the image. Please try a different photo';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setRetryCount(0); // Reset retry count when imageUrl changes
    performAnalysis();
  }, [imageUrl, userId]);

  const handleRetry = () => {
    setRetryCount(0);
    performAnalysis();
  };

  if (error) {
    return <AnalysisError message={error} onRetry={handleRetry} />;
  }

  if (isLoading) {
    return <AnalysisLoading retryCount={retryCount} />;
  }

  if (!analysis) return null;

  return <AnalysisResults analysis={analysis} />;
}