export enum AppView {
  DASHBOARD = 'DASHBOARD',
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
  AD_GENERATOR = 'AD_GENERATOR',
  PROMPT_STUDIO = 'PROMPT_STUDIO',
  KEYWORD_LAB = 'KEYWORD_LAB',
  AUDIT_CENTER = 'AUDIT_CENTER',
  EXPERIMENTS = 'EXPERIMENTS'
}

export type DocCategory = 'COURSE_CONTENT' | 'PAST_PERFORMANCE' | 'STRATEGY_BRIEF' | 'COMPETITOR_INFO' | 'UNCATEGORIZED';

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string; 
  uploadDate: string;
  tags: string[];
  description: string; 
  category: DocCategory; 
  suggestedLinks?: string[]; 
  hash?: string;
  vectorX?: number;
  vectorY?: number;
}

export interface AdGroupRow {
  id: string;
  campaign: string;
  adGroup: string;
  keywords: string;
  landingPage: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  generatedAd?: GeneratedAd;
}

export interface GeneratedAd {
  headlines: string[];
  longHeadlines?: string[]; // For PMax
  descriptions: string[];
  score: number;
  reasoning: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  systemInstruction: string;
  userPromptTemplate: string;
  isDefault: boolean;
}

export interface DashboardStats {
  totalAdsGenerated: number;
  avgAdScore: number;
  documentsIndexed: number;
  creditsUsed: number;
}

export interface KeywordMetric {
  keyword: string;
  volume: number;
  cpc: number;
  competition: 'High' | 'Medium' | 'Low';
  trend: number; 
  source: 'Google Ads' | 'Semrush' | 'Perplexity';
}

// --- GOOGLE ADS TYPES ---

export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  budget: number;
}

export interface GoogleAdsAdGroup {
  id: string;
  name: string;
  campaignId: string;
  status: 'ENABLED' | 'PAUSED';
  type: 'SEARCH' | 'DISPLAY' | 'PERFORMANCE_MAX';
}

export interface GoogleAdsKeyword {
  id: string;
  text: string;
  matchType: 'BROAD' | 'PHRASE' | 'EXACT';
  qualityScore: number; // 1-10
  cpc: number;
  impressions: number;
  ctr: number;
}

export interface AuditIssue {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'BUDGET' | 'KEYWORDS' | 'AD_COPY' | 'SETTINGS';
  title: string;
  description: string;
  impact: string; // e.g. "Est. Wasted Spend: $450/mo"
  aiRecommendation: string;
}

export interface ExperimentVariant {
  name: string; // e.g. "Control - Price Focus" vs "Variant - Quality Focus"
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  cpa: number;
  roas: number;
}

export interface Experiment {
  id: string;
  name: string;
  startDate: string;
  status: 'RUNNING' | 'COMPLETED' | 'DRAFT';
  variants: [ExperimentVariant, ExperimentVariant]; // Limit to 2 for A/B simple view
  aiAnalysis?: string; // Gemini's conclusion
  winner?: 'A' | 'B' | 'INCONCLUSIVE';
}