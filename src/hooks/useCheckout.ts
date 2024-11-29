import { useState } from 'react';
import { createCheckoutSession } from '../lib/stripe';

interface UseCheckoutReturn {
  initiateCheckout: (priceId: string, userId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useCheckout(): UseCheckoutReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateCheckout = async (priceId: string, userId: string) => {
    
    if (!priceId || !userId) {
      const error = 'Missing required checkout information';
      setError(error);
      throw new Error(error);
    }

    try {
      setIsLoading(true);
      setError(null);

      // an email required to create or to buy a plan.
      const userEmail = '';

      await createCheckoutSession(priceId, userId, userEmail );
    } catch (err) {
      let errorMessage = 'Failed to initiate checkout';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      console.error('Checkout error:', { error: err, message: errorMessage });
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    initiateCheckout,
    isLoading,
    error,
    clearError
  };
}