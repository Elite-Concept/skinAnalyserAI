import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error('STRIPE_PUBLISHABLE_KEY is not configured');
}

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

if (!stripePromise) {
  throw new Error('Failed to initialize Stripe');
}

export interface PlanDetails {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  currency: string;
  features: string[];
  analysisCount: number;
  isTrial?: boolean;
  trialDays?: number;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface SubscriptionResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export const plans: PlanDetails[] = [
  {
    id: 'price_1M1lFQFAuRf6JBVT0yeVpkIupAIKz',
    name: 'Starter',
    price: 39,
    interval: 'month',
    currency: 'usd',
    features: [
      'Up to 1,000 analyses per month',
      'Basic skin analysis',
      'Email support',
      'Widget customization',
    ],
    analysisCount: 1000
  },
  {
    id: 'price_1M1lFQFAuRf6JBVT0yeVpkIupAIKy',
    name: 'Professional',
    price: 99,
    interval: 'month',
    currency: 'usd',
    features: [
      'Up to 5,000 analyses per month',
      'Advanced skin analysis',
      'Priority support',
      'Custom branding',
      'API access',
    ],
    analysisCount: 5000
  }
];

export async function createCheckoutSession(priceId: string, userId: string, userEmail: string): Promise<void> {
  if (!priceId || !userId ) {
    throw new Error('Missing required parameters for checkout');
  }

  console.log("stripe: user email address: ", userEmail);
  console.log("stripe: user id: ", userId);
  console.log("stripe: price id ", priceId);

  try {
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,  /** this has to be user mail */
        userEmail,
        successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing`,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create checkout session';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use status code in error message
        errorMessage = `Failed to create checkout session (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data?.url) {
      throw new Error('Invalid checkout session response');
    }

    // Redirect to Stripe Checkout
    window.location.href = data.url;
  } catch (error) {
    console.error('Checkout error:', error);
    throw error instanceof Error ? error : new Error('Failed to create checkout session');
  }
}

export async function createTrialSubscription(userId: string): Promise<SubscriptionResponse> {
  if (!userId) {
    throw new Error('User ID is required for trial subscription');
  }

  try {
    const response = await fetch('/.netlify/functions/create-trial-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create trial subscription';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = `Failed to create trial subscription (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Trial subscription error:', error);
    throw error instanceof Error ? error : new Error('Failed to create trial subscription');
  }
}