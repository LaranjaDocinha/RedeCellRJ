import { getPool } from '../db/index.js';
class AuditService {
    async recordAuditLog(payload) {
        const pool = getPool(); // Add this line
        const { userId, action, /* entityType, entityId, */ details } = payload;
        try {
            await pool.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)', [userId, action, details]);
        }
        catch (error) {
            console.error('Failed to record audit log:', error);
            // Depending on criticality, you might want to throw the error or handle it silently
        }
    }
    async getAuditLogs(limit = 100, offset = 0) {
        const pool = getPool(); // Add this line
        const result = await pool.query('SELECT al.*, u.email as user_email FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY timestamp DESC LIMIT $1 OFFSET $2', [limit, offset]);
        return result.rows;
    }
}
export const auditService = new AuditService();
