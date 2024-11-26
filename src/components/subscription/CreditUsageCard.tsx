import { useEffect } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { useAnalysisCredits } from '../../hooks/useAnalysisCredits';

interface CreditUsageCardProps {
  userId: string;
}

export default function CreditUsageCard({ userId }: CreditUsageCardProps) {
  const { credits, loading, error, syncCredits } = useAnalysisCredits(userId);

  useEffect(() => {
    // Initial sync
    syncCredits();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (error || !credits) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-red-600">Failed to load credit usage</p>
      </div>
    );
  }

  const percentage = (credits.used / credits.total) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">Analysis Credits</h3>
        </div>
        <button
          onClick={syncCredits}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="Sync credits"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            {credits.used.toLocaleString()} / {credits.total.toLocaleString()} used
          </span>
          <span className="font-medium text-gray-900">
            {percentage.toFixed(1)}%
          </span>
        </div>

        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              percentage > 90 ? 'bg-red-500' :
              percentage > 70 ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-sm pt-2">
          <span className="text-gray-600">Credits remaining</span>
          <span className="font-medium text-gray-900">
            {credits.available.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}