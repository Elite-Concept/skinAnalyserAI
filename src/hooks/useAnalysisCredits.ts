import { useState, useEffect } from 'react';
import { checkAnalysisCredits, syncAnalysisCredits, type AnalysisCredits } from '../lib/analysis/credits';

export function useAnalysisCredits(userId?: string) {
  const [credits, setCredits] = useState<AnalysisCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchCredits = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const creditsInfo = await checkAnalysisCredits(userId);
        
        if (mounted) {
          setCredits(creditsInfo);
        }
      } catch (err) {
        console.error('Error fetching analysis credits:', err);
        if (mounted) {
          setError('Unable to fetch analysis credits. Please try refreshing the page.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCredits();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const syncCredits = async () => {
    if (!userId) {
      setError('User ID is required to sync credits');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedCredits = await syncAnalysisCredits(userId);
      setCredits(updatedCredits);
    } catch (err) {
      console.error('Error syncing credits:', err);
      setError('Failed to sync analysis credits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    credits,
    loading,
    error,
    syncCredits
  };
}