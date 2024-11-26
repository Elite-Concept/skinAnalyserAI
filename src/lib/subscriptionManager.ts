import { doc, increment, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

export interface AnalysisUsage {
  available: number;
  used: number;
  total: number;
}

export async function checkAnalysisAvailability(userId: string): Promise<AnalysisUsage> {
  const subscriptionRef = doc(db, 'subscriptions', userId);
  
  try {
    const result = await runTransaction(db, async (transaction) => {
      const subscriptionDoc = await transaction.get(subscriptionRef);
      
      if (!subscriptionDoc.exists()) {
        throw new Error('No active subscription found');
      }

      const data = subscriptionDoc.data();
      const available = data.analysisCount - (data.analysisUsed || 0);

      return {
        available,
        used: data.analysisUsed || 0,
        total: data.analysisCount
      };
    });

    return result;
  } catch (error) {
    console.error('Error checking analysis availability:', error);
    throw new Error('Failed to verify analysis credits');
  }
}

export async function trackAnalysisUsage(userId: string): Promise<void> {
  const subscriptionRef = doc(db, 'subscriptions', userId);
  
  try {
    await runTransaction(db, async (transaction) => {
      const subscriptionDoc = await transaction.get(subscriptionRef);
      
      if (!subscriptionDoc.exists()) {
        throw new Error('No active subscription found');
      }

      const data = subscriptionDoc.data();
      const currentUsage = data.analysisUsed || 0;
      
      if (currentUsage >= data.analysisCount) {
        throw new Error('Insufficient analysis credits');
      }

      transaction.update(subscriptionRef, {
        analysisUsed: increment(1),
        lastAnalysisAt: new Date()
      });
    });
  } catch (error) {
    console.error('Error tracking analysis usage:', error);
    throw new Error('Failed to update analysis usage');
  }
}