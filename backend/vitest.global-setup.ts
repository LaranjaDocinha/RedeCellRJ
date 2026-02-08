import { setup as setupDatabase, teardown as teardownDatabase } from './tests/setup.js';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as nodeFs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_CONFIG_PATH = path.join(process.cwd(), 'temp', 'vitest-global-config.json');

export async function setup() {
  console.log('[Global Setup] Starting...');

  try {
    dotenv.config({ path: path.resolve(__dirname, '.env.test') });

    // Redis Check (optional)
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const redisClient = createClient({ url: redisUrl });
      await redisClient.connect();
      await redisClient.disconnect();
    } catch (e) {
      console.warn('[Global Setup] Redis not available, using mocks for tests that need it.');
    }

    // Database Setup
    const { adminUser } = await setupDatabase();
    const databaseUrl = process.env.TEST_DATABASE_URL;
    if (!databaseUrl) throw new Error("TEST_DATABASE_URL not set by setup script.");

    // Save config for other processes if needed, though direct import is better
    const configToSave = { adminUser, databaseUrl };
    await nodeFs.promises.mkdir(path.dirname(TEMP_CONFIG_PATH), { recursive: true });
    await nodeFs.promises.writeFile(TEMP_CONFIG_PATH, JSON.stringify(configToSave, null, 2));
    
    console.log('[Global Setup] Completed successfully.');

  } catch (error) {
    console.error('[Global Setup] CRITICAL ERROR:', error);
    process.exit(1); // Exit with error on setup failure
  }

  return async () => {
    console.log('[Global Teardown] Tearing down database...');
    await teardownDatabase();
    console.log('[Global Teardown] Completed.');
  };
}
