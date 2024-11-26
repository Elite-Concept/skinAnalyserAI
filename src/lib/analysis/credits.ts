import { doc, getDoc, runTransaction, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface AnalysisCredits {
  available: number;
  used: number;
  total: number;
  lastUpdated: Date;
}

export async function initializeSubscription(userId: string): Promise<void> {
  const subscriptionRef = doc(db, 'subscriptions', userId);
  
  try {
    await runTransaction(db, async (transaction) => {
      const subscriptionDoc = await transaction.get(subscriptionRef);

      if (!subscriptionDoc.exists()) {
        transaction.set(subscriptionRef, {
          trial: true,
          analysisCount: 50,
          analysisUsed: 0,
          status: 'active',
          startDate: serverTimestamp(),
          endDate: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastSyncedAt: serverTimestamp()
        });
      }
    });
  } catch (error) {
    console.error('Error initializing subscription:', error);
    throw new Error('Failed to initialize subscription');
  }
}

export async function checkAnalysisCredits(userId: string): Promise<AnalysisCredits> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', userId);
    
    const result = await runTransaction(db, async (transaction) => {
      const subscriptionDoc = await transaction.get(subscriptionRef);
      
      if (!subscriptionDoc.exists()) {
        // Initialize subscription if it doesn't exist
        await initializeSubscription(userId);
        return {
          available: 50,
          used: 0,
          total: 50,
          lastUpdated: new Date()
        };
      }

      const data = subscriptionDoc.data();
      const available = data.analysisCount - (data.analysisUsed || 0);

      return {
        available: Math.max(0, available),
        used: data.analysisUsed || 0,
        total: data.analysisCount,
        lastUpdated: data.lastSyncedAt?.toDate() || new Date()
      };
    });

    return result;
  } catch (error) {
    console.error('Error checking analysis credits:', error);
    throw new Error('Failed to check analysis credits');
  }
}

export async function deductAnalysisCredit(userId: string, analysisId: string): Promise<void> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', userId);
    const analysisRef = doc(db, 'analyses', analysisId);
    
    await runTransaction(db, async (transaction) => {
      const subscriptionDoc = await transaction.get(subscriptionRef);
      const analysisDoc = await transaction.get(analysisRef);
      
      if (!subscriptionDoc.exists()) {
        throw new Error('No subscription found');
      }

      if (!analysisDoc.exists()) {
        throw new Error('Analysis record not found');
      }

      // Check if credit was already deducted
      const analysisData = analysisDoc.data();
      if (analysisData.creditDeducted) {
        return; // Skip if credit was already deducted
      }

      const data = subscriptionDoc.data();
      const currentUsage = data.analysisUsed || 0;
      
      if (currentUsage >= data.analysisCount) {
        throw new Error('Insufficient analysis credits');
      }

      // Update subscription with new usage count
      transaction.update(subscriptionRef, {
        analysisUsed: increment(1),
        lastAnalysisAt: serverTimestamp(),
        lastSyncedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Mark analysis as completed and credited
      transaction.update(analysisRef, {
        status: 'completed',
        creditDeducted: true,
        completedAt: serverTimestamp()
      });
    });
  } catch (error) {
    console.error('Error deducting analysis credit:', error);
    throw new Error('Failed to deduct analysis credit');
  }
}

export async function syncAnalysisCredits(userId: string): Promise<AnalysisCredits> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', userId);
    
    const result = await runTransaction(db, async (transaction) => {
      const subscriptionDoc = await transaction.get(subscriptionRef);
      
      if (!subscriptionDoc.exists()) {
        throw new Error('No subscription found');
      }

      const data = subscriptionDoc.data();
      
      // Update last synced timestamp
      transaction.update(subscriptionRef, {
        lastSyncedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        available: data.analysisCount - (data.analysisUsed || 0),
        used: data.analysisUsed || 0,
        total: data.analysisCount,
        lastUpdated: new Date()
      };
    });

    return result;
  } catch (error) {
    console.error('Error syncing analysis credits:', error);
    throw new Error('Failed to sync analysis credits');
  }
}

export async function incrementAnalysisCount(userId?: string): Promise<void> {
  // Implementation of incrementAnalysisCount
  console.log(userId);
}
