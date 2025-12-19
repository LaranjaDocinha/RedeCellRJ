import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { syncProductFeed, getGoogleShoppingStatus } from '../../../src/services/googleShoppingService';
import * as dbModule from '../../../src/db/index'; // Importa o módulo real para tipagem

// Define os mocks diretamente na factory function do vi.mock para db
const mockClientQuery = vi.fn();
const mockClientConnect = vi.fn();

const mockGetPool = vi.fn(() => ({
  query: mockClientQuery, // Para pool.query direto
  connect: mockClientConnect, // Para pool.connect()
  end: vi.fn(),
}));

const mockDefaultQuery = vi.fn(); // Mock para pool.query quando importado como 'pool'

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
    // Exporta os mocks para que o teste possa usá-los diretamente
    mockClientQuery,
    mockClientConnect,
    mockGetPool,
    mockDefaultQuery,
  };
});

describe('GoogleShoppingService', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpa todas as chamadas e mocks

    // Resetar os mocks específicos para cada teste
    mockClientQuery.mockReset();
    mockClientConnect.mockReset();
    mockGetPool.mockReset();
    mockDefaultQuery.mockReset();

    mockClientQuery.mockResolvedValue({ rows: [], rowCount: 0 }); // Default mock
    mockClientConnect.mockResolvedValue({ query: mockClientQuery, release: vi.fn() }); // Mocka a conexão
    mockGetPool.mockReturnValue({ query: mockClientQuery, connect: mockClientConnect, end: vi.fn() }); // Garante que getPool retorne nossa instância mockada
    mockDefaultQuery.mockResolvedValue({ rows: [], rowCount: 0 }); // Default mock para o default pool.query
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restaura tudo
  });

  describe('syncProductFeed', () => {
    it('should simulate product feed synchronization', async () => {
      const result = await syncProductFeed([]);
      expect(result.success).toBe(true);
    });
  });

  describe('getGoogleShoppingStatus', () => {
    it('should simulate status retrieval', async () => {
      const result = await getGoogleShoppingStatus();
      expect(result.status).toBe('Connected');
    });
  });
});
