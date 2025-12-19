import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { globalSearch } from '../../../src/services/globalSearchService';
import * as dbModule from '../../../src/db/index'; // Importa o módulo real para tipagem

// Define os mocks hoisted para serem acessíveis dentro de vi.mock e nos testes
const { mockClientQuery, mockClientConnect, mockGetPool, mockDefaultQuery } = vi.hoisted(() => {
  const query = vi.fn();
  const connect = vi.fn();
  const end = vi.fn();
  const getPool = vi.fn(() => ({
    query: query,
    connect: connect,
    end: end,
  }));
  const defaultQuery = vi.fn();
  return {
    mockClientQuery: query,
    mockClientConnect: connect,
    mockGetPool: getPool,
    mockDefaultQuery: defaultQuery,
  };
});

vi.mock('../../../src/db/index', async (importActual) => {
  const actual = await importActual<typeof dbModule>();
  return {
    ...actual, // Mantém exports reais que não queremos mockar
    getPool: mockGetPool,
    setPool: vi.fn(),
    default: {
      query: mockDefaultQuery, // Usa o mockDefaultQuery
      connect: mockClientConnect,
      getPool: mockGetPool, // Garante que o default export tenha getPool
      setPool: vi.fn(),
    },
  };
});

describe('GlobalSearchService', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpa todas as chamadas e mocks

    // Resetar os mocks específicos para cada teste
    mockClientQuery.mockReset();
    mockClientConnect.mockReset();
    mockGetPool.mockClear(); // mockClear para vi.hoisted functions
    mockDefaultQuery.mockReset();

    mockClientQuery.mockResolvedValue({ rows: [], rowCount: 0 }); // Default mock
    mockClientConnect.mockResolvedValue({ query: mockClientQuery, release: vi.fn() }); // Mocka a conexão
    // mockGetPool já retorna a estrutura correta definida no hoisted
    mockDefaultQuery.mockResolvedValue({ rows: [], rowCount: 0 }); // Default mock para o default pool.query
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restaura tudo
  });

  describe('globalSearch', () => {
    it('should search for products and users', async () => {
      mockDefaultQuery
        .mockResolvedValueOnce({ rows: [{ id: 'prod1', name: 'Product 1', description: 'Desc 1' }] }) // Products
        .mockResolvedValueOnce({ rows: [{ id: 'user1', name: 'User 1', email: 'user@example.com' }] }); // Users

      const result = await globalSearch('test');

      expect(mockDefaultQuery).toHaveBeenCalledTimes(2);
      expect(mockDefaultQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, name, description FROM products'),
        ['%test%']
      );
      expect(mockDefaultQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, name, email FROM users'),
        ['%test%']
      );
      expect(result).toEqual([
        { type: 'product', id: 'prod1', name: 'Product 1', description: 'Desc 1' },
        { type: 'user', id: 'user1', name: 'User 1', email: 'user@example.com' },
      ]);
    });

    it('should return empty results if no matches', async () => {
      mockDefaultQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] });

      const result = await globalSearch('nomatch');
      expect(result).toEqual([]);
    });
  });
});
