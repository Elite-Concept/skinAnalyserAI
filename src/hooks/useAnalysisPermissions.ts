import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { plans } from '../lib/stripe';

export interface AnalysisPermissions {
  canAnalyze: boolean;
  remainingAnalyses: number;
  error?: string;
  isLoading: boolean;
}

export function useAnalysisPermissions(userId: string | undefined): AnalysisPermissions {
  const [permissions, setPermissions] = useState<AnalysisPermissions>({
    canAnalyze: false,
    remainingAnalyses: 0,
    isLoading: true
  });

  useEffect(() => {
    if (!userId) {
      setPermissions({
        canAnalyze: true, // Allow analysis for new users
        remainingAnalyses: 50, // Default trial credits
        isLoading: false
      });
      return;
    }

    // Set initial loading state
    setPermissions(prev => ({ ...prev, isLoading: true }));

    const unsubscribe = onSnapshot(
      doc(db, 'subscriptions', userId),
      (doc) => {
        if (!doc.exists()) {
          // New user without subscription document
          setPermissions({
            canAnalyze: true,
            remainingAnalyses: 50,
            isLoading: false
          });
          return;
        }

        const data = doc.data();
        const plan = plans.find(p => p.id === data.priceId) || {
          analysisCount: 50 // Default trial plan
        };
        
        const isActive = data.status === 'active' || data.trial || !data.status; // Include users without status
        const remainingAnalyses = plan.analysisCount - (data.analysisUsed || 0);

        setPermissions({
          canAnalyze: isActive && remainingAnalyses > 0,
          remainingAnalyses,
          error: !isActive ? 'Subscription inactive' : 
                 remainingAnalyses <= 0 ? 'Analysis limit reached' : undefined,
          isLoading: false
        });
      },
      (error) => {
        console.error('Error checking analysis permissions:', error);
        setPermissions({
          canAnalyze: false,
          remainingAnalyses: 0,
          error: 'Failed to check permissions',
          isLoading: false
        });
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return permissions;
}