import { Check, Loader2 } from 'lucide-react';
import type { PlanDetails } from '../../lib/stripe';

interface PricingCardProps {
  plan: PlanDetails;
  onSubscribe: (planId: string) => Promise<void>;
  isLoading: boolean;
  loadingPlanId?: string;
}

export default function PricingCard({ 
  plan, 
  onSubscribe, 
  isLoading,
  loadingPlanId 
}: PricingCardProps) {
  const isCurrentPlanLoading = loadingPlanId === plan.id;

  return (
    <div className={`bg-white rounded-xl shadow-sm p-8 border ${
      plan.isTrial ? 'border-blue-200 ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-200'
    }`}>
      {plan.isTrial && (
        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-4">
          Limited Time Offer
        </span>
      )}
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
      
      <div className="flex items-baseline mb-6">
        <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
        <span className="text-gray-600 ml-1">/month</span>
      </div>
      
      <ul className="space-y-4 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button
        onClick={() => onSubscribe(plan.id)}
        disabled={isLoading}
        className={`
          w-full text-center px-6 py-3 rounded-full transition-all duration-300
          ${plan.isTrial
            ? 'bg-blue-600 text-white hover:bg-blue-500'
            : 'bg-gray-900 text-white hover:bg-gray-800'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isCurrentPlanLoading ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : plan.isTrial ? (
          'Start Free Trial'
        ) : (
          'Get Started'
        )}
      </button>
      
      {plan.isTrial && (
        <p className="text-xs text-center text-gray-500 mt-2">
          No credit card required
        </p>
      )}
    </div>
  );
}