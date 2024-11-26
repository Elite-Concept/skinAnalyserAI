
import { plans } from '../../lib/stripe';
import { Calendar, CreditCard } from 'lucide-react';

interface PlanSelectorProps {
  selectedPlan: string;
  billingCycle: 'monthly' | 'annual';
  startDate: Date;
  onPlanChange: (plan: string) => void;
  onBillingCycleChange: (cycle: 'monthly' | 'annual') => void;
  onStartDateChange: (date: Date) => void;
}

export default function PlanSelector({
  selectedPlan,
  billingCycle,
  startDate,
  onPlanChange,
  onBillingCycleChange,
  onStartDateChange
}: PlanSelectorProps) {
  const getExpiryDate = (date: Date): Date => {
    const expiry = new Date(date);
    expiry.setMonth(expiry.getMonth() + (billingCycle === 'annual' ? 12 : 1));
    return expiry;
  };

  const calculatePrice = (basePrice: number): number => {
    if (billingCycle === 'annual') {
      return basePrice * 12 * 0.85; // 15% annual discount
    }
    return basePrice;
  };

  const selectedPlanDetails = plans.find(p => p.id === selectedPlan);
  const price = selectedPlanDetails ? calculatePrice(selectedPlanDetails.price) : 0;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Plan
        </label>
        <select
          value={selectedPlan}
          onChange={(e) => onPlanChange(e.target.value)}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} - ${plan.price}/month
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Billing Cycle
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="monthly"
              checked={billingCycle === 'monthly'}
              onChange={() => onBillingCycleChange('monthly')}
              className="mr-2"
            />
            Monthly
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="annual"
              checked={billingCycle === 'annual'}
              onChange={() => onBillingCycleChange('annual')}
              className="mr-2"
            />
            Annual (15% discount)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start Date
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={startDate.toISOString().split('T')[0]}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => onStartDateChange(new Date(e.target.value))}
            className="w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Expiry Date</span>
          <span className="font-medium">
            {getExpiryDate(startDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <span className="text-gray-600">Total Price</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ${price.toFixed(2)}
            </span>
            <span className="text-gray-500 ml-1">
              /{billingCycle === 'annual' ? 'year' : 'month'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}