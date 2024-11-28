
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { AnalysisResult } from './types';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Skin Type</h3>
          <div className="flex items-center gap-2 text-gray-700">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p>{analysis.skinType}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Identified Concerns</h3>
          <ul className="space-y-2">
            {analysis.concerns.map((concern, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-700">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Recommendations</h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}