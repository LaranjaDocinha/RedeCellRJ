import { Pool } from 'pg';
import path from 'path';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { setPool } from '../src/db/index.js';

const exec = promisify(execCb);

let testPoolInstance: Pool;

export async function setup(): Promise<{ pool: Pool; adminUser: { id: string; email: string; permissions: any[] }; }> {
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

  let client; // Declare client here
  let adminUserId: string | undefined;
  let adminEmail: string | undefined;
  let adminPermissions: any[] = [];

  try {
    console.log('Ensuring clean database state...');
    const rootDbConfig = { ...dbConfig, database: 'postgres' }; // Connect to default 'postgres' db to drop/create
    const rootPool = new Pool(rootDbConfig);
    const rootClient = await rootPool.connect();
    try {
      // Terminate all other connections to the target database
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

    // Establish connection to the newly created database
    testPoolInstance = new Pool(dbConfig);
    process.env.TEST_DB_CONNECTION_STRING = databaseUrl; // Expose connection string via env var
    client = await testPoolInstance.connect(); // Connect with the new client

    console.log('Running migrations...');
    // Ensure we use the correct connection string for migration
    const { stdout, stderr } = await exec(`cross-env DATABASE_URL=${databaseUrl} npm run migrate:up`, {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, DATABASE_URL: databaseUrl }
    });
    console.log('Migration stdout:', stdout);
    if (stderr) {
      console.error('Migration stderr:', stderr);
    }
    if (stderr && !stderr.includes("Can't determine timestamp")) {
       // Warn but don't fail immediately if it's just a warning, but check carefully
       console.warn('Migration stderr present.');
    }
    console.log('Migrations complete.');
    const tableCheck = await client.query(
      "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'branch_product_variations_stock');",
    );
    if (!tableCheck.rows[0].exists) {
      throw new Error('CRITICAL: branch_product_variations_stock table does not exist after migrations.');
    }

    console.log('Seeding essential data...');
    await client.query(`INSERT INTO roles (name) VALUES ('admin'), ('user');`);
    console.log("   Roles 'admin' and 'user' seeded.");

    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const userPasswordHash = await bcrypt.hash('password123', 10);

    const adminUserRes = await client.query(
      `INSERT INTO users (name, email, password_hash) VALUES ('Admin User', 'admin@pdv.com', $1) RETURNING id;`,
      [adminPasswordHash],
    );
    const testUserRes = await client.query(
      `INSERT INTO users (name, email, password_hash) VALUES ('Test User', 'user@test.com', $1) RETURNING id;`,
      [userPasswordHash],
    );

    const { rows: adminIdRows } = await client.query(
      "SELECT id, email FROM users WHERE email = 'admin@pdv.com';",
    );
    const { rows: userIdRows } = await client.query(
      "SELECT id FROM users WHERE email = 'user@test.com';",
    );
    adminUserId = adminIdRows[0].id;
    adminEmail = adminIdRows[0].email;
    const userId = userIdRows[0].id;

    const { rows: adminRoleRows } = await client.query(
      "SELECT id FROM roles WHERE name = 'admin';",
    );
    const { rows: userRoleRows } = await client.query("SELECT id FROM roles WHERE name = 'user';");
    const adminRoleId = adminRoleRows[0].id;
    const userRoleId = userRoleRows[0].id;

    await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
      adminUserId,
      adminRoleId,
    ]);
    await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
      userId,
      userRoleId,
    ]);

    console.log(
      "   Essential users 'admin@pdv.com' and 'user@test.com' registered and linked to roles.",
    );

    // Seed permissions for admin role
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
        `INSERT INTO permissions (action, subject) VALUES ($1, $2) ON CONFLICT (action, subject) DO UPDATE SET action = EXCLUDED.action, subject = EXCLUDED.subject;`,
        [p.action, p.subject],
      );
    }

    const { rows: allPermissions } = await client.query('SELECT id, action, subject FROM permissions');
    for (const p of allPermissions) {
      await client.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT (role_id, permission_id) DO UPDATE SET role_id = EXCLUDED.role_id, permission_id = EXCLUDED.permission_id',
        [adminRoleId, p.id],
      );
    }
    console.log('   Admin role granted all permissions.');

    // Fetch admin permissions again after assigning them
    const finalAdminPermissionsRes = await client.query(
      `SELECT p.id, p.action, p.subject FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = $1`,
      [adminRoleId]
    );
    adminPermissions = finalAdminPermissionsRes.rows;


    // Seed a default branch
    await client.query(
      `INSERT INTO branches (name) VALUES ('Main Branch');`,
    );
    const { rows: branchRows } = await client.query(
      `SELECT id FROM branches WHERE name = 'Main Branch';`,
    );
    const defaultBranchId = branchRows[0].id;
    console.log(`   Default branch 'Main Branch' (ID: ${defaultBranchId}) seeded.`);

    // Seed products
    await client.query(
      `INSERT INTO products (name, description, sku, branch_id) VALUES ('Smartphone', 'High-end smartphone', 'SMART001', ${defaultBranchId});`,
    );
    await client.query(
      `INSERT INTO products (name, description, sku, branch_id) VALUES ('Laptop', 'Powerful laptop', 'LAPTOP001', ${defaultBranchId});`,
    );
    const { rows: smartphoneProductRows } = await client.query(
      `SELECT id FROM products WHERE sku = 'SMART001';`,
    );
    const smartphoneProductId = smartphoneProductRows[0].id;
    const { rows: laptopProductRows } = await client.query(
      `SELECT id FROM products WHERE sku = 'LAPTOP001';`,
    );
    const laptopProductId = laptopProductRows[0].id;
    console.log(
      `   Products 'Smartphone' (ID: ${smartphoneProductId}) and 'Laptop' (ID: ${laptopProductId}) seeded.`,
    );

    // Seed product variations
    // Delete existing variations to avoid ON CONFLICT issues, then insert
    await client.query(`DELETE FROM product_variations WHERE sku = 'SMART001-RED';`);
    await client.query(
      `INSERT INTO product_variations (product_id, sku, price, cost_price) VALUES (${smartphoneProductId}, 'SMART001-RED', 999.99, 500.00) RETURNING id;`,
    );
    await client.query(`DELETE FROM product_variations WHERE sku = 'SMART001-BLUE';`);
    await client.query(
      `INSERT INTO product_variations (product_id, sku, price, cost_price) VALUES (${smartphoneProductId}, 'SMART001-BLUE', 999.99, 500.00) RETURNING id;`,
    );
    await client.query(`DELETE FROM product_variations WHERE sku = 'LAPTOP001-SILVER';`);
    await client.query(
      `INSERT INTO product_variations (product_id, sku, price, cost_price) VALUES (${laptopProductId}, 'LAPTOP001-SILVER', 1499.99, 800.00) RETURNING id;`,
    );
    await client.query(`DELETE FROM product_variations WHERE sku = 'LAPTOP001-BLACK';`);
    await client.query(
      `INSERT INTO product_variations (product_id, sku, price, cost_price) VALUES (${laptopProductId}, 'LAPTOP001-BLACK', 1499.99, 800.00) RETURNING id;`,
    );
    console.log('   Product variations seeded.');

    console.log('Checking product_variations schema...');
    const schemaCheck = await client.query(`
        SELECT
          a.attname AS column_name,
          pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
          (SELECT substring(pg_catalog.pg_get_constraintdef(c.oid, true) for 128) FROM pg_catalog.pg_constraint c WHERE c.conrelid = a.attrelid AND a.attnum = ANY (c.conkey) AND c.contype = 'u') AS unique_constraint,
          (SELECT substring(pg_catalog.pg_get_constraintdef(c.oid, true) for 128) FROM pg_catalog.pg_constraint c WHERE c.conrelid = a.attrelid AND a.attnum = ANY (c.conkey) AND c.contype = 'p') AS primary_key
        FROM
          pg_catalog.pg_attribute a
        WHERE
          a.attrelid = 'product_variations'::regclass AND a.attnum > 0 AND NOT a.attisdropped
        ORDER BY a.attnum;
      `);
    console.log('Product variations schema:', schemaCheck.rows);

    // Update stock for variations in default branch
    const { rows: variationRows } = await client.query(
      `SELECT id FROM product_variations;`,
    );
    for (const variation of variationRows) {
      await client.query(
        `INSERT INTO branch_product_variations_stock (product_variation_id, branch_id, stock_quantity) VALUES ($1, $2, 50) ON CONFLICT (branch_id, product_variation_id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;`,
        [variation.id, defaultBranchId],
      );
    }
    console.log('   Product stock updated for variations in default branch.');
  } catch (error) {
    console.error('Error during global setup:', error);
    throw error;
  } finally {
    client.release();
  }
  setPool(testPoolInstance); // Register the global test pool instance
  return { pool: testPoolInstance, adminUser: { id: adminUserId!, email: adminEmail!, permissions: adminPermissions } };
}

export async function teardown() {
  if (testPoolInstance) {
    await testPoolInstance.end();
  }
}
