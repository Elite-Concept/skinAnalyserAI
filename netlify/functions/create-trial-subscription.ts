import { Handler } from '@netlify/functions';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId } = JSON.parse(event.body || '{}');

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing userId' }),
      };
    }

    // Verify user exists
    try {
      const user = await getAuth().getUser(userId);
      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'User not found' }),
        };
      }
    } catch (error) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Invalid user ID' }),
      };
    }

    // Check if user already has a subscription
    const subscriptionDoc = await db.collection('subscriptions').doc(userId).get();
    if (subscriptionDoc.exists) {
      const data = subscriptionDoc.data();
      if (data?.trial || data?.status === 'active') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'User already has an active subscription or trial' }),
        };
      }
    }

    // Create trial subscription record
    const trialData = {
      trial: true,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      analysisCount: 50,
      analysisUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('subscriptions').doc(userId).set(trialData, { merge: true });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Trial subscription created successfully'
      }),
    };
  } catch (error) {
    console.error('Trial subscription error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create trial subscription. Please try again later.'
      }),
    };
  }
};