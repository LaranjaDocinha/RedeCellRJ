const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: 'backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web',
});

async function main() {
  const client = await pool.connect();
  console.log('🚀 Starting Total Data Sync...');
  try {
    await client.query('BEGIN');

    // 1. Limpar Tabelas Críticas
    console.log('Cleaning tables...');
    await client.query('TRUNCATE users, roles, permissions, role_permissions, user_roles, system_branding RESTART IDENTITY CASCADE');

    // 2. Criar Permissões Padrão
    console.log('Seeding Permissions...');
    const actions = ['create', 'read', 'update', 'delete', 'manage'];
    const subjects = ['Audit', 'User', 'Product', 'Category', 'Order', 'KanbanTask', 'Branch', 'Branding', 'ServiceOrder', 'Inventory', 'Lead', 'Customer', 'Review', 'Discount', 'Coupon', 'Quarantine', 'Expense'];
    
    for (const subject of subjects) {
      for (const action of actions) {
        await client.query(
          'INSERT INTO permissions (action, subject) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [action, subject]
        );
      }
    }

    // 3. Criar Roles
    console.log('Seeding Roles...');
    const adminRoleRes = await client.query("INSERT INTO roles (name) VALUES ('admin') RETURNING id");
    const userRoleRes = await client.query("INSERT INTO roles (name) VALUES ('user') RETURNING id");
    const adminRoleId = adminRoleRes.rows[0].id;

    // 4. Associar TODAS as permissões ao admin
    await client.query('INSERT INTO role_permissions (role_id, permission_id) SELECT $1, id FROM permissions', [adminRoleId]);

    // 5. Criar Admin User
    console.log('Creating Admin User...');
    const adminId = '1aa9e5c2-4e4f-4a48-a661-e53a51f1592d';
    const passwordHash = await bcrypt.hash('admin123', 10);
    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)`,
      [adminId, 'Administrator', 'admin@pdv.com', passwordHash, 'admin']
    );
    await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [adminId, adminRoleId]);

    // 6. Criar Branding Default
    console.log('Creating Branding...');
    await client.query(
      `INSERT INTO system_branding (franchise_id, logo_url, primary_color, secondary_color, font_family, app_name)
       VALUES ('default', '/logo.svg', '#1976d2', '#dc004e', 'Roboto, sans-serif', 'Redecell PDV')`
    );

    // 7. Criar Colunas Kanban
    console.log('Seeding Kanban...');
    const columns = [
      { title: 'Aguardando Avaliação', position: 0, is_system: true, wip_limit: 10 },
      { title: 'Em Reparo', position: 1, is_system: false, wip_limit: 5 },
      { title: 'Aguardando Peça', position: 2, is_system: false, wip_limit: -1 },
      { title: 'Finalizado', position: 3, is_system: true, wip_limit: -1 },
    ];
    for (const col of columns) {
      await client.query('INSERT INTO kanban_columns (title, position, is_system, wip_limit) VALUES ($1, $2, $3, $4)', [col.title, col.position, col.is_system, col.wip_limit]);
    }

    await client.query('COMMIT');
    console.log('✅ Total Sync Complete!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Error in sync:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

main();