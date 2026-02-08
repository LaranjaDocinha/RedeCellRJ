import { PoolClient } from 'pg';
import { getPool } from '../db/index.js';

/**
 * Executes a callback within a database transaction.
 * Handles BEGIN, COMMIT, and ROLLBACK automatically.
 *
 * @param callback A function that receives a database client and returns a promise.
 * @returns The result of the callback.
 */
export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
