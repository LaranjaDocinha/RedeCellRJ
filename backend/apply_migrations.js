const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function applyMigrations() {
  const client = await pool.connect();
  try {
    console.log('Applying database migrations...');

    const migrationsDir = path.join(__dirname, 'database');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.startsWith('migration_') && file.endsWith('.sql'))
      .sort((a, b) => {
        const numA = parseInt(a.split('_')[1]);
        const numB = parseInt(b.split('_')[1]);
        return numA - numB;
      });

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`Executing migration: ${file}`);
      await client.query(sql);
    }

    console.log('All migrations applied successfully.');
  } catch (error) {
    console.error('Failed to apply migrations:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

applyMigrations().catch(err => {
  console.error('An unexpected error occurred:', err);
  process.exit(1);
});
