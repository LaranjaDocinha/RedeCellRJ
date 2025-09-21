import { Pool } from 'pg';

// Variável interna para armazenar o pool de teste
let _mockPool: Pool | undefined;

// Função para definir o pool de teste (chamada pelo globalSetup)
export function __setMockPool(pool: Pool) {
  _mockPool = pool;
}

// Mock da função query
export const query = (text: string, params?: any[]) => {
  if (!_mockPool) {
    throw new Error('Mock pool has not been set. Call __setMockPool in globalSetup.');
  }
  return _mockPool.query(text, params);
};

// Mock do export default (o próprio pool)
const mockDefaultPool = new Proxy({}, {
  get: (_, prop) => {
    if (!_mockPool) {
      throw new Error('Mock pool has not been set. Call __setMockPool in globalSetup.');
    }
    return Reflect.get(_mockPool, prop);
  },
});

export default mockDefaultPool;