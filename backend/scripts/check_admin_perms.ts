
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web',
});

async function checkAdmin() {
  try {
    const email = 'admin@pdv.com';
    const res = await pool.query('SELECT id, name FROM users WHERE email = $1', [email]);
    if (res.rows.length === 0) {
      console.log('Admin not found');
      return;
    }
    const adminId = res.rows[0].id;
    console.log('Admin ID:', adminId);

    const perms = await pool.query(
      `SELECT p.action, p.subject FROM permissions p 
       JOIN role_permissions rp ON p.id = rp.permission_id 
       JOIN user_roles ur ON rp.role_id = ur.role_id 
       WHERE ur.user_id = $1`,
      [adminId]
    );
    console.log('Permissions count:', perms.rows.length);
    console.log('Sample permissions:', perms.rows.slice(0, 5));
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
checkAdmin();
