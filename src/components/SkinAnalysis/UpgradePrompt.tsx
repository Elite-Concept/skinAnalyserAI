
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface UpgradePromptProps {
  error: string;
  remainingAnalyses: number;
}

export function UpgradePrompt({ error, remainingAnalyses }: UpgradePromptProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {error}
          </h3>
          
          <p className="text-gray-600">
            {remainingAnalyses <= 0
              ? 'You have reached your analysis limit for this billing period.'
              : 'Please upgrade your subscription to continue using our analysis service.'}
          </p>
        </div>

        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors"
        >
          Upgrade Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}