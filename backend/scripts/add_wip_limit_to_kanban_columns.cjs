const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pdv_web',
  password: 'aj13ime1', // Assuming this password from context
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function addWipLimitColumn() {
  const client = await pool.connect();
  try {
    console.log('Adding wip_limit column to kanban_columns table...');
    // Add wip_limit column with a default of -1 (no limit) or a sensible default
    await client.query('ALTER TABLE kanban_columns ADD COLUMN IF NOT EXISTS wip_limit INTEGER DEFAULT -1;');
    console.log('wip_limit column added successfully.');
  } catch (error) {
    console.error('Error adding wip_limit column:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addWipLimitColumn();
