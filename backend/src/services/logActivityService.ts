import { getPool } from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface LogActivityOptions {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
}

class LogActivityService {
  async logActivity(options: LogActivityOptions): Promise<void> {
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
      // Table audit_logs does not exist in master schema yet.
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, details)
         VALUES ($1, $2, $3)`,
        [userId, action, JSON.stringify(details)],
      );
      console.log(`[Audit Log] ${action} by ${userId}`, details);
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Depending on the criticality, you might want to throw an error or just log it.
      // For audit logs, it's often better to just log the failure and not block the main operation.
    }
  }
}

export const logActivityService = new LogActivityService();
