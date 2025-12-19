import { getPool } from '../db/index.js';

interface AuditLogPayload {
  userId?: string; // Changed to string as user_id is UUID
  action: string;
  entityType?: string; // Added
  entityId?: string; // Added
  details?: object;
}

interface AuditLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

class AuditService {
  async recordAuditLog(payload: AuditLogPayload): Promise<void> {
    const pool = getPool();
    const { userId, action, entityType, entityId, details } = payload;
    try {
      await pool.query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
        [userId, action, entityType, entityId, details],
      );
    } catch (error: unknown) {
      console.error('Failed to record audit log:', error);
    }
  }

  async getAuditLogs(filters: AuditLogFilters = {}): Promise<{ logs: any[]; totalCount: number }> {
    const { userId, action, entityType, entityId, startDate, endDate, limit = 100, offset = 0 } = filters;
    const pool = getPool();

    const queryParams: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (userId) {
      conditions.push(`al.user_id = $${paramIndex++}`);
      queryParams.push(userId);
    }
    if (action) {
      conditions.push(`al.action ILIKE $${paramIndex++}`); // ILIKE para busca case-insensitive
      queryParams.push(`%${action}%`);
    }
    if (entityType) {
      conditions.push(`al.entity_type ILIKE $${paramIndex++}`);
      queryParams.push(`%${entityType}%`);
    }
    if (entityId) {
      conditions.push(`al.entity_id = $${paramIndex++}`);
      queryParams.push(entityId);
    }
    if (startDate) {
      conditions.push(`al.timestamp >= $${paramIndex++}`);
      queryParams.push(startDate);
    }
    if (endDate) {
      conditions.push(`al.timestamp <= $${paramIndex++}`);
      queryParams.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Query para contar o total de logs (para paginação)
    const countQuery = `
      SELECT COUNT(*) FROM audit_logs al ${whereClause};
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    // Query para buscar os logs com filtros, ordenação e paginação
    const logsQuery = `
      SELECT al.*, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.timestamp DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    queryParams.push(limit, offset);

    const result = await pool.query(logsQuery, queryParams);
    return { logs: result.rows, totalCount };
  }
}

export const auditService = new AuditService();