import { GoogleAdsCampaign, GoogleAdsAdGroup, GoogleAdsKeyword } from '../types';

/**
 * Service to interact with Google Ads API.
 * Simulates API responses for the "IT Training" domain.
 * Persists connection state to LocalStorage.
 */
export class GoogleAdsService {
  private customerId: string | null = null;
  private connected: boolean = false;

  constructor() {
    // Check if we have a stored connection
    const stored = localStorage.getItem('google_ads_connection');
    if (stored) {
      this.customerId = JSON.parse(stored).customerId;
      this.connected = true;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async connect(customerId: string): Promise<boolean> {
    // Simulate authentication handshake
    await new Promise(resolve => setTimeout(resolve, 800));
    this.customerId = customerId;
    this.connected = true;
    localStorage.setItem('google_ads_connection', JSON.stringify({ customerId }));
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

    // Return mocked groups based on campaign ID logic
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
    } else if (campaignId === 'c3') {
       return [
        { id: 'ag6', campaignId, name: 'Asset Group - Python', status: 'ENABLED', type: 'PERFORMANCE_MAX' },
        { id: 'ag7', campaignId, name: 'Asset Group - ML', status: 'ENABLED', type: 'PERFORMANCE_MAX' },
      ];
    }
    
    return [
        { id: 'ag_gen', campaignId, name: 'General Ad Group', status: 'ENABLED', type: 'SEARCH' }
    ];
  }

  async fetchKeywords(adGroupId: string): Promise<GoogleAdsKeyword[]> {
    if (!this.connected) throw new Error("Not connected");
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate realistic keywords based on ad group context logic
    const baseMetrics = {
        impressions: Math.floor(Math.random() * 5000) + 500,
        ctr: parseFloat((Math.random() * 5 + 1).toFixed(2)),
        cpc: parseFloat((Math.random() * 15 + 2).toFixed(2))
    };

    if (adGroupId === 'ag1') { // AWS Architect
        return [
            { id: 'k1', text: 'aws solutions architect associate', matchType: 'EXACT', qualityScore: 8, ...baseMetrics, cpc: 8.50, ctr: 4.2 },
            { id: 'k2', text: 'aws certification cost', matchType: 'PHRASE', qualityScore: 6, ...baseMetrics, cpc: 5.20, ctr: 2.8 },
            { id: 'k3', text: 'best aws training course', matchType: 'BROAD', qualityScore: 5, ...baseMetrics, cpc: 4.10, ctr: 1.9 },
            { id: 'k4', text: 'aws architect exam dump', matchType: 'BROAD', qualityScore: 2, ...baseMetrics, cpc: 2.10, ctr: 5.5 } // Low QS bait
        ];
    }
    
    // Generic filler
    return [
        { id: `k_${adGroupId}_1`, text: 'it certification courses', matchType: 'PHRASE', qualityScore: 7, ...baseMetrics },
        { id: `k_${adGroupId}_2`, text: 'online training', matchType: 'BROAD', qualityScore: 3, ...baseMetrics },
        { id: `k_${adGroupId}_3`, text: 'bootcamp near me', matchType: 'EXACT', qualityScore: 8, ...baseMetrics }
    ];
  }

  // Used by Audit Center to fetch raw data before AI analysis
  async fetchAccountHealthMetrics(): Promise<any> {
      if (!this.connected) await this.connect("SIMULATED-ID");
      await new Promise(resolve => setTimeout(resolve, 1200));

      return {
          lowQualityKeywords: 14, // Count of QS < 5
          conflictingNegatives: 3,
          budgetLimitedCampaigns: 2,
          disapprovedAds: 5,
          pMaxAssetStrength: 'LOW', // Average
          wastedSpend: 1240.50, // Last 30 days on non-converting terms
          accountScore: 78
      };
  }
}

export const googleAdsService = new GoogleAdsService();