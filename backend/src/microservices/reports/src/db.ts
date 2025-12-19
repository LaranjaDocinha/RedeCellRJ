import { Pool } from 'pg';
import 'dotenv/config';

let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    console.log('Creating new pool for Reports Microservice.');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return pool;
}
