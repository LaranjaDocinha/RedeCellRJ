import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { runner as migrate } from 'node-pg-migrate';
import path from 'path';

let container: StartedPostgreSqlContainer;
let testPool: Pool;

export async function setupIntegrationTestDatabase() {
  console.log('Starting setupIntegrationTestDatabase...');
  console.log('1. Starting PostgreSQL container...');
  container = await new PostgreSqlContainer("postgres:15-alpine")
    .withStartupTimeout(300000) // Aumentar o timeout de inicialização para 5 minutos
    .withReuse(false)
    .start();
  console.log('   PostgreSQL container started.');

  console.log('2. Dropping and recreating test database...');
  const adminPool = new Pool({
    host: container.getHost(),
    port: container.getPort(),
    database: 'postgres', // Connect to default postgres database to drop/create test database
    user: container.getUsername(),
    password: container.getPassword(),
  });
  const dbName = container.getDatabase();

  // Ensure testPool is ended before dropping the database
  if (testPool) {
    console.log('   Ending existing test pool before dropping database...');
    await testPool.end();
  }

  console.log(`   Attempting to drop database '${dbName}' if it exists.`);
  // Terminate all other connections to the database
  await adminPool.query(`SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${dbName}' AND pid <> pg_backend_pid();`);
  await adminPool.query(`DROP DATABASE IF EXISTS "${dbName}";`);
  console.log(`   Database '${dbName}' dropped.`);

  console.log(`   Attempting to create database '${dbName}'.`);
  await adminPool.query(`CREATE DATABASE "${dbName}";`);
  console.log(`   Database '${dbName}' created.`);
  await adminPool.end();
  console.log(`   Admin pool ended.`);

  console.log('3. Initializing test pool...');
  testPool = new Pool({
    host: container.getHost(),
    port: container.getPort(),
    database: dbName,
    user: container.getUsername(),
    password: container.getPassword(),
  });
  console.log('   Test pool initialized.');

  console.log('4. Connecting to database for migrations...');
  const client = await testPool.connect();
      console.log('   Connected to database.');
    try {
      console.log('5. Running migrations...');
  
    console.log('   Attempting to run up migrations.');
    await client.query('DROP TABLE IF EXISTS pgmigrations;');
    console.log('   Dropped pgmigrations table if it existed.');
    await migrate({
      dbClient: client,
      direction: 'up',
      dir: path.resolve(process.cwd(), 'migrations'),
      migrationsTable: 'pgmigrations',
    });
    console.log('   Migrations completed.');    } finally {    client.release();
    console.log('   Database client released.');
  }

  console.log('setupIntegrationTestDatabase completed.');
  return testPool;
}

export async function teardownIntegrationTestDatabase(pool: Pool) {
  console.log('Starting teardownIntegrationTestDatabase...');
  if (pool) {
    await pool.end();
    console.log('   Test pool ended.');
  }
  if (container) {
    await container.stop();
    console.log('   Container stopped.');
  }
  console.log('teardownIntegrationTestDatabase completed.');
}

export async function truncateTables(pool: Pool, tables: string[]) {
  console.log(`Truncating tables: ${tables.join(', ')}`);
  const client = await pool.connect();
  try {
    for (const table of tables) {
      await client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE;`);
    }
    console.log('Tables truncated.');
  } finally {
    client.release();
    console.log('Client released after truncation.');
  }
}