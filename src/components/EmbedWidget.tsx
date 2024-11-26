import  { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CameraCapture from './CameraCapture';
import { SkinAnalysis } from './SkinAnalysis';
import LeadForm, { LeadData } from './LeadForm';
import { Camera, AlertCircle } from 'lucide-react';
import { checkAnalysisCredits, initializeSubscription } from '../lib/analysis/credits';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAnalysisPermissions } from '../hooks/useAnalysisPermissions';
import type { AnalysisCredits } from '../lib/analysis/credits';
import type { AnalysisResult } from './SkinAnalysis/types';

export default function EmbedWidget() {
  const { clientId } = useParams();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credits, setCredits] = useState<AnalysisCredits | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | undefined>(undefined);
  
  const { isLoading: permissionsLoading } = useAnalysisPermissions(clientId);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!clientId) {
        setError('Invalid client ID');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);

        // Initialize subscription if needed
        await initializeSubscription(clientId);
        
        // Then fetch credits
        const creditsInfo = await checkAnalysisCredits(clientId);
        setCredits(creditsInfo);
      } catch (err) {
        console.error('Error checking analysis availability:', err);
        setError('Unable to verify analysis credits. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredits();
  }, [clientId]);

  const handleImageCapture = async (imageUrl: string) => {
    if (!clientId) return;

    try {
      // Create a new analysis record
      const newAnalysisId = `${clientId}_${Date.now()}`;
      await setDoc(doc(db, 'analyses', newAnalysisId), {
        userId: clientId,
        imageUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
        creditDeducted: false
      });

      setAnalysisId(newAnalysisId);
      setCapturedImage(imageUrl);
      setShowCamera(false);
    } catch (err) {
      console.error('Error creating analysis record:', err);
      setError('Failed to process image. Please try again.');
    }
  };

  const handleAnalysisComplete = (results: AnalysisResult) => {
    setAnalysisResults(results);
  };

  const handleLeadSubmit = async (data: LeadData) => {
    if (!credits || credits.available <= 0) {
      setError('Insufficient analysis credits');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLeadSubmitted(true);
      setError(null);
    } catch (err) {
      console.error('Error handling lead submission:', err);
      setError('Failed to process submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-md mx-auto flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="h-full max-w-4xl mx-auto">
        {!showCamera && !capturedImage ? (
          <div className="text-center space-y-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900">
              AI Skin Analysis
            </h2>
            <button
              onClick={() => setShowCamera(true)}
              disabled={!credits || credits.available <= 0}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-full px-6 py-3 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Camera className="w-5 h-5" />
              Start Analysis
            </button>
          </div>
        ) : showCamera && !capturedImage ? (
          <div className="h-full">
            <CameraCapture onImageCapture={handleImageCapture} />
          </div>
        ) : capturedImage && !leadSubmitted ? (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 m-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Complete Your Analysis
            </h2>
            <p className="text-gray-600 mb-6">
              Please provide your details to receive your personalized skin analysis
            </p>
            {analysisId && (
              <LeadForm 
                onSubmit={handleLeadSubmit} 
                isLoading={isSubmitting}
                userId={clientId || ''}
                analysisId={analysisId}
                analysisResults={analysisResults}
                permissionsLoading={permissionsLoading}
              />
            )}
          </div>
        ) : capturedImage ? (
          <div className="space-y-6 p-4 overflow-y-auto h-full">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Results</h2>
              <button
                onClick={() => {
                  setCapturedImage(null);
                  setShowCamera(true);
                  setLeadSubmitted(false);
                  setAnalysisId(null);
                  setAnalysisResults(undefined);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <Camera className="w-4 h-4" />
                New Photo
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img src={capturedImage} alt="Captured" className="w-full" />
              </div>
              <SkinAnalysis 
                imageUrl={capturedImage} 
                userId={clientId || ''} 
                onAnalysisComplete={handleAnalysisComplete}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}