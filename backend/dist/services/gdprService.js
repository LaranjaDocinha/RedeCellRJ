import { getPool } from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { logActivityService } from './logActivityService.js';
class GdprService {
    /**
     * Requests the deletion of personal data for a given user or customer.
     * This performs a soft delete by anonymizing sensitive information.
     */
    async requestDataDeletion(entityType, entityId, requestingUserId) {
        const pool = getPool();
        try {
            if (entityType === 'user') {
                // Anonymize user data
                await pool.query(`UPDATE users SET
             name = 'Deleted User',
             email = 'deleted_user_' || $1 || '@example.com',
             password_hash = '',
             loyalty_points = 0,
             updated_at = current_timestamp
           WHERE id = $2`, [entityId.substring(0, 8), entityId]);
                // Optionally, disassociate or anonymize other user-related data
                // For example, set user_id to null in sales, or anonymize sales data
                await pool.query(`UPDATE sales SET user_id = NULL WHERE user_id = $1`, [entityId]);
                // Log the deletion
                await logActivityService.logActivity({
                    userId: requestingUserId,
                    action: `GDPR Data Deletion Request (User)`,
                    resourceType: 'User',
                    resourceId: entityId,
                    // details: `User ${entityId} data anonymized.`,
                });
            }
            else if (entityType === 'customer') {
                // Anonymize customer data
                await pool.query(`UPDATE customers SET
             name = 'Deleted Customer',
             email = 'deleted_customer_' || $1 || '@example.com',
             phone = NULL,
             address = NULL,
             loyalty_points = 0,
             store_credit_balance = 0,
             updated_at = current_timestamp
           WHERE id = $2`, [entityId.substring(0, 8), entityId]);
                // Optionally, disassociate or anonymize other customer-related data
                // For example, set customer_id to null in sales
                await pool.query(`UPDATE sales SET customer_id = NULL WHERE customer_id = $1`, [entityId]);
                // Log the deletion
                await logActivityService.logActivity({
                    userId: requestingUserId,
                    action: `GDPR Data Deletion Request (Customer)`,
                    resourceType: 'Customer',
                    resourceId: entityId,
                    // details: `Customer ${entityId} data anonymized.`,
                });
            }
            else {
                throw new AppError('Invalid entity type for data deletion', 400);
            }
        }
        catch (error) {
            console.error(`Error requesting data deletion for ${entityType} ${entityId}:`, error);
            throw new AppError(`Failed to process data deletion request for ${entityType}`, 500);
        }
    }
    /**
     * Requests an export of all personal data for a given user or customer.
     */
    async requestDataExport(entityType, entityId, requestingUserId) {
        const pool = getPool();
        const data = {};
        try {
            if (entityType === 'user') {
                const userRes = await pool.query('SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1', [entityId]);
                if (userRes.rows.length === 0) {
                    throw new AppError('User not found', 404);
                }
                data.user = userRes.rows[0];
                const salesRes = await pool.query('SELECT * FROM sales WHERE user_id = $1', [entityId]);
                data.sales = salesRes.rows;
                // Add other user-related data as needed (e.g., time clock entries, performance reviews)
                await logActivityService.logActivity({
                    userId: requestingUserId,
                    action: `GDPR Data Export Request (User)`,
                    resourceType: 'User',
                    resourceId: entityId,
                    // details: `User ${entityId} data exported.`,
                });
            }
            else if (entityType === 'customer') {
                const customerRes = await pool.query('SELECT id, name, email, phone, address, created_at, updated_at, loyalty_points, store_credit_balance FROM customers WHERE id = $1', [entityId]);
                if (customerRes.rows.length === 0) {
                    throw new AppError('Customer not found', 404);
                }
                data.customer = customerRes.rows[0];
                const salesRes = await pool.query('SELECT * FROM sales WHERE customer_id = $1', [entityId]);
                data.sales = salesRes.rows;
                const storeCreditRes = await pool.query('SELECT * FROM store_credit_transactions WHERE customer_id = $1', [entityId]);
                data.storeCreditTransactions = storeCreditRes.rows;
                // Add other customer-related data as needed (e.g., appointments, payment methods)
                await logActivityService.logActivity({
                    userId: requestingUserId,
                    action: `GDPR Data Export Request (Customer)`,
                    resourceType: 'Customer',
                    resourceId: entityId,
                    // details: `Customer ${entityId} data exported.`,
                });
            }
            else {
                throw new AppError('Invalid entity type for data export', 400);
            }
            return data;
        }
        catch (error) {
            console.error(`Error requesting data export for ${entityType} ${entityId}:`, error);
            throw new AppError(`Failed to process data export request for ${entityType}`, 500);
        }
    }
}
export const gdprService = new GdprService();
