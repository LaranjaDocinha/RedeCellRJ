import { getPool } from '../src/db/index.js';
import 'dotenv/config';

async function fixVariations() {
  const pool = getPool();
  try {
    console.log('Adding missing columns to product_variations table...');
    
    await pool.query('BEGIN');

    await pool.query(`
      ALTER TABLE product_variations 
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
      ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Atualizar 'name' baseado em 'color' se 'name' estiver nulo, para não quebrar queries
    await pool.query(`
        UPDATE product_variations SET name = color WHERE name IS NULL;
    `);

    console.log('Columns added and names backfilled.');
    await pool.query('COMMIT');
  } catch (e) {
    await pool.query('ROLLBACK');
    console.error('Error fixing product_variations table:', e);
  } finally {
    await pool.end();
  }
}

fixVariations();
