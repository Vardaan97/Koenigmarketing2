import { UploadedDocument, AdGroupRow, PromptTemplate, Experiment, AuditIssue, ApiConfig } from '../types';

const DB_NAME = 'AdGeniusVectorDB';
const DB_VERSION = 2; 

export class UnifiedStore {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("Database error:", event);
        reject("Failed to open database");
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('ad_rows')) {
            db.createObjectStore('ad_rows', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('experiments')) {
            db.createObjectStore('experiments', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'id' });
        }
      };
    });
  }

  private async transaction(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    if (!this.db) await this.init();
    return this.db!.transaction(storeName, mode).objectStore(storeName);
  }

  // --- DOCUMENTS ---
  async saveDocument(doc: UploadedDocument): Promise<void> {
    const store = await this.transaction('documents', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(doc);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllDocuments(): Promise<UploadedDocument[]> {
    const store = await this.transaction('documents', 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDocument(id: string): Promise<void> {
    const store = await this.transaction('documents', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearDocuments(): Promise<void> {
    const store = await this.transaction('documents', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- AD ROWS ---
  async saveAdRows(rows: AdGroupRow[]): Promise<void> {
    const store = await this.transaction('ad_rows', 'readwrite');
    return new Promise((resolve, reject) => {
      store.clear().onsuccess = () => {
        if (rows.length === 0) {
            resolve();
            return;
        }
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
    const store = await this.transaction('ad_rows', 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // --- SETTINGS & TEMPLATES ---
  async saveTemplate(template: PromptTemplate): Promise<void> {
    const store = await this.transaction('settings', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(template);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTemplate(id: string): Promise<PromptTemplate | undefined> {
    const store = await this.transaction('settings', 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new UnifiedStore();