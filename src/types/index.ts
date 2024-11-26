export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AnalysisResult {
  skinType: string;
  concerns: string[];
  recommendations: string[];
}

export interface Subscription {
  id: string;
  status: 'active' | 'inactive' | 'cancelled';
  trial: boolean;
  analysisCount: number;
  analysisUsed: number;
  startDate: Date;
  endDate: Date | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface WebhookConfig {
  enabled: boolean;
  url: string;
  lastUpdated?: Date;
  lastTestSuccess?: boolean;
  lastTestTimestamp?: Date;
}

export interface WebhookPayload {
  user: {
    name: string;
    email: string;
    phone: string;
  };
  analysis: {
    results: AnalysisResult;
  };
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  userId: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  timestamp: {
    toDate: () => Date;
  };
  analysisId?: string;
}