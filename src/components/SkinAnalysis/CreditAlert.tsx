
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface CreditAlertProps {
  remainingAnalyses: number;
}

export function CreditAlert({ remainingAnalyses }: CreditAlertProps) {
  return (
    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-yellow-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>
            {remainingAnalyses === 1
              ? 'Last analysis credit remaining!'
              : `${remainingAnalyses} analysis credits remaining`}
          </span>
        </div>
        <Link
          to="/pricing"
          className="flex items-center gap-1 text-sm font-medium text-yellow-700 hover:text-yellow-600"
        >
          Upgrade Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}