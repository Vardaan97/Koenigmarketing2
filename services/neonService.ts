import { Pool } from '@neondatabase/serverless';
import { UploadedDocument, AdGroupRow, PromptTemplate } from '../types';

/**
 * Handles communication with Neon PostgreSQL
 */
export class NeonService {
  private connectionString: string;
  private pool: Pool | null = null;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }

  /**
   * Initializes the connection and creates schema if missing.
   */
  async init(): Promise<boolean> {
    try {
      this.pool = new Pool({ connectionString: this.connectionString });
      
      // Test connection
      const client = await this.pool.connect();
      
      // Auto-Migration: Create Tables if they don't exist
      // We use JSONB columns ('data') to store the complex React state objects directly
      // This gives us the flexibility of NoSQL with the reliability of Postgres.
      await client.query(`
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS ads (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS experiments (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        );
        CREATE TABLE IF NOT EXISTS settings (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        );
      `);
      
      client.release();
      return true;
    } catch (e) {
      console.error("Neon Connection Failed:", e);
      return false;
    }
  }

  // --- GENERIC HELPERS ---

  private async upsert(table: string, id: string, data: any) {
    if (!this.pool) throw new Error("Neon not connected");
    const json = JSON.stringify(data);
    const query = `
      INSERT INTO ${table} (id, data) VALUES ($1, $2)
      ON CONFLICT (id) DO UPDATE SET data = $2;
    `;
    await this.pool.query(query, [id, json]);
  }

  private async getAll<T>(table: string): Promise<T[]> {
    if (!this.pool) throw new Error("Neon not connected");
    const { rows } = await this.pool.query(`SELECT data FROM ${table}`);
    return rows.map(r => r.data as T);
  }

  private async getById<T>(table: string, id: string): Promise<T | undefined> {
    if (!this.pool) throw new Error("Neon not connected");
    const { rows } = await this.pool.query(`SELECT data FROM ${table} WHERE id = $1`, [id]);
    return rows.length > 0 ? rows[0].data : undefined;
  }

  private async delete(table: string, id: string) {
    if (!this.pool) throw new Error("Neon not connected");
    await this.pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  }

  private async clear(table: string) {
    if (!this.pool) throw new Error("Neon not connected");
    await this.pool.query(`TRUNCATE TABLE ${table}`);
  }

  // --- TYPE SPECIFIC WRAPPERS ---

  async saveDocument(doc: UploadedDocument) { return this.upsert('documents', doc.id, doc); }
  async getAllDocuments() { return this.getAll<UploadedDocument>('documents'); }
  async deleteDocument(id: string) { return this.delete('documents', id); }
  async clearDocuments() { return this.clear('documents'); }

  async saveAdRows(rows: AdGroupRow[]) {
    // Transactional bulk update for workspace consistency
    if (!this.pool) return;
    const client = await this.pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM ads'); 
        for (const row of rows) {
            await client.query('INSERT INTO ads (id, data) VALUES ($1, $2)', [row.id, JSON.stringify(row)]);
        }
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
  }

  async getAdRows() { return this.getAll<AdGroupRow>('ads'); }

  async saveTemplate(template: PromptTemplate) { return this.upsert('settings', template.id, template); }
  async getTemplate(id: string) { return this.getById<PromptTemplate>('settings', id); }
}