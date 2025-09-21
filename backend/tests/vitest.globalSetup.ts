import { setupIntegrationTestDatabase, teardownIntegrationTestDatabase } from './setupIntegrationTests';

let globalTestPool: any; // Store the pool globally for teardown

export async function setup() {
  console.log('Global Setup: Starting integration test database...');
  globalTestPool = await setupIntegrationTestDatabase();
  console.log('Global Setup: Integration test database started.');
  return () => {
    console.log('Global Teardown: Stopping integration test database...');
    teardownIntegrationTestDatabase(globalTestPool); // Pass the pool to teardown
    console.log('Global Teardown: Integration test database stopped.');
  };
}