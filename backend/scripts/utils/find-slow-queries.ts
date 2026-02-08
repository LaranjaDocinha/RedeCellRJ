
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
});

async function findSlowQueries() {
  try {
    const { rows } = await pool.query(`
      SELECT
        (total_exec_time / 1000 / 60) as total_minutes,
        (mean_exec_time) as avg_ms,
        calls,
        query
      FROM pg_stat_statements
      ORDER BY mean_exec_time DESC
      LIMIT 10;
    `);

    console.log('--- Top 10 Slowest Queries ---');
    console.table(rows);
    console.log('-----------------------------');

    // Example of an alert: if the average execution time is greater than 1 second
    const slowQueryAlert = rows.find(row => row.avg_ms > 1000);
    if (slowQueryAlert) {
        console.error('!!! ALERT: Slow query detected !!!');
        // In a real scenario, you would send an email or a Slack notification here
        // For the purpose of this script, we will exit with a non-zero code
        process.exit(1);
    }

  } catch (error) {
    console.error('Error finding slow queries:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

findSlowQueries();
