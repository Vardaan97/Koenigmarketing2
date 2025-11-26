import { GoogleAdsCampaign, GoogleAdsAdGroup, GoogleAdsKeyword } from '../types';
import { configService } from './configService';

/**
 * Service to interact with Google Ads API.
 * Uses injected credentials if available, otherwise mocks for demo.
 */
export class GoogleAdsService {
  private customerId: string | null = null;
  private connected: boolean = false;

  constructor() {
    try {
      const config = configService.getConfig();
      if (config?.googleAds?.customerId) {
          this.customerId = config.googleAds.customerId;
          this.connected = true;
      }
    } catch (e) {
      console.error("Failed to initialize Google Ads Service", e);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async connect(customerId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 800));
    this.customerId = customerId;
    this.connected = true;
    
    // Save to global config
    const current = configService.getConfig() || {};
    const updatedGoogleAds = { ...(current.googleAds || {}), customerId };
    
    configService.saveConfig({
        ...current,
        googleAds: updatedGoogleAds as any // Type assertion for partial updates
    });
    
    return true;
  }

  async fetchCampaigns(): Promise<GoogleAdsCampaign[]> {
    if (!this.connected) throw new Error("Not connected to Google Ads");
    await new Promise(resolve => setTimeout(resolve, 600));

    // Realistic Mock Data for IT Training context
    return [
      { id: 'c1', name: 'Search - AWS Certification', status: 'ENABLED', budget: 1500 },
      { id: 'c2', name: 'Search - Cyber Security (CISSP)', status: 'ENABLED', budget: 2000 },
      { id: 'c3', name: 'PMax - Data Science Bootcamp', status: 'ENABLED', budget: 3000 },
      { id: 'c4', name: 'Display - Retargeting', status: 'PAUSED', budget: 500 },
      { id: 'c5', name: 'Search - Azure Admin', status: 'ENABLED', budget: 1200 },
    ];
  }

  async fetchAdGroups(campaignId: string): Promise<GoogleAdsAdGroup[]> {
    if (!this.connected) throw new Error("Not connected");
    await new Promise(resolve => setTimeout(resolve, 600));

    if (campaignId === 'c1') {
      return [
        { id: 'ag1', campaignId, name: 'AWS Solutions Architect', status: 'ENABLED', type: 'SEARCH' },
        { id: 'ag2', campaignId, name: 'AWS Practitioner', status: 'ENABLED', type: 'SEARCH' },
        { id: 'ag3', campaignId, name: 'AWS SysOps', status: 'PAUSED', type: 'SEARCH' },
      ];
    } else if (campaignId === 'c2') {
      return [
        { id: 'ag4', campaignId, name: 'CISSP Training', status: 'ENABLED', type: 'SEARCH' },
        { id: 'ag5', campaignId, name: 'CISM Certification', status: 'ENABLED', type: 'SEARCH' },
      ];
    }
    
    return [
        { id: 'ag_gen', campaignId, name: 'General Ad Group', status: 'ENABLED', type: 'SEARCH' }
    ];
  }

  async fetchKeywords(adGroupId: string): Promise<GoogleAdsKeyword[]> {
    if (!this.connected) throw new Error("Not connected");
    await new Promise(resolve => setTimeout(resolve, 500));

    const baseMetrics = {
        impressions: Math.floor(Math.random() * 5000) + 500,
        ctr: parseFloat((Math.random() * 5 + 1).toFixed(2)),
        cpc: parseFloat((Math.random() * 15 + 2).toFixed(2))
    };

    if (adGroupId === 'ag1') { 
        return [
            { id: 'k1', text: 'aws solutions architect associate', matchType: 'EXACT', qualityScore: 8, ...baseMetrics, cpc: 8.50, ctr: 4.2 },
            { id: 'k2', text: 'aws certification cost', matchType: 'PHRASE', qualityScore: 6, ...baseMetrics, cpc: 5.20, ctr: 2.8 },
            { id: 'k3', text: 'best aws training course', matchType: 'BROAD', qualityScore: 5, ...baseMetrics, cpc: 4.10, ctr: 1.9 },
        ];
    }
    
    return [
        { id: `k_${adGroupId}_1`, text: 'it certification courses', matchType: 'PHRASE', qualityScore: 7, ...baseMetrics },
        { id: `k_${adGroupId}_2`, text: 'online training', matchType: 'BROAD', qualityScore: 3, ...baseMetrics },
    ];
  }

  async fetchAccountHealthMetrics(): Promise<any> {
      if (!this.connected) await this.connect("SIMULATED-ID");
      await new Promise(resolve => setTimeout(resolve, 1200));

      return {
          lowQualityKeywords: 14,
          conflictingNegatives: 3,
          budgetLimitedCampaigns: 2,
          disapprovedAds: 5,
          pMaxAssetStrength: 'LOW',
          wastedSpend: 1240.50, 
          accountScore: 78
      };
  }
}

export const googleAdsService = new GoogleAdsService();