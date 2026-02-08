import { Pool } from 'pg';
import { getPool } from '../db/index.js';

export interface FeatureFlag {
  id?: number;
  name: string;
  description?: string;
  is_enabled: boolean;
  rules?: any; // JSONB para regras complexas (ex: por filial, por usuário)
  updated_at?: Date;
}

export class FeatureFlagRepository {
  private get db(): Pool {
    return getPool();
  }

  async findAll(): Promise<FeatureFlag[]> {
    const { rows } = await this.db.query('SELECT * FROM feature_flags');
    return rows;
  }

  async findByName(name: string): Promise<FeatureFlag | undefined> {
    const { rows } = await this.db.query('SELECT * FROM feature_flags WHERE name = $1', [name]);
    return rows[0];
  }

  async update(name: string, isEnabled: boolean): Promise<void> {
    await this.db.query(
      'INSERT INTO feature_flags (name, is_enabled) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET is_enabled = EXCLUDED.is_enabled, updated_at = NOW()',
      [name, isEnabled],
    );
  }
}

export const featureFlagRepository = new FeatureFlagRepository();
