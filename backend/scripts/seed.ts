
import pg from 'pg';
import { faker } from '@faker-js/faker';
import 'dotenv/config';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ========== RBAC Configuration ==========
const ALL_ACTIONS = ['create', 'read', 'update', 'delete'] as const;
const SUBJECTS = ['Product', 'User', 'Order', 'Report', 'KanbanTask'] as const;

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
      `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING 
       RETURNING id`,
      [ `${firstName} ${lastName}`, email, passwordHash, roleName ]
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
async function seedDatabase() {
  const client = await pool.connect();
  console.log('Starting database seeding...');
  try {
    await client.query('BEGIN');

    // Seed RBAC first
    const roleIds = await seedRbac(client);

    // Seed Users
    await seedUsers(client, roleIds, 15);

    await client.query('COMMIT');
    console.log('Database seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during seeding, transaction rolled back:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('Database connection pool closed.');
  }
}

seedDatabase();
