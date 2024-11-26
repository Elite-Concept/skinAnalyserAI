import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body || '',
      event.headers['stripe-signature'] || '',
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    let userId: string | undefined;

    // Type guard function to check if object has metadata
    const hasMetadata = (obj: any): obj is { metadata?: { userId?: string } } => {
      return obj && typeof obj === 'object';
    };

    // Type guard for Checkout Session
    const isCheckoutSession = (obj: any): obj is Stripe.Checkout.Session => {
      return obj && obj.object === 'checkout.session';
    };

    // Extract userId based on event type and data
    if (isCheckoutSession(stripeEvent.data.object)) {
      userId = stripeEvent.data.object.client_reference_id;
    } else if (hasMetadata(stripeEvent.data.object)) {
      userId = stripeEvent.data.object.metadata?.userId;
    }

    if (!userId) {
      throw new Error('No userId found in event data');
    }

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        
        if (!session.subscription) {
          throw new Error('No subscription found in session');
        }

        // Retrieve subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const price = subscription.items.data[0].price;
        
        // Update user's subscription in Firestore
        await db.collection('subscriptions').doc(userId).set({
          status: subscription.status,
          priceId: price.id,
          currency: price.currency,
          interval: price.recurring?.interval,
          amount: price.unit_amount,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trial: false,
          updatedAt: new Date(),
        }, { merge: true });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        const price = subscription.items.data[0].price;
        
        await db.collection('subscriptions').doc(userId).set({
          status: subscription.status,
          priceId: price.id,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          updatedAt: new Date(),
        }, { merge: true });
        break;
      }

      case 'customer.subscription.deleted': {
        await db.collection('subscriptions').doc(userId).set({
          status: 'canceled',
          canceledAt: new Date(),
          updatedAt: new Date(),
        }, { merge: true });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        
        await db.collection('payments').add({
          userId,
          invoiceId: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: invoice.status,
          paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
          createdAt: new Date(),
        });

        // Update subscription status to active if it was past_due
        if (invoice.billing_reason === 'subscription_cycle') {
          await db.collection('subscriptions').doc(userId).set({
            status: 'active',
            updatedAt: new Date(),
          }, { merge: true });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        
        await db.collection('subscriptions').doc(userId).set({
          status: 'past_due',
          lastPaymentError: invoice.last_payment_error?.message,
          updatedAt: new Date(),
        }, { merge: true });
        break;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook error:', error);
    
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};