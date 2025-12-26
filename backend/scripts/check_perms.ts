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

async function checkPerms() {
  const client = await pool.connect();
  try {
    const email = 'admin@pdv.com';
    console.log(`Checking permissions for ${email}...`);
    
    const userRes = await client.query('SELECT id, name, role FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
        console.log('User not found!');
        return;
    }
    const user = userRes.rows[0];
    console.log('User found:', user);

    const permsRes = await client.query(
      `SELECT p.action, p.subject
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = $1`,
      [user.id]
    );
    console.log(`Total permissions found: ${permsRes.rows.length}`);
    const hasDash = permsRes.rows.some(p => p.action === 'read' && p.subject === 'Dashboard');
    console.log('Has read:Dashboard?', hasDash);
    
    if (permsRes.rows.length < 5) {
        console.log('Permissions sample:', permsRes.rows);
    }

  } catch (e) {
    console.error(e);
  } finally {
    client.release();
    await pool.end();
  }
}

checkPerms();
