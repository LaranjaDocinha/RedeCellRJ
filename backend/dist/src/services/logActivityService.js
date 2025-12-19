import { getPool } from '../db/index.js';
class LogActivityService {
    async logActivity(options) {
        const { userId, action, resourceType, resourceId, oldValue, newValue, ipAddress } = options;
        const pool = getPool();
        const details = {
            resourceType,
            resourceId,
            oldValue,
            newValue,
            ipAddress,
        };
        try {
            await pool.query(`INSERT INTO audit_logs (user_id, action, details)
         VALUES ($1, $2, $3)`, [userId, action, JSON.stringify(details)]);
        }
        catch (error) {
            console.error('Failed to log activity:', error);
            // Depending on the criticality, you might want to throw an error or just log it.
            // For audit logs, it's often better to just log the failure and not block the main operation.
        }
    }
}
export const logActivityService = new LogActivityService();
