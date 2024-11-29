import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

interface SubscriptionStatusProps {
  userId: string;
}

export default function SubscriptionStatus({ }: SubscriptionStatusProps) {
  const { subscription, isLoading, error, isActive, remainingAnalyses, daysRemaining } = useSubscription();

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 rounded-lg p-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-yellow-50 text-yellow-600 rounded-lg p-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>No active subscription</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isActive ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="font-medium">
            {subscription.trial ? 'Trial Plan' : 'Premium Plan'}
          </span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {subscription.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Remaining Analyses</span>
          <span className="font-medium">{remainingAnalyses}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Days Remaining</span>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{daysRemaining}</span>
          </div>
        </div>

        {subscription.cancelAtPeriodEnd && (
          <div className="mt-4 text-sm text-amber-600 bg-amber-50 p-2 rounded">
            Your subscription will end on {subscription.currentPeriodEnd.toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}