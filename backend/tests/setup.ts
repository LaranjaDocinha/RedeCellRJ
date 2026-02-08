import { Pool } from 'pg';
import path from 'path';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const exec = promisify(execCb);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export let testPoolInstance: Pool;

export async function setup(): Promise<{
  adminUser: { id: string; email: string; permissions: any[] };
}> {
  dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

  console.log('Using local PostgreSQL configuration...');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'pdv_web_test',
  };

  if (!dbConfig.password) {
    console.warn('Warning: DB_PASSWORD is not set in .env.test');
  }

  const databaseUrl = `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
  process.env.DATABASE_URL = databaseUrl;
  process.env.TEST_DATABASE_URL = databaseUrl;

  console.log(`Target Test Database: ${dbConfig.database}`);

  let client;
  let adminUserId: string | undefined;
  let adminEmail: string | undefined;
  let adminPermissions: any[] = [];

  try {
    console.log('Ensuring clean database state...');
    const rootDbConfig = { ...dbConfig, database: 'postgres' };
    const rootPool = new Pool(rootDbConfig);
    const rootClient = await rootPool.connect();
    try {
      await rootClient.query(
        `SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${dbConfig.database}' AND pid <> pg_backend_pid();`,
      );
      await rootClient.query(`DROP DATABASE IF EXISTS "${dbConfig.database}";`);
      await rootClient.query(`CREATE DATABASE "${dbConfig.database}";`);
      console.log(`Database "${dbConfig.database}" dropped and recreated.`);
    } finally {
      rootClient.release();
      await rootPool.end();
    }

    testPoolInstance = new Pool(dbConfig);
    client = await testPoolInstance.connect();

    console.log('Running migrations...');
    const { stdout: _stdout, stderr } = await exec(
      `cross-env DATABASE_URL=${databaseUrl} npm run migrate:up`,
      {
        cwd: path.resolve(__dirname, '..'),
        env: { ...process.env, DATABASE_URL: databaseUrl },
      },
    );
    if (stderr && !stderr.includes("Can't determine timestamp")) {
      console.error('Migration stderr:', stderr);
      throw new Error('Migration failed');
    }
    console.log('Migrations complete.');

    console.log('Seeding essential data...');
    // ... (rest of the seeding logic is the same)
    await client.query(`INSERT INTO roles (name) VALUES ('admin'), ('user');`);
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const adminUserRes = await client.query(
      `INSERT INTO users (name, email, password_hash) VALUES ('Admin User', 'admin@pdv.com', $1) RETURNING id, email;`,
      [adminPasswordHash],
    );
    adminUserId = adminUserRes.rows[0].id;
    adminEmail = adminUserRes.rows[0].email;
    const adminRoleId = (await client.query("SELECT id FROM roles WHERE name = 'admin'")).rows[0]
      .id;
    await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
      adminUserId,
      adminRoleId,
    ]);

    const permissionsToSeed = [
      { action: 'manage', subject: 'all' },
      { action: 'create', subject: 'Sale' },
      { action: 'read', subject: 'Sale' },
      { action: 'update', subject: 'Sale' },
      { action: 'delete', subject: 'Sale' },
      { action: 'create', subject: 'StoreCredit' },
      { action: 'read', subject: 'StoreCredit' },
      { action: 'read', subject: 'Report' },
    ];

    for (const p of permissionsToSeed) {
      await client.query(
        `INSERT INTO permissions (action, subject) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [p.action, p.subject],
      );
    }
    const { rows: allPermissions } = await client.query('SELECT id FROM permissions');
    for (const p of allPermissions) {
      await client.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [adminRoleId, p.id],
      );
    }

    const finalAdminPermissionsRes = await client.query(
      `SELECT p.id, p.action, p.subject FROM permissions p JOIN role_permissions rp ON p.id = rp.permission_id WHERE rp.role_id = $1`,
      [adminRoleId],
    );
    adminPermissions = finalAdminPermissionsRes.rows;
  } catch (error) {
    console.error('Error during global setup:', error);
    if (testPoolInstance) await testPoolInstance.end();
    throw error;
  } finally {
    if (client) client.release();
  }

  return { adminUser: { id: adminUserId!, email: adminEmail!, permissions: adminPermissions } };
}

export async function teardown() {
  if (testPoolInstance) {
    await testPoolInstance.end();
  }
}
