import { getPool } from '../db/index.js';

export const auditService = {
  async logAction(userId: string, action: string, entityType: string, details: any) {
    const client = await getPool().connect();
    try {
      await client.query(
        'INSERT INTO audit_logs (user_id, action, entity_type, details) VALUES ($1, $2, $3, $4)',
        [userId, action, entityType, JSON.stringify(details)]
      );
    } catch (error) {
      console.error('Audit log failed:', error);
    } finally {
      client.release();
    }
  }
};
