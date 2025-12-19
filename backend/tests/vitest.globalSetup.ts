import { setup as dbSetup, teardown as dbTeardown } from './setup.js';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tempAdminUserFilePath: string;

export async function setup() {
  console.log('Global Setup: Starting...');
  const { pool, adminUser } = await dbSetup();

  // Create a temporary file to store admin user data
  const tempDir = os.tmpdir();
  tempAdminUserFilePath = path.join(tempDir, `adminUser-${process.pid}.json`);
  await fs.writeFile(tempAdminUserFilePath, JSON.stringify(adminUser), 'utf8');

  // We store the path in a temporary config file that setupFiles can read
  const configPath = path.resolve(__dirname, '../temp/vitest-global-config.json');
  const configDir = path.dirname(configPath);
  
  try {
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(configPath, JSON.stringify({
      adminUser,
      databaseUrl: process.env.DATABASE_URL,
      adminUserFilePath: tempAdminUserFilePath
    }));
  } catch (err) {
    console.error('Failed to write global config:', err);
  }

  console.log('Global Setup: Complete.');

  // In Vitest, if you want a teardown, you can return a function from setup
  return async () => {
    console.log('Global Teardown: Starting...');
    if (tempAdminUserFilePath) {
      try {
        await fs.unlink(tempAdminUserFilePath);
      } catch (e) {}
    }
    try {
      const configPath = path.resolve(__dirname, '../temp/vitest-global-config.json');
      await fs.unlink(configPath);
    } catch (e) {}
    
    await dbTeardown();
    console.log('Global Teardown: Finished.');
  };
}