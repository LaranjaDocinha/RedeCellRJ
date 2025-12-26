import { setup as setupDatabase, teardown as teardownDatabase } from './tests/setup.js';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as nodeFs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_CONFIG_PATH = path.resolve(__dirname, './temp/vitest-global-config.json');

export async function setup() {
  console.log('[Global Setup] Starting...');

  try {
    dotenv.config({ path: path.resolve(__dirname, '.env.test') });

    // Redis Check
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const redisClient = createClient({ url: redisUrl });
    try {
      await redisClient.connect();
      await redisClient.disconnect();
    } catch (e) {
      console.warn('[Global Setup] Redis not available, using mocks.');
    }

    // Database Setup
    const { adminUser } = await setupDatabase();
    const databaseUrl = process.env.TEST_DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("TEST_DATABASE_URL not found.");
    }

    const configToSave = {
      adminUser: adminUser,
      databaseUrl: databaseUrl,
    };

    await nodeFs.promises.mkdir(path.dirname(TEMP_CONFIG_PATH), { recursive: true });
    await nodeFs.promises.writeFile(TEMP_CONFIG_PATH, JSON.stringify(configToSave, null, 2));

    console.log('[Global Setup] Config saved.');

  } catch (error) {
    console.error('[Global Setup] CRITICAL ERROR:', error);
    throw error;
  }

  return async () => {
    console.log('[Global Setup] Teardown...');
    await teardownDatabase();
    // Keep the file for watch mode consistency
  };
}
