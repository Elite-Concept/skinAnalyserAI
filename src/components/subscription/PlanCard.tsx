
import { Check, Loader2 } from 'lucide-react';
import type { PlanDetails } from '../../lib/stripe';

interface PlanCardProps {
  plan: PlanDetails;
  onSelect: () => void;
  isLoading: boolean;
}

export default function PlanCard({ plan, onSelect, isLoading }: PlanCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 transition-colors">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
      
      <div className="flex items-baseline mb-4">
        <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
        <span className="text-gray-600 ml-1">/month</span>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-600 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Upgrade Now'
        )}
      </button>
    </div>
  );
}