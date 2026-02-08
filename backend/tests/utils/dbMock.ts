import { vi } from 'vitest';

export const createDbMock = () => {
  const mockQuery = vi.fn();
  const mockRelease = vi.fn();

  // O mockClient deve ter a estrutura de um PoolClient do pg
  const mockClient = {
    query: mockQuery,
    release: mockRelease,
  };

  // O mockConnect retorna uma Promise que resolve para o client
  const mockConnect = vi.fn().mockResolvedValue(mockClient);

  // O mockPool simula o Pool do pg
  const mockPool = {
    query: mockQuery, // Pool.query atalha para client.query
    connect: mockConnect,
    // Adicione outros métodos do pool se necessário (ex: on, end)
  };

  return {
    mockQuery,
    mockRelease,
    mockClient,
    mockConnect,
    mockPool,
  };
};

/**
 * Helper para configurar o mock padrão do query para evitar erros de desestruturação.
 * Retorna { rows: [], rowCount: 0 } por padrão.
 */
export const setupDefaultQueryMock = (mockQuery: any) => {
  mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
};
