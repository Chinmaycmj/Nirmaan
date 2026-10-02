export type AIProviderType = 'builtin' | 'gemini' | 'openai' | 'anthropic';

export interface AISettings {
  provider: AIProviderType;
  apiKey?: string;
  model?: string;
  customEndpoint?: string;
}

export type ExplanationLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ConceptExplanation {
  concept: string;
  language: string;
  syntax: string;
  whatItDoes: string;
  whyItExists: string;
  usedBy: string;
  beginnerExplanation: string;
  intermediateExplanation: string;
  advancedExplanation: string;
  commonPitfalls: string[];
}

export interface ErrorDiagnostic {
  whatHappened: string;
  whereItHappened: string;
  whatMessageMeans: string;
  conceptInvolved: string;
  investigationSteps: string[];
  suggestedHint: string;
}

export interface ValidationEvaluation {
  passed: boolean;
  score: number; // 0 - 100
  title: string;
  message: string;
  testResults: {
    description: string;
    passed: boolean;
    actual?: any;
    expected?: any;
  }[];
  diagnostic?: ErrorDiagnostic;
}
