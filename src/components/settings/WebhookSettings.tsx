import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, Globe, Loader2, CheckCircle2, History, Clock, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WebhookConfig {
  enabled: boolean;
  url: string;
  lastUpdated?: Date;
  lastTestSuccess?: boolean;
  lastTestTimestamp?: Date;
}

interface WebhookForm {
  url: string;
  enabled: boolean;
}

interface WebhookLog {
  success: boolean;
  timestamp: Date;
  error?: string;
  statusCode?: number;
  retryCount?: number;
  requestDuration?: number;
}

export default function WebhookSettings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentLogs, setRecentLogs] = useState<WebhookLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<WebhookForm>({
    defaultValues: {
      enabled: false,
      url: ''
    }
  });

  const isEnabled = watch('enabled');
  const webhookUrl = watch('url');

  useEffect(() => {
    const loadWebhookConfig = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const docRef = doc(db, 'userSettings', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.webhook) {
            setValue('enabled', data.webhook.enabled);
            setValue('url', data.webhook.url || '');
            setTestSuccess(data.webhook.lastTestSuccess || null);
          }
        }

        await loadRecentLogs();
      } catch (err) {
        console.error('Error loading webhook config:', err);
        setError('Failed to load webhook settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadWebhookConfig();
  }, [user, setValue]);

  // Auto-refresh logs
  useEffect(() => {
    if (!autoRefresh || !showLogs) return;

    const interval = setInterval(() => {
      loadRecentLogs();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, showLogs]);

  const loadRecentLogs = async () => {
    if (!user) return;

    try {
      const logsQuery = query(
        collection(db, 'webhookLogs'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      const logsSnapshot = await getDocs(logsQuery);
      const logs = logsSnapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as WebhookLog[];
      
      setRecentLogs(logs);
    } catch (error) {
      console.error('Error loading webhook logs:', error);
    }
  };

  const testWebhook = async () => {
    if (!webhookUrl || !user) return;

    try {
      setIsTesting(true);
      setError(null);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          userId: user.uid
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTestSuccess(true);

      // Update last test result
      const docRef = doc(db, 'userSettings', user.uid);
      await setDoc(docRef, {
        webhook: {
          lastTestSuccess: true,
          lastTestTimestamp: new Date()
        }
      }, { merge: true });

    } catch (err) {
      console.error('Error testing webhook:', err);
      setTestSuccess(false);
      setError('Failed to test webhook. Please check the URL and try again.');
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (data: WebhookForm) => {
    if (!user) return;

    try {
      setIsSaving(true);
      setSaveSuccess(false);
      setError(null);

      // Validate URL if enabled
      if (data.enabled) {
        try {
          const url = new URL(data.url);
          if (!url.protocol.startsWith('http')) {
            throw new Error('URL must use HTTP or HTTPS protocol');
          }
        } catch (err) {
          setError('Please enter a valid URL');
          return;
        }
      }

      const webhookConfig: WebhookConfig = {
        enabled: data.enabled,
        url: data.url,
        lastUpdated: new Date()
      };

      const docRef = doc(db, 'userSettings', user.uid);
      await setDoc(docRef, {
        webhook: webhookConfig
      }, { merge: true });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving webhook config:', err);
      setError('Failed to save webhook settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">Webhook Integration</h2>
          </div>
          {showLogs && (
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 text-sm ${
                autoRefresh ? 'text-blue-600' : 'text-gray-600'
              } hover:text-blue-600`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Enable Webhooks</label>
            <p className="text-sm text-gray-500">
              Forward form submissions to your endpoint
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              {...register('enabled')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className={isEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Webhook URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              {...register('url', {
                required: isEnabled ? 'Webhook URL is required' : false,
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL starting with http:// or https://'
                }
              })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://api.example.com/webhook"
            />
            <button
              type="button"
              onClick={testWebhook}
              disabled={!isEnabled || isTesting || !webhookUrl}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test'
              )}
            </button>
          </div>
          {errors.url && (
            <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
          )}
          {testSuccess !== null && (
            <p className={`mt-2 text-sm flex items-center gap-1 ${
              testSuccess ? 'text-green-600' : 'text-red-600'
            }`}>
              {testSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Webhook test successful
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Webhook test failed
                </>
              )}
            </p>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Webhook Payload</h3>
          <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
              {`{
                "user": {
                  "name": "string",
                  "email": "string",
                  "phone": "string"
                },
                "analysis": {
                  "results": {
                    "skinType": "string",
                    "concerns": ["string"],
                    "recommendations": ["string"]
                  }
                }
              }`}
          </pre>
        </div>

        {showLogs && recentLogs.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h3 className="text-sm font-medium text-gray-900">Recent Webhook Logs</h3>
            </div>
            <div className="divide-y">
              {recentLogs.map((log, index) => (
                <div key={index} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {log.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm text-gray-600">
                        {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {log.requestDuration && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {log.requestDuration}ms
                        </span>
                      )}
                      <span className={`text-sm ${log.success ? 'text-green-600' : 'text-red-600'}`}>
                        {log.success ? 'Success' : log.error || 'Failed'}
                        {log.statusCode && ` (${log.statusCode})`}
                      </span>
                    </div>
                  </div>
                  {log.retryCount !== undefined && log.retryCount > 0 && (
                    <p className="text-xs text-gray-500">
                      Retry attempt {log.retryCount}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            {showLogs ? 'Hide Logs' : 'Show Logs'}
          </button>

          <div className="flex items-center gap-4">
            {saveSuccess && (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}