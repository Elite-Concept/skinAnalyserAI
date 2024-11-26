import { AlertCircle, TrendingUp } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';

interface SubscriptionBannerProps {
  userId: string;
  onUpgrade: () => void;
}

export default function SubscriptionBanner({ userId, onUpgrade }: SubscriptionBannerProps) {
  const { subscription, isLoading, error } = useSubscription(userId);

  if (isLoading || error || !subscription) return null;

  const remainingCredits = subscription?.analysisCount - subscription?.analysisUsed;
  const usagePercentage = (subscription?.analysisUsed / subscription?.analysisCount) * 100;
  const isLowCredits = remainingCredits <= subscription?.analysisCount * 0.1; // 10% threshold

  if (!isLowCredits) return null;

  return (
    <div className={`rounded-lg p-4 mb-6 flex items-center justify-between ${
      remainingCredits === 0 
        ? 'bg-red-50 text-red-700' 
        : 'bg-yellow-50 text-yellow-700'
    }`}>
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>
          {remainingCredits === 0 
            ? 'You have used all your analysis credits for this period.' 
            : `Only ${remainingCredits} analysis credits remaining.`}
        </span>
      </div>
      <button
        onClick={onUpgrade}
        className="flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-opacity"
      >
        <TrendingUp className="w-4 h-4" />
        Upgrade Now
      </button>
    </div>
  );
}