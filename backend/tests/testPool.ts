import { Pool } from 'pg';

let _testPool: Pool | undefined;

export function getTestPool(): Pool {
  if (!_testPool) {
    throw new Error('Test pool has not been initialized.');
  }
  return _testPool;
}

export function setTestPool(pool: Pool) {
  _testPool = pool;
}