import { doc, getDoc, runTransaction, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Subscription {
  trial: boolean;
  analysisCount: number;
  analysisUsed: number;
  status: 'active' | 'inactive' | 'expired';
  startDate: Date;
  endDate: Date | null;
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  try {
    const subscriptionDoc = await getDoc(doc(db, 'subscriptions', userId));
    if (!subscriptionDoc.exists()) return null;
    return subscriptionDoc.data() as Subscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw new Error('Failed to fetch subscription details');
  }
}

export async function createTrialSubscription(userId: string): Promise<void> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', userId);
    await setDoc(subscriptionRef, {
      trial: true,
      analysisCount: 50,
      analysisUsed: 0,
      status: 'active',
      startDate: serverTimestamp(),
      endDate: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating trial subscription:', error);
    throw new Error('Failed to create trial subscription');
  }
}

export async function updateAnalysisUsage(userId: string): Promise<void> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', userId);
    
    await runTransaction(db, async (transaction) => {
      const subscriptionDoc = await transaction.get(subscriptionRef);
      if (!subscriptionDoc.exists()) {
        throw new Error('Subscription not found');
      }

      const data = subscriptionDoc.data();
      if (data.analysisUsed >= data.analysisCount) {
        throw new Error('No analysis credits remaining');
      }

      transaction.update(subscriptionRef, {
        analysisUsed: increment(1),
        lastAnalysisAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    console.error('Error updating analysis usage:', error);
    throw new Error('Failed to update analysis usage');
  }
}