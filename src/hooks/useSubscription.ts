import { useState } from 'react';
import { createCheckoutSession, createTrialSubscription } from '../lib/stripe';

interface Subscription {
  priceId: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
  name: string;
  status: string;
  trial: boolean;
  analysisCount: number;
  analysisUsed: number;
}

interface UseSubscriptionReturn {
  subscribe: (planId: string, userId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  subscription: Subscription | null;
  remainingAnalyses: number;
  isActive: boolean;
  daysRemaining: number;
}

export function useSubscription(userId?: string, planId?: string): UseSubscriptionReturn {
  console.log("this is use subscription: ")
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription] = useState<Subscription | null>(null);


  
  const subscribe = async (planId: string, userId: string) => {
    if (!planId || !userId) {
      setError('Missing required subscription information');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (planId === 'trial') {
        const response = await createTrialSubscription(userId);
        if (!response.success) {
          throw new Error(response.error || 'Failed to activate trial subscription');
        }
      } else {
        await createCheckoutSession(planId, userId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred. Please try again.';
      
      console.error('Subscription error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const remainingAnalyses = subscription ? subscription.analysisCount - subscription.analysisUsed : 0;
  const isActive = subscription ? subscription.status === 'active' : false;
  const daysRemaining = subscription ? Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  return {
    subscribe,
    isLoading,
    error,
    clearError,
    subscription,
    remainingAnalyses,
    isActive,
    daysRemaining,
  };
}