import { Pool } from 'pg';
import { getPool } from '../db/index.js';

export class MarketingRepository {
  private get db(): Pool {
    return getPool();
  }

  async getCustomersBySegment(segment: string): Promise<string[]> {
    // Retorna emails/phones
    const { rows } = await this.db.query(
      `SELECT email, phone FROM customers WHERE rfm_segment = $1`,
      [segment],
    );
    return rows.map((r) => r.email || r.phone); // Simplificado
  }

  async logCampaign(name: string, segment: string, channel: string): Promise<void> {
    // Tabela de logs de campanha (mockada ou criar se necessário)
    // await this.db.query(...)
    console.log(`[MARKETING] Campaign '${name}' logged for segment '${segment}' via ${channel}`);
  }
}

export const marketingRepository = new MarketingRepository();
