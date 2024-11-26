import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getSubscription, createTrialSubscription, updateAnalysisUsage } from './subscription';

export interface AnalysisResult {
  userId: string;
  imageUrl: string;
  results: any;
  timestamp: Date;
}

export async function checkAnalysisAvailability(userId: string): Promise<{ available: boolean; remainingCredits: number }> {
  try {
    let subscription = await getSubscription(userId);
    
    if (!subscription) {
      await createTrialSubscription(userId);
      subscription = await getSubscription(userId);
      
      if (!subscription) {
        throw new Error('Failed to initialize subscription');
      }
    }

    const remainingCredits = subscription.analysisCount - subscription.analysisUsed;
    return {
      available: remainingCredits > 0 && subscription.status === 'active',
      remainingCredits
    };
  } catch (error) {
    console.error('Error checking analysis availability:', error);
    throw new Error('Failed to verify analysis availability');
  }
}

export async function recordAnalysis(userId: string, results: any): Promise<void> {
  try {
    const analysisRef = doc(db, 'analyses', `${userId}_${Date.now()}`);
    await setDoc(analysisRef, {
      userId,
      results,
      timestamp: serverTimestamp(),
      status: 'completed'
    });

    await updateAnalysisUsage(userId);
  } catch (error) {
    console.error('Error recording analysis:', error);
    throw new Error('Failed to record analysis results');
  }
}