
import { Loader2 } from 'lucide-react';

interface AnalysisLoadingProps {
  retryCount?: number;
}

export function AnalysisLoading({ retryCount = 0 }: AnalysisLoadingProps) {
  console.log("analysis loading...");
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-white rounded-lg shadow-lg">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <div className="text-center">
        <p className="text-gray-600">Analyzing your skin...</p>
        {retryCount > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Retry attempt {retryCount}...
          </p>
        )}
      </div>
    </div>
  );
}