import { getPool } from '../src/db';
import { authService } from '../src/services/authService';

/**
 * Seeds the database with essential data for integration tests.
 */
export async function seedDatabase() {
  console.log('Seeding database for tests...');
  const pool = getPool();

  try {
    // Seed a default branch
    await pool.query(
      "INSERT INTO branches (id, name) VALUES (1, 'Main Test Branch') ON CONFLICT (id) DO NOTHING;",
    );

    // Seed Roles
    await pool.query(
      "INSERT INTO roles (id, name) VALUES (1, 'admin'), (2, 'manager'), (3, 'user') ON CONFLICT (id) DO NOTHING;",
    );

    const { rows: roles } = await pool.query('SELECT * FROM roles;');
    console.log('Inserted roles:', roles);

    // Seed Permissions
    const permissions = [
      { action: 'manage', subject: 'all' }, // Super admin
      { action: 'read', subject: 'Report' },
      { action: 'update', subject: 'Inventory' },
      { action: 'create', subject: 'Product' },
      { action: 'update', subject: 'Product' },
      { action: 'delete', subject: 'Product' },
    ];
    for (const p of permissions) {
      await pool.query(
        'INSERT INTO permissions (action, subject) VALUES ($1, $2) ON CONFLICT (action, subject) DO NOTHING;',
        [p.action, p.subject],
      );
    }

    // Link all permissions to admin
    const { rows: all_perms } = await pool.query('SELECT id FROM permissions');
    for (const perm of all_perms) {
      await pool.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES (1, $1) ON CONFLICT DO NOTHING;',
        [perm.id],
      );
    }

    // Seed Users
    try {
      await authService.register('Admin Test User', 'admin@test.com', 'password123', 'admin');
      await authService.register('Regular Test User', 'user@test.com', 'password123', 'user');
    } catch (error) {
      console.error('Error registering users in seed:', error);
      throw error;
    }

    console.log('Database seeding complete.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
