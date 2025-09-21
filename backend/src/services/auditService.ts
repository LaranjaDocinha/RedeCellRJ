import pool from '../db/index.js';

interface AuditLogPayload {
  userId?: number; // Optional, as some actions might not be tied to a specific user (e.g., system events)
  action: string;
  entityType?: string;
  entityId?: number;
  details?: object;
}

class AuditService {
  async recordAuditLog(payload: AuditLogPayload): Promise<void> {
    const { userId, action, entityType, entityId, details } = payload;
    try {
      await pool.query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
        [userId, action, entityType, entityId, details]
      );
    } catch (error: unknown) {
      console.error('Failed to record audit log:', error);
      // Depending on criticality, you might want to throw the error or handle it silently
    }
  }

  async getAuditLogs(limit: number = 100, offset: number = 0): Promise<any[]> {
    const result = await pool.query(
      'SELECT al.*, u.email as user_email FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY timestamp DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }
}

export const auditService = new AuditService();