import {
  setupIntegrationTestDatabase,
  teardownIntegrationTestDatabase,
} from '../setupIntegrationTests';
import { setPool } from '../../src/db/index';
import { setTestPool } from '../testContext';
import { seedDatabase } from '../seed';

export async function setup() {
  console.log('Default Setup: Starting integration test database...');
  const { container, testPool } = await setupIntegrationTestDatabase();
  setPool(testPool);
  setTestPool(testPool);

  await seedDatabase();

  console.log('Default Setup: Integration test database started.');

  return async () => {
    console.log('Default Teardown: Stopping integration test database...');
    await teardownIntegrationTestDatabase(testPool, container);
    console.log('Default Teardown: Integration test database stopped.');
  };
}
