import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useAnalysisPermissions } from '../hooks/useAnalysisPermissions';
import { addLead } from '../lib/firebase';
import { deductAnalysisCredit } from '../lib/analysis/credits';
import { sendWebhook } from '../lib/webhooks';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { AnalysisResult } from './SkinAnalysis/types';

interface LeadFormProps {
  onSubmit: (data: LeadData) => void;
  isLoading?: boolean;
  userId: string;
  analysisId: string;
  analysisResults?: AnalysisResult;
  permissionsLoading?: boolean;
}

export interface LeadData {
  name: string;
  email: string;
  phone: string;
  userId: string;
  analysisId: string;
}

export default function LeadForm({ 
  onSubmit, 
  isLoading = false, 
  userId, 
  analysisId,
  analysisResults,
  permissionsLoading = false
}: LeadFormProps) {
  const { user } = useAuth();
  const { canAnalyze, remainingAnalyses, } = useAnalysisPermissions(user?.uid);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadData>();

  const submitForm = async (data: LeadData) => {
    if (!canAnalyze && remainingAnalyses <= 0) {
      return;
    }

    try {
      setWebhookError(null);

      // Add the lead
      const leadId = await addLead({
        ...data,
        userId,
        analysisId
      });

      // Only proceed if lead was successfully added
      if (leadId) {
        // Deduct credit
        await deductAnalysisCredit(userId, analysisId);

        // Send webhook if analysis results are available
        if (analysisResults) {
          try {
            await sendWebhook(userId, {
              user: {
                name: data.name,
                email: data.email,
                phone: data.phone
              },
              analysis: {
                results: analysisResults
              }
            });
          } catch (webhookError) {
            console.error('Webhook error:', webhookError);
            setWebhookError('Form submitted successfully, but webhook delivery failed');
          }
        }

        onSubmit(data);
      }
    } catch (error) {
      console.error('Error processing submission:', error);
      throw error;
    }
  };

  // Don't show insufficient credits message during initial load
  if (permissionsLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-100 rounded"></div>
        <div className="h-10 bg-gray-100 rounded"></div>
        <div className="h-10 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (!canAnalyze && remainingAnalyses <= 0) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Insufficient Analysis Credits</span>
        </div>
        <p className="text-sm">
          Please upgrade your plan to continue analyzing skin images.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      {webhookError && (
        <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{webhookError}</span>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Name is required' })}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          {...register('phone', {
            required: 'Phone number is required',
            pattern: {
              value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
              message: 'Invalid phone number',
            },
          })}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          'View My Analysis'
        )}
      </button>
    </form>
  );
}