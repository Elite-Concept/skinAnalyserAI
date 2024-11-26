export interface AnalysisResult {
  skinType: string;
  concerns: string[];
  recommendations: string[];
}

export interface ValidationError {
  message: string;
  code: string;
}