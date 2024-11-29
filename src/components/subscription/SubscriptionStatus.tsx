import { ArrowUpCircle, Clock, AlertCircle } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { plans } from '../../lib/stripe';

interface SubscriptionStatusProps {
  userId: string;
  onUpgrade: () => void;
}

export default function SubscriptionStatus({ userId, onUpgrade }: SubscriptionStatusProps) {
  console.log(userId)
  const { subscription, isLoading, error } = useSubscription();

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

  // Default to Free Trial if no subscription exists
  const defaultPlan = {
    name: 'Free Trial Plan',
    status: 'active',
    trial: true,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  };

  const activePlan = subscription || defaultPlan;
  const currentPlan = subscription ? plans.find(p => p.id === subscription.priceId) : null;
  const daysRemaining = Math.ceil(
    (activePlan.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {currentPlan?.name || activePlan?.name}
          </h3>
          <p className="text-sm text-gray-500">
            {activePlan?.trial ? 'Free Trial' : 'Active Subscription'}
          </p>
        </div>
        <button
          onClick={onUpgrade}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          <ArrowUpCircle className="w-4 h-4" />
          Upgrade
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Status</span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ACTIVE
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Time Remaining</span>
          <div className="flex items-center gap-1 text-gray-900">
            <Clock className="w-4 h-4" />
            <span>{daysRemaining} days</span>
          </div>
        </div>

        {subscription?.cancelAtPeriodEnd && (
          <div className="mt-4 text-sm text-amber-600 bg-amber-50 p-2 rounded">
            Your subscription will end on {subscription.currentPeriodEnd.toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}