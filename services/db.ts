import { UploadedDocument, AdGroupRow, PromptTemplate } from '../types';
import { NeonService } from './neonService';
import { configService } from './configService';

const DB_NAME = 'AdGeniusVectorDB';
const DB_VERSION = 2; 

/**
 * UnifiedStore acts as a facade.
 * If Neon config exists, it routes to Postgres (Cloud).
 * Otherwise, it routes to IndexedDB (Local).
 */
export class UnifiedStore {
  private idb: IDBDatabase | null = null;
  private neon: NeonService | null = null;
  private useNeon: boolean = false;

  async init(): Promise<void> {
    // 1. Check for Neon Config in local settings
    const config = configService.getConfig();
    if (config?.neon?.connectionString) {
        this.neon = new NeonService(config.neon.connectionString);
        const connected = await this.neon.init();
        if (connected) {
            console.log("UnifiedStore: Connected to Neon DB 🚀");
            this.useNeon = true;
            return; 
        } else {
            console.warn("UnifiedStore: Neon credentials found but connection failed. Falling back to IndexedDB.");
        }
    }

    // 2. Fallback to IndexedDB
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = (event) => {
        console.error("Database error:", event);
        reject("Failed to open database");
      };
      request.onsuccess = (event) => {
        this.idb = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('documents')) db.createObjectStore('documents', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('ad_rows')) db.createObjectStore('ad_rows', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('experiments')) db.createObjectStore('experiments', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'id' });
      };
    });
  }

  // --- IDB HELPERS ---
  private async idbTransaction(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    if (!this.idb) await this.init();
    if (!this.idb) throw new Error("Local Database not initialized");
    return this.idb.transaction(storeName, mode).objectStore(storeName);
  }

  // --- DOCUMENTS ---
  async saveDocument(doc: UploadedDocument): Promise<void> {
    if (this.useNeon && this.neon) return this.neon.saveDocument(doc);
    
    const store = await this.idbTransaction('documents', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(doc);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllDocuments(): Promise<UploadedDocument[]> {
    if (this.useNeon && this.neon) return this.neon.getAllDocuments();

    const store = await this.idbTransaction('documents', 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDocument(id: string): Promise<void> {
    if (this.useNeon && this.neon) return this.neon.deleteDocument(id);

    const store = await this.idbTransaction('documents', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearDocuments(): Promise<void> {
    if (this.useNeon && this.neon) return this.neon.clearDocuments();

    const store = await this.idbTransaction('documents', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- AD ROWS ---
  async saveAdRows(rows: AdGroupRow[]): Promise<void> {
    if (this.useNeon && this.neon) return this.neon.saveAdRows(rows);

    const store = await this.idbTransaction('ad_rows', 'readwrite');
    return new Promise((resolve, reject) => {
      store.clear().onsuccess = () => {
        if (rows.length === 0) { resolve(); return; }
        let completed = 0;
        rows.forEach(row => {
            store.put(row).onsuccess = () => {
                completed++;
                if (completed === rows.length) resolve();
            };
        });
      };
    });
  }

  async getAdRows(): Promise<AdGroupRow[]> {
    if (this.useNeon && this.neon) return this.neon.getAdRows();

    const store = await this.idbTransaction('ad_rows', 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // --- SETTINGS ---
  async saveTemplate(template: PromptTemplate): Promise<void> {
    if (this.useNeon && this.neon) return this.neon.saveTemplate(template);

    const store = await this.idbTransaction('settings', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(template);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTemplate(id: string): Promise<PromptTemplate | undefined> {
    if (this.useNeon && this.neon) return this.neon.getTemplate(id);

    const store = await this.idbTransaction('settings', 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new UnifiedStore();