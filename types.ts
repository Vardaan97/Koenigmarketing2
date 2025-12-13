export enum AppView {
  DASHBOARD = 'DASHBOARD',
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
  AD_GENERATOR = 'AD_GENERATOR',
  PROMPT_STUDIO = 'PROMPT_STUDIO',
  KEYWORD_LAB = 'KEYWORD_LAB',
  AUDIT_CENTER = 'AUDIT_CENTER',
  EXPERIMENTS = 'EXPERIMENTS',
  SETTINGS = 'SETTINGS'
}

export type DocCategory = 'COURSE_CONTENT' | 'PAST_PERFORMANCE' | 'STRATEGY_BRIEF' | 'COMPETITOR_INFO' | 'UNCATEGORIZED';

export interface CsvSchemaMetadata {
  columnName: string;
  entityType: string; // e.g., 'Metric', 'Dimension', 'Identifier'
  description: string;
  mappedTo?: string; // e.g., 'CPC', 'Campaign Name'
}

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
  // New: Schema Intelligence for CSVs
  schemaMetadata?: CsvSchemaMetadata[];
  rowSample?: any[];
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

export interface KeywordMetric {
  keyword: string;
  volume: number;
  cpc: number;
  competition: 'High' | 'Medium' | 'Low';
  trend: number; 
  source: 'Google Ads' | 'Semrush' | 'Perplexity';
}

// --- CONFIGURATION TYPES ---

export interface ApiConfig {
  googleAds?: {
    customerId: string;
    developerToken?: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
  };
  semrush?: {
    apiKey: string;
  };
  neon?: {
    connectionString: string;
  };
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
  name: string; 
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
  variants: [ExperimentVariant, ExperimentVariant];
  aiAnalysis?: string;
  winner?: 'A' | 'B' | 'INCONCLUSIVE';
}

// --- ENHANCED DASHBOARD TYPES ---

export interface DashboardStats {
  totalAdsGenerated: number;
  avgAdScore: number;
  documentsIndexed: number;
  creditsUsed: number;
  completedAds: number;
  pendingAds: number;
  failedAds: number;
  topCampaign?: string;
}

export interface TechNewsItem {
  id: string;
  title: string;
  url: string;
  source: 'HackerNews' | 'DevTo' | 'GitHub';
  score?: number;
  author?: string;
  timestamp: string;
  tags?: string[];
  commentsCount?: number;
}

export interface CertificationTrend {
  name: string;
  provider: string;
  demandScore: number; // 0-100
  salaryImpact: string;
  growthRate: number; // percentage
  jobCount: number;
  icon: string;
}

export interface JobMarketPulse {
  totalJobs: number;
  avgSalary: number;
  topSkills: { skill: string; count: number }[];
  topLocations: { location: string; count: number }[];
  remotePercentage: number;
  growthVsLastMonth: number;
}

export interface ActivityItem {
  id: string;
  type: 'ad_generated' | 'document_uploaded' | 'audit_completed' | 'experiment_started' | 'keyword_researched';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface TopPerformingAd {
  id: string;
  campaign: string;
  adGroup: string;
  headline: string;
  score: number;
  estimatedCtr?: number;
}

export interface ITEvent {
  id: string;
  title: string;
  date: string;
  type: 'webinar' | 'conference' | 'certification_deadline' | 'course_launch';
  provider?: string;
  url?: string;
  isVirtual: boolean;
}

export interface MarketInsight {
  id: string;
  category: 'opportunity' | 'warning' | 'trend' | 'tip';
  title: string;
  description: string;
  actionable: string;
  priority: 'high' | 'medium' | 'low';
  generatedAt: string;
}

export interface CoursePerformance {
  courseName: string;
  adsGenerated: number;
  avgScore: number;
  clicks?: number;
  conversions?: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CompetitorIntel {
  name: string;
  estimatedAdSpend: string;
  topKeywords: string[];
  strengthScore: number;
  weaknesses: string[];
}

export interface WeatherWidget {
  location: string;
  temp: number;
  condition: string;
  icon: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  view: AppView;
  description: string;
}