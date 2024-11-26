
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AnalysisErrorProps {
  message: string;
  onRetry?: () => void;
}

export function AnalysisError({ message, onRetry }: AnalysisErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <div>
          <p className="font-medium text-red-700 mb-2">{message}</p>
          <p className="text-sm text-red-600">
            {message.includes('service unavailable') 
              ? 'Our analysis service is temporarily unavailable. Please try again in a few minutes.'
              : message.includes('Unable to connect')
              ? 'Please check your internet connection and try again'
              : 'Please try again or use a different image'}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}