import {
  setupIntegrationTestDatabase,
  teardownIntegrationTestDatabase,
} from '../setupIntegrationTests';
import { setPool } from '../../src/db/index';
import { setTestPool } from '../testContext';
import { seedDatabase } from '../seed';

export async function setup() {
  console.log('SaleService Setup: Starting integration test database...');
  const { container, testPool } = await setupIntegrationTestDatabase();
  setPool(testPool);
  setTestPool(testPool);

  await seedDatabase();

  console.log('SaleService Setup: Integration test database started.');

  return async () => {
    console.log('SaleService Teardown: Stopping integration test database...');
    await teardownIntegrationTestDatabase(testPool, container);
    console.log('SaleService Teardown: Integration test database stopped.');
  };
}
