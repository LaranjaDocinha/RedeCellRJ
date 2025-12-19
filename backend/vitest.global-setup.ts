import { setup as setupDatabase, teardown as teardownDatabase } from './tests/setup.js';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import path from 'path';
// import { Pool } from 'pg'; // Pool is not directly used here anymore for global assignment
import * as nodeFs from 'fs';

const TEMP_CONFIG_PATH = path.resolve(__dirname, './temp/vitest-global-config.json');

export async function setup() {
  console.log('Global Setup: Starting...');

  dotenv.config({ path: path.resolve(__dirname, '.env.test') });

  // --- Redis Connection Check ---
  console.log('Checking Redis connection...');
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redisClient = createClient({ url: redisUrl });

  try {
    await redisClient.connect();
    console.log('Successfully connected to Redis.');
    await redisClient.disconnect();
  } catch (error) {
    console.warn('WARNING: Could not connect to Redis. Tests will run without a real Redis instance.');
  }

  // --- Database Setup ---
  // The setupDatabase function returns { pool: Pool, adminUser: { id, email, permissions } }
  const { pool: testDbPoolInstance, adminUser } = await setupDatabase();

  // We need the databaseUrl that was used to create the pool.
  // setup.ts already puts it in process.env.TEST_DATABASE_URL
  const databaseUrl = process.env.TEST_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("TEST_DATABASE_URL not found in environment. Cannot save config.");
  }

  const configToSave = {
    adminUser: adminUser,
    databaseUrl: databaseUrl,
  };

  await nodeFs.promises.mkdir(path.dirname(TEMP_CONFIG_PATH), { recursive: true });
  await nodeFs.promises.writeFile(TEMP_CONFIG_PATH, JSON.stringify(configToSave, null, 2));

  console.log(`vitest.global-setup.ts [PID: ${process.pid}]: Config saved to ${TEMP_CONFIG_PATH}`);

  console.log('Global Setup: Complete.');

  return async () => {
    console.log('Global Teardown: Starting...');
    await teardownDatabase();
    await nodeFs.promises.unlink(TEMP_CONFIG_PATH).catch(e => console.error("Error deleting temp config file:", e));
    console.log('Global Teardown: Complete.');
  };
}