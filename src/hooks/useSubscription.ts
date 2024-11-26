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
}

export function useSubscription(userId?: string, planId?: string): UseSubscriptionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

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

  return {
    subscribe,
    isLoading,
    error,
    clearError,
    subscription,
  };
}