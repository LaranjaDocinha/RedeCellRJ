import { getPool } from '../src/db/index.js';
import 'dotenv/config';

async function fixProducts() {
  const pool = getPool();
  try {
    console.log('Adding missing columns to products table...');
    
    await pool.query('BEGIN');

    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
      ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(id),
      ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id),
      ADD COLUMN IF NOT EXISTS is_serialized BOOLEAN DEFAULT false;
    `);

    console.log('Columns added.');
    await pool.query('COMMIT');
  } catch (e) {
    await pool.query('ROLLBACK');
    console.error('Error fixing products table:', e);
  } finally {
    await pool.end();
  }
}

fixProducts();
