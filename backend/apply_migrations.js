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
      try {
        await client.query(sql);
      } catch (err) {
        // 42701: column already exists
        // 42P07: table already exists
        // 42710: trigger already exists
        // 42703: column does not exist
        if (err.code === '42701' || err.code === '42P07' || err.code === '42710' || err.code === '42703') {
          console.warn(`  -> Warning: Migration '${file}' likely already applied. Ignoring error: ${err.message}`);
        } else {
          // For any other error, re-throw to stop the process
          console.error(`Error executing migration: ${file}`);
          throw err;
        }
      }
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
