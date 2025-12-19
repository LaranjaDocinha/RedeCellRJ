import pool from '../db/index.js';
import { stringify } from 'csv-stringify/sync';

export const exportUserData = async (customerId: number): Promise<string> => {
  const customerRes = await pool.query('SELECT * FROM customers WHERE id = $1', [customerId]);
  const salesRes = await pool.query('SELECT * FROM sales WHERE customer_id = $1', [customerId]);
  // ... query all other related data

  const output = `
    CUSTOMER DATA:
    ${stringify(customerRes.rows, { header: true })}

    SALES DATA:
    ${stringify(salesRes.rows, { header: true })}
  `;

  return output;
};

export const anonymizeUserData = async (customerId: number): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // This is a destructive action. More sophisticated logic is needed for a real app.
    const anonString = `anon_${customerId}`;
    await client.query('UPDATE customers SET name = $1, email = $2, phone = $3 WHERE id = $4', [
      anonString,
      `${anonString}@anon.com`,
      anonString,
      customerId,
    ]);
    // Anonymize or delete other related data...
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
