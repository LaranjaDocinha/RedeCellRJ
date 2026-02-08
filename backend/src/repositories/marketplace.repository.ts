import { Pool } from 'pg';
import { getPool } from '../db/index.js';

export interface MarketplaceConfig {
  id: number;
  name: string;
  api_key?: string;
  api_secret?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: Date;
  is_active: boolean;
}

export interface MarketplaceListing {
  id: number;
  marketplace_id: number;
  product_variation_id: number;
  external_id: string;
  external_url?: string;
  status: string;
  last_synced_at?: Date;
  sync_error?: string;
}

export class MarketplaceRepository {
  private get db(): Pool {
    return getPool();
  }

  async findConfigById(id: number): Promise<MarketplaceConfig | undefined> {
    const { rows } = await this.db.query('SELECT * FROM marketplace_configs WHERE id = $1', [id]);
    return rows[0];
  }

  async findActiveConfig(id: number): Promise<MarketplaceConfig | undefined> {
    const { rows } = await this.db.query(
      'SELECT * FROM marketplace_configs WHERE id = $1 AND is_active = TRUE',
      [id],
    );
    return rows[0];
  }

  async findAllConfigs(): Promise<MarketplaceConfig[]> {
    const { rows } = await this.db.query('SELECT * FROM marketplace_configs');
    return rows;
  }

  async createConfig(data: Partial<MarketplaceConfig>): Promise<MarketplaceConfig> {
    const { rows } = await this.db.query(
      `INSERT INTO marketplace_configs (name, api_key, api_secret, access_token, refresh_token, token_expires_at, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        data.name,
        data.api_key,
        data.api_secret,
        data.access_token,
        data.refresh_token,
        data.token_expires_at,
        data.is_active ?? true,
      ],
    );
    return rows[0];
  }

  async updateConfig(
    id: number,
    data: Partial<MarketplaceConfig>,
  ): Promise<MarketplaceConfig | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key !== 'id') {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.findConfigById(id);

    values.push(id);
    const { rows } = await this.db.query(
      `UPDATE marketplace_configs SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0];
  }

  async deleteConfig(id: number): Promise<boolean> {
    const { rowCount } = await this.db.query('DELETE FROM marketplace_configs WHERE id = $1', [id]);
    return (rowCount || 0) > 0;
  }

  async findListingsByVariation(
    variationId: number,
    status: string = 'active',
  ): Promise<MarketplaceListing[]> {
    const { rows } = await this.db.query(
      'SELECT * FROM marketplace_listings WHERE product_variation_id = $1 AND status = $2',
      [variationId, status],
    );
    return rows;
  }

  async findListingsByConfig(configId: number): Promise<MarketplaceListing[]> {
    const { rows } = await this.db.query(
      'SELECT ml.*, pv.sku FROM marketplace_listings ml JOIN product_variations pv ON ml.product_variation_id = pv.id WHERE ml.marketplace_id = $1',
      [configId],
    );
    return rows;
  }

  async findListingByExternalId(
    marketplaceId: number,
    externalId: string,
  ): Promise<MarketplaceListing | undefined> {
    const { rows } = await this.db.query(
      'SELECT * FROM marketplace_listings WHERE marketplace_id = $1 AND external_id = $2',
      [marketplaceId, externalId],
    );
    return rows[0];
  }

  async createListing(data: Partial<MarketplaceListing>): Promise<MarketplaceListing> {
    const { rows } = await this.db.query(
      'INSERT INTO marketplace_listings (marketplace_id, product_variation_id, external_id, external_url, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (marketplace_id, external_id) DO UPDATE SET product_variation_id = EXCLUDED.product_variation_id, external_url = EXCLUDED.external_url, status = EXCLUDED.status RETURNING *',
      [
        data.marketplace_id,
        data.product_variation_id,
        data.external_id,
        data.external_url,
        data.status || 'active',
      ],
    );
    return rows[0];
  }

  async updateListingStatus(id: number, status: string): Promise<void> {
    await this.db.query(
      'UPDATE marketplace_listings SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id],
    );
  }

  async updateListingSyncStatus(id: number, error?: string): Promise<void> {
    if (error) {
      await this.db.query('UPDATE marketplace_listings SET sync_error = $1 WHERE id = $2', [
        error,
        id,
      ]);
    } else {
      await this.db.query(
        'UPDATE marketplace_listings SET last_synced_at = NOW(), sync_error = NULL WHERE id = $1',
        [id],
      );
    }
  }

  async deleteListing(id: number): Promise<boolean> {
    const { rowCount } = await this.db.query('DELETE FROM marketplace_listings WHERE id = $1', [
      id,
    ]);
    return (rowCount || 0) > 0;
  }
}

export const marketplaceRepository = new MarketplaceRepository();
