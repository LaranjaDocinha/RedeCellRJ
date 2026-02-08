import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pdv_web',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function check() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, name FROM branches');
    console.log('Branches found:', res.rows);
    
    const userRes = await client.query('SELECT id, name, branch_id FROM users WHERE email = $1', ['admin@pdv.com']);
    console.log('Admin user branch:', userRes.rows[0]);

  } catch (e) { console.error(e); }
  finally { client.release(); await pool.end(); }
}
check();
