import  { useEffect, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2 } from 'lucide-react';

interface AnalysisProps {
  imageUrl: string;
}

interface AnalysisResult {
  skinType: string;
  concerns: string[];
  recommendations: string[];
}

export default function Analysis({ imageUrl }: AnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const analyzeSkin = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize Google Gemini AI
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

        // Convert base64 image to bytes
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const imageBytes = await blob.arrayBuffer();

        // Prepare the prompt
        const prompt = `Analyze this facial image and provide:
          1. Skin type
          2. Visible skin concerns
          3. Personalized skincare recommendations
          
          Format the response as JSON with the following structure:
          {
            "skinType": "string",
            "concerns": ["string"],
            "recommendations": ["string"]
          }`;

        // Generate content
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: Buffer.from(imageBytes).toString('base64')
            }
          }
        ]);

        const response_text = result.response.text();
        const analysisResult = JSON.parse(response_text);
        setAnalysis(analysisResult);
      } catch (err) {
        console.error('Error analyzing skin image:', err);
        setError('Failed to analyze the image. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (imageUrl) {
      analyzeSkin();
    }
  }, [imageUrl]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-600">Analyzing your skin...</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Skin Analysis Results</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Skin Type</h3>
            <p className="text-gray-700">{analysis.skinType}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Identified Concerns</h3>
            <ul className="list-disc list-inside space-y-1">
              {analysis.concerns.map((concern, index) => (
                <li key={index} className="text-gray-700">{concern}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Recommendations</h3>
            <ul className="list-disc list-inside space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="text-gray-700">{recommendation}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}