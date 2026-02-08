import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

export const gdprService = {
  async exportUserData(userId: string): Promise<any> {
    const userData: any = {};

    // Fetch user details
    const userRes = await pool.query(
      'SELECT id, name, email, phone, cpf, created_at FROM users WHERE id = $1',
      [userId],
    );
    if (userRes.rows.length === 0) {
      throw new AppError('User not found.', 404);
    }
    userData.user = userRes.rows[0];

    // Fetch customer details if user is a customer
    const customerRes = await pool.query(
      'SELECT id, name, email, phone, cpf, address, store_credit_balance, loyalty_points FROM customers WHERE email = $1 OR id = $2',
      [userData.user.email, userId],
    );
    if (customerRes.rows.length > 0) {
      userData.customer = customerRes.rows[0];
      // Fetch customer's sales
      const salesRes = await pool.query(
        'SELECT id, total_amount, sale_date FROM sales WHERE customer_id = $1',
        [userData.customer.id],
      );
      userData.customer.sales = salesRes.rows;
      // Fetch store credit transactions
      const creditRes = await pool.query(
        'SELECT * FROM store_credit_transactions WHERE customer_id = $1',
        [userData.customer.id],
      );
      userData.customer.store_credit_transactions = creditRes.rows;
    }

    // Fetch user's audit logs
    const auditRes = await pool.query(
      'SELECT action, entity_type, entity_id, details, timestamp FROM audit_logs WHERE user_id = $1',
      [userId],
    );
    userData.audit_logs = auditRes.rows;

    // Fetch serialized items associated with user's sales (if applicable)
    // This requires joining sales and sale_items and then to serialized_items. More complex.
    // For now, simplify to just user-specific actions.

    // General user data (e.g., keybinds, push subscriptions)
    const keybindsRes = await pool.query(
      'SELECT action_name, key_combination, context FROM user_keybinds WHERE user_id = $1',
      [userId],
    );
    userData.keybinds = keybindsRes.rows;

    const pushSubRes = await pool.query(
      'SELECT subscription FROM user_push_subscriptions WHERE user_id = $1',
      [userId],
    );
    userData.push_subscriptions = pushSubRes.rows.map((row: any) => row.subscription);

    return userData;
  },

  async deleteUserData(userId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Delete user-specific data that doesn't affect system integrity
      await client.query('DELETE FROM user_keybinds WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM user_push_subscriptions WHERE user_id = $1', [userId]);
      // Anonymize audit logs instead of deleting
      await client.query(
        "UPDATE audit_logs SET user_id = NULL, details = jsonb_set(details, '{user_email}', '\"[DELETED_USER]\"') WHERE user_id = $1",
        [userId],
      );

      // 2. Handle customer data linked to this user
      const customerRes = await client.query(
        'SELECT id FROM customers WHERE email = (SELECT email FROM users WHERE id = $1)',
        [userId],
      );
      const customerId = customerRes.rows[0]?.id;

      if (customerId) {
        // Anonymize customer data
        await client.query(
          `
          UPDATE customers SET
            name = '[DELETED_CUSTOMER]', 
            email = 'deleted-customer-' || $1 || '@example.com', 
            phone = NULL, 
            cpf = NULL, 
            address = NULL,
            rfm_segment = 'Deleted'
          WHERE id = $1
        `,
          [customerId],
        );
        // Delete store credit transactions if needed, or anonymize. Deleting is simpler for now.
        await client.query('DELETE FROM store_credit_transactions WHERE customer_id = $1', [
          customerId,
        ]);
        // Sales records: Keep sales records for financial integrity, but anonymize customer_id
        await client.query('UPDATE sales SET customer_id = NULL WHERE customer_id = $1', [
          customerId,
        ]);
      }

      // 3. Delete the user account itself
      await client.query('DELETE FROM users WHERE id = $1', [userId]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting user data:', error);
      throw new AppError('Failed to delete user data.', 500);
    } finally {
      client.release();
    }
  },
};
