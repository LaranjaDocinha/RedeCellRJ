import { Pool, PoolClient } from 'pg';

let testPool: Pool | null = null;
let currentTestClient: PoolClient | null = null;

export function setTestPool(pool: Pool) {
  testPool = pool;
}

export function getTestPool(): Pool {
  if (!testPool) {
    throw new Error('Test pool not initialized. Make sure global setup is configured correctly.');
  }
  return testPool;
}

export function setCurrentTestClient(client: PoolClient | null) {
  currentTestClient = client;
}

export function getCurrentTestClient(): PoolClient | null {
  return currentTestClient;
}
