import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';

dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web',
});

async function forceResetAdmin() {
  const client = await pool.connect();
  console.log('--- FORCING ADMIN RESET ---');
  try {
    await client.query('BEGIN');

    const adminEmail = 'admin@pdv.com';
    const adminPassword = 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const adminId = '1aa9e5c2-4e4f-4a48-a661-e53a51f1592d'; // ID Consistente

    // 1. Limpar duplicatas por email
    await client.query('DELETE FROM users WHERE email = $1', [adminEmail]);

    // 2. Criar admin com ID fixo
    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, 'Admin User', adminEmail, passwordHash, 'admin']
    );

    // 3. Garantir role 'admin'
    const roleRes = await client.query('INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id', ['admin']);
    const adminRoleId = roleRes.rows[0].id;

    // 4. Associar user_roles
    await client.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [adminId, adminRoleId]
    );

    // 5. Associar TODAS as permissões ao role admin
    const permsRes = await client.query('SELECT id FROM permissions');
    for (const perm of permsRes.rows) {
      await client.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [adminRoleId, perm.id]
      );
    }

    // 6. Criar branding default para evitar erro 500
    await client.query(
      `INSERT INTO system_branding (franchise_id, logo_url, primary_color, secondary_color, font_family, app_name)
       VALUES ('default', '/logo.svg', '#1976d2', '#dc004e', 'Roboto, sans-serif', 'Redecell PDV')
       ON CONFLICT (franchise_id) DO NOTHING`
    );

    await client.query('COMMIT');
    console.log('Admin force reset successful! ID:', adminId);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error resetting admin:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

forceResetAdmin();