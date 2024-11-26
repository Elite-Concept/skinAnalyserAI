import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { incrementAnalysisCount } from '../lib/firebase';
import { useAnalysisPermissions } from './useAnalysisPermissions';
import type { AnalysisResult } from '../components/SkinAnalysis/types';

export function useAnalysis(imageUrl: string, userId?: string) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { canAnalyze, remainingAnalyses, error: permissionError } = useAnalysisPermissions(userId);

  useEffect(() => {
    let isMounted = true;

    const analyzeSkin = async () => {
      if (!imageUrl) {
        setIsLoading(false);
        return;
      }

      if (!canAnalyze) {
        setError(permissionError || 'Analysis not available');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('API configuration error');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Convert image to base64
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          },
          {
            text: `Analyze this facial image and provide a detailed skin analysis in JSON format:
            {
              "skinType": "string describing the skin type",
              "concerns": ["array of 3-5 visible skin concerns"],
              "recommendations": ["array of 3-5 specific recommendations"]
            }
            Base the analysis only on visible features. Return valid JSON only.`
          }
        ]);

        if (!result.response) {
          throw new Error('No response from AI model');
        }

        const analysisResult = JSON.parse(result.response.text());

        // Increment analysis count after successful analysis
        if (userId) {
          await incrementAnalysisCount(userId);
        }

        if (isMounted) {
          setAnalysis(analysisResult);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
          console.error('Analysis error:', errorMessage);
          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    analyzeSkin();

    return () => {
      isMounted = false;
    };
  }, [imageUrl, userId, canAnalyze, permissionError]);

  return { 
    analysis, 
    error, 
    isLoading,
    remainingAnalyses
  };
}