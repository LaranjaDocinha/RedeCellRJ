
const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pdv_web',
  password: 'aj13ime1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function addColumns() {
  const client = await pool.connect();
  try {
    console.log('Adding gamification columns to users table...');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;');
    console.log('Columns added successfully.');
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addColumns();
