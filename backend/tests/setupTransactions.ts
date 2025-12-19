import { beforeEach, afterEach } from 'vitest';
import { getTestPool, setCurrentTestClient, getCurrentTestClient } from './testContext';

beforeEach(async () => {
  // Get a client from the pool for the upcoming test
  const client = await getTestPool().connect();
  // Start a transaction
  await client.query('BEGIN');
  // Store the client in the context so it can be accessed by tests
  setCurrentTestClient(client);
});

afterEach(async () => {
  const client = getCurrentTestClient();
  if (client) {
    // Roll back the transaction
    await client.query('ROLLBACK');
    // Release the client back to the pool
    client.release();
    // Clear the client from the context
    setCurrentTestClient(null);
  }
});
