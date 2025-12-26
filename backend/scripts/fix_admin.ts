import pg from 'pg';
import bcrypt from 'bcrypt';
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

const SUBJECTS = [
    'Audit', 'Branch', 'Category', 'Coupon', 'Customer', 'Dashboard', 
    'Discount', 'Inventory', 'KanbanTask', 'Loyalty', 'LoyaltyTier', 
    'Order', 'Payment', 'Permission', 'Product', 'ProductKit', 
    'PurchaseOrder', 'Report', 'Return', 'Review', 'Role', 'Sale', 
    'Search', 'Settings', 'Supplier', 'Tag', 'Upload', 'User', 
    'UserDashboard', 'Lead', 'LeadActivity', 'ZReport', 'TaskTimeLog', 
    'TimeClock', 'ServiceOrder'
] as const;

const ACTIONS = ['create', 'read', 'update', 'delete', 'manage'] as const;

async function fixAdmin() {
  const client = await pool.connect();
  try {
    console.log('🔄 Repairing System Core (Branch, Roles, Admin)...');
    const email = 'admin@pdv.com';
    const pass = 'admin123';
    const hash = await bcrypt.hash(pass, 10);

    await client.query('BEGIN');
    
    // 1. Ensure Branch exists
    const branchRes = await client.query(`
        INSERT INTO branches (name, address, phone) 
        VALUES ('Matriz Redecell', 'Av. Central, 100', '21999999999') 
        ON CONFLICT DO NOTHING RETURNING id
    `);
    
    let branchId = branchRes.rows[0]?.id;
    if (!branchId) {
        const existingBranch = await client.query('SELECT id FROM branches WHERE name = $1', ['Matriz Redecell']);
        branchId = existingBranch.rows[0].id;
    }

    // 2. Ensure Role exists
    const roleRes = await client.query('INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id', ['admin']);
    const roleId = roleRes.rows[0].id;

    // 3. Ensure ALL Permissions exist and are linked to Admin Role
    for (const sub of SUBJECTS) {
        for (const act of ACTIONS) {
            const pRes = await client.query(
                'INSERT INTO permissions (action, subject) VALUES ($1, $2) ON CONFLICT (action, subject) DO UPDATE SET subject = EXCLUDED.subject RETURNING id',
                [act, sub]
            );
            const pId = pRes.rows[0].id;
            await client.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [roleId, pId]);
        }
    }

    // 4. Ensure User exists with correct Role and Branch
    await client.query('DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email = $1)', [email]);
    await client.query('DELETE FROM users WHERE email = $1', [email]);

    const userRes = await client.query(
      'INSERT INTO users (name, email, password_hash, role, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['Admin User', email, hash, 'admin', branchId]
    );
    const adminId = userRes.rows[0].id;

    // 5. Link User to Role
    await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [adminId, roleId]);

    await client.query('COMMIT');
    console.log('✅ Admin User, Branch and ALL Permissions repaired!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Error fixing admin:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAdmin();