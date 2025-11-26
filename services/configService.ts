import { ApiConfig } from '../types';

const STORAGE_KEY = 'adgenius_api_config';

class ConfigService {
  private config: ApiConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.config = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load config", e);
    }
  }

  saveConfig(newConfig: ApiConfig) {
    this.config = newConfig;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  }

  getConfig(): ApiConfig | null {
    return this.config;
  }

  hasGoogleAdsConfig(): boolean {
    return !!(this.config?.googleAds?.developerToken && this.config?.googleAds?.refreshToken);
  }

  hasSemrushConfig(): boolean {
    return !!this.config?.semrush?.apiKey;
  }

  clearConfig() {
    this.config = null;
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const configService = new ConfigService();