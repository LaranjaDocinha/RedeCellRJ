import { afterEach } from 'vitest';
import { getPool } from '../src/db';

export const setupTestCleanup = () => {
  afterEach(async () => {
    const pool = getPool();
    // console.log('Cleaning up test database tables...');
    try {
      const dbNameRes = await pool.query('SELECT current_database()');
      console.log(`[setupTestCleanup] Cleaning up database: ${dbNameRes.rows[0].current_database}`);
      
      await pool.query(
        'TRUNCATE TABLE sale_items, sales, branch_product_variations_stock, product_variations, products, customers, expense_reimbursements, branches RESTART IDENTITY CASCADE;',
      );
      // console.log('Database tables cleaned.');
    } catch (error) {
      console.error('Failed to clean or seed database tables:', error);
      // process.exit(1); // Removed to allow other tests to run/fail gracefully
    }
  });
};
