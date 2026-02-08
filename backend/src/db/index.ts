import { Pool } from 'pg';
import 'dotenv/config';
import { logger } from '../utils/logger.js';

let pool: Pool;

export function setPool(newPool: Pool) {
  pool = newPool;
}

export function getPool(): Pool {
  if (!pool) {
    // Standard initialization if no pool was injected
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    pool.on('error', (err) => {
      logger.error(err, 'Unexpected error on idle client');
    });
  }
  return pool;
}

export const query = (text: string, params?: any[]) => getPool().query(text, params);
export const connect = () => getPool().connect();

export default {
  query,
  connect,
};
