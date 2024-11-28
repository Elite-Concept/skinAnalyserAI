import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AnalysisResult } from '../components/SkinAnalysis/types';


const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('Gemini API key not configured');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function analyzeSkinImage(imageUrl: string): Promise<AnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to load image');
    }

    const imageBlob = await response.blob();
    const imageBase64 = await blobToBase64(imageBlob);

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
          data: imageBase64
        }
      },
      { text: prompt }
    ]);

    if (!result.response) {
      throw new Error('No response from AI model');
    }

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    validateAnalysisResult(analysis);


    return analysis;
  } catch (error) {
    // Enhance error handling with specific error types
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to reach AI service');
    }
    if (error instanceof SyntaxError) {
      throw new Error('Invalid response format from AI service');
    }
    if (error instanceof Error) {
      // Log detailed error for debugging
      console.error('Detailed Gemini analysis error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
    // Fallback for unknown errors
    throw new Error('An unexpected error occurred during analysis');
  }
}

function validateAnalysisResult(analysis: any): asserts analysis is AnalysisResult {
  if (!analysis.skinType || typeof analysis.skinType !== 'string') {
    throw new Error('Invalid skin type in analysis result');
  }
  
  if (!Array.isArray(analysis.concerns) || analysis.concerns.length === 0) {
    throw new Error('Invalid concerns in analysis result');
  }
  
  if (!Array.isArray(analysis.recommendations) || analysis.recommendations.length === 0) {
    throw new Error('Invalid recommendations in analysis result');
  }

  // Validate array contents
  if (analysis.concerns.some((item: any) => typeof item !== 'string')) {
    throw new Error('Invalid concern format in analysis result');
  }

  if (analysis.recommendations.some((item: any) => typeof item !== 'string')) {
    throw new Error('Invalid recommendation format in analysis result');
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to process image'));
    reader.readAsDataURL(blob);
  });
}