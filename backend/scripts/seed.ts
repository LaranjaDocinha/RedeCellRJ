import pg from 'pg';
import { faker } from '@faker-js/faker';
import 'dotenv/config';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pdv_web',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// ========== RBAC Configuration ==========/
const ALL_ACTIONS = ['create', 'read', 'update', 'delete', 'manage'] as const;
const SUBJECTS = ['Audit', 'Branch', 'Category', 'Coupon', 'Customer', 'Dashboard', 'Discount', 'Inventory', 'KanbanTask', 'Loyalty', 'LoyaltyTier', 'Order', 'Payment', 'Permission', 'Product', 'ProductKit', 'PurchaseOrder', 'Report', 'Return', 'Review', 'Role', 'Sale', 'Search', 'Settings', 'Supplier', 'Tag', 'Upload', 'User', 'UserDashboard'] as const;

type Action = typeof ALL_ACTIONS[number];
type Subject = typeof SUBJECTS[number];

const permissions: { action: Action; subject: Subject }[] = SUBJECTS.flatMap(subject =>
  ALL_ACTIONS.map(action => ({ action, subject }))
);

const roles = {
  admin: { 
    name: 'admin',
    permissions: permissions, // Admin gets all permissions
  },
  manager: {
    name: 'manager',
    permissions: permissions.filter(p => 
      // Managers can do everything except delete users
      !(p.subject === 'User' && p.action === 'delete')
    ),
  },
  user: {
    name: 'user', // Represents a standard employee/salesperson
    permissions: [
      { action: 'read', subject: 'Product' },
      { action: 'create', subject: 'Order' },
      { action: 'read', subject: 'Order' },
      { action: 'read', subject: 'KanbanTask' },
      { action: 'update', subject: 'KanbanTask' }, // Can update their own tasks
    ],
  },
};

async function seedRbac(client: pg.PoolClient) {
  console.log('Seeding RBAC...');

  // 1. Insert Permissions
  const permissionIds: { [key: string]: number } = {};
  for (const p of permissions) {
    const res = await client.query(
      'INSERT INTO permissions (action, subject) VALUES ($1, $2) ON CONFLICT (action, subject) DO UPDATE SET subject = EXCLUDED.subject RETURNING id',
      [p.action, p.subject]
    );
    permissionIds[`${p.action}:${p.subject}`] = res.rows[0].id;
  }
  console.log(`  -> ${Object.keys(permissionIds).length} permissions seeded.`);

  // 2. Insert Roles
  const roleIds: { [key: string]: number } = {};
  for (const roleKey in roles) {
    const role = roles[roleKey as keyof typeof roles];
    const res = await client.query(
      'INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
      [role.name]
    );
    roleIds[role.name] = res.rows[0].id;
  }
  console.log(`  -> ${Object.keys(roleIds).length} roles seeded.`);

  // 3. Link Roles to Permissions
  let linksCreated = 0;
  for (const roleKey in roles) {
    const role = roles[roleKey as keyof typeof roles];
    const roleId = roleIds[role.name];
    for (const p of role.permissions) {
      const permissionId = permissionIds[`${p.action}:${p.subject}`];
      await client.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [roleId, permissionId]
      );
      linksCreated++;
    }
  }
  console.log(`  -> ${linksCreated} role-permission links created.`);
  console.log('RBAC seeding complete.');
  return roleIds;
}

// ========== User Seeding ==========
async function seedUsers(client: pg.PoolClient, roleIds: { [key: string]: number }, numberOfUsers: number) {
  console.log(`Seeding ${numberOfUsers} users...`);
  const saltRounds = 10;

  // Adicionar usuário administrador fixo
  const adminEmail = 'admin@pdv.com';
  const adminPassword = 'admin123';
  const adminPasswordHash = await bcrypt.hash(adminPassword, saltRounds);
  const adminRoleName = 'admin';
  const adminRoleId = roleIds[adminRoleName];

  const adminUserRes = await client.query(
    `INSERT INTO users (name, email, password_hash) 
     VALUES ($1, $2, $3) 
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash
     RETURNING id`,
    [ 'Admin User', adminEmail, adminPasswordHash ]
  );

  if (adminUserRes.rows[0]) {
    const adminUserId = adminUserRes.rows[0].id;
    await client.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [adminUserId, adminRoleId]
    );
    console.log(`  -> Admin User '${adminEmail}' created/updated with role '${adminRoleName}'.`);
  } else {
    console.log(`  -> Admin User with email '${adminEmail}' already exists. Skipped.`);
  }

  for (let i = 0; i < numberOfUsers; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const password = 'password123'; // Set a default password for all fake users
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const roleName = faker.helpers.arrayElement(['user', 'manager', 'admin']);
    const roleId = roleIds[roleName];

    // Insert user
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO NOTHING 
       RETURNING id`,
      [ `${firstName} ${lastName}`, email, passwordHash ]
    );

    if (userRes.rows[0]) {
      const userId = userRes.rows[0].id;
      // Link user to role
      await client.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, roleId]
      );
      console.log(`  -> User '${email}' created with role '${roleName}'.`);
    } else {
      console.log(`  -> User with email '${email}' already exists. Skipped.`);
    }
  }
  console.log('User seeding complete.');
}

// ========== Main Seeding Function ==========
export async function runAllSeeds() {
  console.log('Hello from seed script!');
  const client = await pool.connect();
  console.log('Starting database seeding...');
  try {
    await client.query('BEGIN');

    // Seed RBAC first
    const roleIds = await seedRbac(client);

    // Seed Users
    await seedUsers(client, roleIds, 15);

    await client.query('COMMIT');
    console.log('Users seeded');

    // Seed Suppliers
    const suppliers = [
      { name: 'Fornecedor A', contact_person: 'Contato A', email: 'a@fornecedor.com' },
      { name: 'Fornecedor B', contact_person: 'Contato B', email: 'b@fornecedor.com' },
    ];
    const supplierIds = [];
    for (const supplier of suppliers) {
      const contactInfo = `${supplier.contact_person} <${supplier.email}>`;
      const res = await pool.query('INSERT INTO suppliers (name, contact_info) VALUES ($1, $2) RETURNING id', [supplier.name, contactInfo]);
      supplierIds.push(res.rows[0].id);
    }
    console.log('Suppliers seeded');

    // Seed Parts
    const parts = [
      { name: 'Tela iPhone 14', sku: 'IP14-SCR', stock_quantity: 10, cost: 500, supplier_id: supplierIds[0] },
      { name: 'Bateria Samsung S22', sku: 'S22-BAT', stock_quantity: 15, cost: 250, supplier_id: supplierIds[1] },
    ];
    for (const part of parts) {
      const partRes = await pool.query(
        'INSERT INTO parts (name, sku, stock_quantity) VALUES ($1, $2, $3) ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, stock_quantity = EXCLUDED.stock_quantity RETURNING id',
        [part.name, part.sku, part.stock_quantity]
      );
      const partId = partRes.rows[0].id;
      await pool.query(
        'INSERT INTO part_suppliers (part_id, supplier_id, cost) VALUES ($1, $2, $3) ON CONFLICT (part_id, supplier_id) DO UPDATE SET cost = EXCLUDED.cost',
        [partId, part.supplier_id, part.cost]
      );
    }
    console.log('Parts seeded');

    // // Seed Diagnostic Tree
    // await pool.query("INSERT INTO diagnostic_nodes (type, content, parent_node_id) VALUES ('question', 'O aparelho liga?', NULL)");
    // const rootNodeRes = await pool.query("SELECT id FROM diagnostic_nodes WHERE type = 'question' AND content = 'O aparelho liga?' AND parent_node_id IS NULL");
    // const rootNodeId = rootNodeRes.rows[0].id;

    // const solutionNodeRes = await pool.query("INSERT INTO diagnostic_nodes (type, content, parent_node_id) VALUES ('result', 'Problema provável: Bateria, conector de carga ou placa-mãe.', $1) RETURNING id", [rootNodeId]);
    // const solutionNodeId = solutionNodeRes.rows[0].id;

    // const questionNodeRes = await pool.query("INSERT INTO diagnostic_nodes (type, content, parent_node_id) VALUES ('question', 'A tela está quebrada?') RETURNING id", [rootNodeId]);
    // const questionNodeId = questionNodeRes.rows[0].id;

    // await pool.query(`INSERT INTO diagnostic_node_options (id, diagnostic_node_id, option_text, next_node_id) VALUES (DEFAULT, ${rootNodeId}, 'Não', ${solutionNodeId})`);
    // await pool.query(`INSERT INTO diagnostic_node_options (id, diagnostic_node_id, option_text, next_node_id) VALUES (DEFAULT, ${rootNodeId}, 'Sim', ${questionNodeId})`);
    // console.log('Diagnostics seeded');


  // 6. Seed Checklist Templates (Exemplo para celular)
  const template = await pool.query("INSERT INTO checklist_templates (name, type) VALUES ('Pós-Reparo de Tela', 'post-repair') RETURNING id");
  const templateId = template.rows[0].id;
  await pool.query("INSERT INTO checklist_template_items (template_id, item_name) VALUES ($1, 'Tela responde ao toque em todas as áreas?')", [templateId]);
  await pool.query("INSERT INTO checklist_template_items (template_id, item_name) VALUES ($1, 'Face ID / Touch ID funciona corretamente?')", [templateId]);
  await pool.query("INSERT INTO checklist_template_items (template_id, item_name) VALUES ($1, 'Brilho da tela ajusta automaticamente?')", [templateId]);
    console.log('Checklists seeded');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during seeding, transaction rolled back:', error);
  } finally {
    client.release();
    console.log('Database connection pool closed.');
  }
}

runAllSeeds();
