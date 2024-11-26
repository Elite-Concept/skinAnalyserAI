import { doc, getDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from './firebase';
import { z } from 'zod';
import type { AnalysisResult } from '../components/SkinAnalysis/types';

// Webhook payload schema validation
const WebhookPayloadSchema = z.object({
  user: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1)
  }),
  analysis: z.object({
    results: z.object({
      skinType: z.string(),
      concerns: z.array(z.string()),
      recommendations: z.array(z.string())
    })
  })
});

export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;

interface WebhookLog {
  success: boolean;
  timestamp: Date;
  error?: string;
  statusCode?: number;
  payload: WebhookPayload;
  retryCount?: number;
  requestDuration?: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 15000]; // Exponential backoff delays in ms

export async function sendWebhook(
  userId: string, 
  payload: WebhookPayload, 
  retryCount = 0
): Promise<boolean> {
  try {
    // Validate payload against schema
    WebhookPayloadSchema.parse(payload);

    // Get webhook configuration
    const settingsDoc = await getDoc(doc(db, 'userSettings', userId));
    if (!settingsDoc.exists()) {
      await logWebhookAttempt(userId, false, payload, 'No webhook configuration found');
      return false;
    }

    const webhookConfig = settingsDoc.data()?.webhook;
    if (!webhookConfig?.enabled || !webhookConfig?.url) {
      await logWebhookAttempt(userId, false, payload, 'Webhook not enabled or URL not configured');
      return false;
    }

    // Validate URL
    let webhookUrl: URL;
    try {
      webhookUrl = new URL(webhookConfig.url);
      if (!webhookUrl.protocol.startsWith('http')) {
        throw new Error('Invalid protocol');
      }
    } catch (error) {
      await logWebhookAttempt(userId, false, payload, 'Invalid webhook URL');
      return false;
    }

    // Send webhook with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    const startTime = Date.now();

    try {
      const response = await fetch(webhookUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SkinAI-Webhook/1.0',
          'X-Webhook-ID': `${userId}_${Date.now()}`,
          'X-Retry-Count': retryCount.toString()
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const requestDuration = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Log successful webhook
      await logWebhookAttempt(userId, true, payload, undefined, response.status, retryCount, requestDuration);
      return true;
    } catch (error) {
      clearTimeout(timeout);
      const requestDuration = Date.now() - startTime;

      // Handle retries for specific errors
      if (
        retryCount < MAX_RETRIES && 
        (error.name === 'AbortError' || // Timeout
         error.message.includes('Failed to fetch') || // Network error
         (error.message.includes('HTTP error') && 
          [429, 502, 503, 504].includes(parseInt(error.message.match(/\d+/)?.[0] || '0'))) // Retryable HTTP errors
        )
      ) {
        // Log retry attempt
        await logWebhookAttempt(
          userId, 
          false, 
          payload, 
          `${error.message} - Retrying (${retryCount + 1}/${MAX_RETRIES})`,
          undefined,
          retryCount,
          requestDuration
        );

        // Wait for delay and retry
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[retryCount]));
        return sendWebhook(userId, payload, retryCount + 1);
      }

      // Log final failure
      await logWebhookAttempt(
        userId,
        false,
        payload,
        error.message,
        undefined,
        retryCount,
        requestDuration
      );
      
      // Re-throw error for proper handling
      throw error;
    }
  } catch (error) {
    console.error('Webhook error:', error);
    throw error; // Re-throw to allow proper error handling in components
  }
}

async function logWebhookAttempt(
  userId: string,
  success: boolean,
  payload: WebhookPayload,
  error?: string,
  statusCode?: number,
  retryCount?: number,
  requestDuration?: number
): Promise<void> {
  try {
    const logRef = doc(collection(db, 'webhookLogs'), `${userId}_${Date.now()}`);
    const logEntry: WebhookLog = {
      success,
      timestamp: new Date(),
      payload,
      ...(error && { error }),
      ...(statusCode && { statusCode }),
      ...(retryCount !== undefined && { retryCount }),
      ...(requestDuration !== undefined && { requestDuration })
    };

    await setDoc(logRef, {
      ...logEntry,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging webhook attempt:', error);
  }
}