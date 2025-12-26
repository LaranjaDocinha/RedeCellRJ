import { getPool } from '../src/db/index.js';
import 'dotenv/config';

async function checkColumns() {
  const pool = getPool();
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'product_variations'");
    console.log('Columns in product_variations:', res.rows.map(r => r.column_name));
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

checkColumns();
