import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkAnalysisCredits, incrementAnalysisCount } from '../../lib/analysis/credits';
import type { AnalysisResult } from './types';

export function useAnalysis(imageUrl: string, userId: string) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const analyzeSkin = async () => {
      if (!imageUrl || !userId) {
        setError('Missing required information');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Check credits before processing
        const credits = await checkAnalysisCredits(userId);
        if (credits.available <= 0) {
          throw new Error('Insufficient analysis credits');
        }

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('API key not configured');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Convert image to base64
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error('Failed to load image');
        }

        const blob = await response.blob();
        const reader = new FileReader();
        
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = () => reject(new Error('Failed to read image'));
          reader.readAsDataURL(blob);
        });

        const prompt = `Analyze this facial image and provide a detailed skin analysis in JSON format:
        {
          "skinType": "string describing the skin type",
          "concerns": ["array of 3-5 visible skin concerns"],
          "recommendations": ["array of 3-5 specific recommendations"]
        }
        Base the analysis only on visible features. Return valid JSON only.`;

        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          },
          { text: prompt }
        ]);

        if (!result.response) {
          throw new Error('No response from AI model');
        }

        const response_text = result.response.text();
        
        // Extract and validate JSON
        const jsonMatch = response_text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Invalid response format');
        }

        const analysisResult = JSON.parse(jsonMatch[0]);

        // Validate response structure
        if (!analysisResult.skinType || !analysisResult.concerns || !analysisResult.recommendations) {
          throw new Error('Incomplete analysis result');
        }

        // Increment analysis count after successful analysis
        await incrementAnalysisCount(userId);

        if (isMounted) {
          setAnalysis(analysisResult);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          let errorMessage = 'Failed to analyze image';
          
          if (err instanceof Error) {
            if (err.message.includes('Insufficient analysis credits')) {
              errorMessage = 'You have used all your analysis credits for this period';
            } else if (err.message.includes('No subscription found')) {
              errorMessage = 'No active subscription found';
            } else {
              errorMessage = err.message;
            }
          }
          
          console.error('Error analyzing skin image:', err);
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
  }, [imageUrl, userId]);

  return { analysis, error, isLoading };
}