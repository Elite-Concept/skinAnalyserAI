import { X, Shield, CreditCard } from 'lucide-react';
import { plans, type PlanDetails } from '../../lib/stripe';
import { useSubscription } from '../../hooks/useSubscription';
import PlanCard from './PlanCard';
import LoadingOverlay from './LoadingOverlay';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
}

export default function UpgradeModal({ isOpen, onClose, currentPlan }: UpgradeModalProps) {
  const { subscribe, isLoading, error } = useSubscription();
  const availablePlans = plans.filter(plan => !plan.isTrial && plan.id !== currentPlan);

  if (!isOpen) return null;

  const handleUpgrade = async (plan: PlanDetails) => {
    try {
      await subscribe(plan.id, currentPlan || '');
      // Modal will be closed after redirect to Stripe
    } catch (error) {
      // Error is handled by useSubscription hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl">
          {isLoading && <LoadingOverlay />}

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Upgrade Your Plan
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {availablePlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={() => handleUpgrade(plan)}
                  isLoading={isLoading}
                />
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <p className="text-sm text-gray-600">
                Secure payment processing by Stripe. Your subscription will be activated immediately after payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}