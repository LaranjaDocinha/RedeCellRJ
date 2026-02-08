import { Pool, PoolClient } from 'pg';
import { getPool } from '../db/index.js';

export interface AuditLog {
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
}

export class AuditRepository {
  private get db(): Pool {
    return getPool();
  }

  async create(data: AuditLog, client?: PoolClient): Promise<void> {
    const executor = client || this.db;
    const query = `
      INSERT INTO audit_logs 
      (user_id, action, entity_type, entity_id, details, old_values, new_values, ip_address, user_agent) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const values = [
      data.user_id,
      data.action,
      data.entity_type,
      data.entity_id,
      data.details ? JSON.stringify(data.details) : null,
      data.old_values ? JSON.stringify(data.old_values) : null,
      data.new_values ? JSON.stringify(data.new_values) : null,
      data.ip_address,
      data.user_agent,
    ];

    if (client) {
      await client.query(query, values);
    } else {
      executor.query(query, values).catch((err) => console.error('Audit Log Insert Failed:', err));
    }
  }
}

export const auditRepository = new AuditRepository();
