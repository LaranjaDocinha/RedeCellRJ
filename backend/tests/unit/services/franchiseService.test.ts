import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createFranchise,
  updateFranchiseStatus,
  deleteFranchise,
  getFranchises,
  getConsolidatedReports,
  getFranchiseSettings,
} from '../../../src/services/franchiseService';
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

describe('FranchiseService', () => {
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

  describe('createFranchise', () => {
    it('should create a franchise', async () => {
      const mockFranchise = { id: 1, name: 'Franchise 1' };
      mockClientQuery.mockResolvedValueOnce({ rows: [mockFranchise] });

      const result = await createFranchise('Franchise 1');
      expect(mockClientQuery).toHaveBeenCalledWith(
        'INSERT INTO franchises (name, address, contact_person, contact_email) VALUES ($1, $2, $3, $4) RETURNING *',
        ['Franchise 1', undefined, undefined, undefined],
      );
      expect(result).toEqual(mockFranchise);
    });
  });

  describe('updateFranchiseStatus', () => {
    it('should update franchise status', async () => {
      const mockFranchise = { id: 1, is_active: true };
      mockClientQuery.mockResolvedValueOnce({ rows: [mockFranchise] });

      const result = await updateFranchiseStatus(1, true);
      expect(mockClientQuery).toHaveBeenCalledWith(
        'UPDATE franchises SET is_active = $1 WHERE id = $2 RETURNING *',
        [true, 1],
      );
      expect(result).toEqual(mockFranchise);
    });
  });

  describe('deleteFranchise', () => {
    it('should delete a franchise', async () => {
      const mockFranchise = { id: 1 };
      mockClientQuery.mockResolvedValueOnce({ rows: [mockFranchise] });

      const result = await deleteFranchise(1);
      expect(mockClientQuery).toHaveBeenCalledWith(
        'DELETE FROM franchises WHERE id = $1 RETURNING *',
        [1],
      );
      expect(result).toEqual(mockFranchise);
    });
  });

  describe('getFranchises', () => {
    it('should return all franchises', async () => {
      const mockFranchises = [{ id: 1, name: 'Franchise 1' }];
      mockClientQuery.mockResolvedValueOnce({ rows: mockFranchises });

      const result = await getFranchises();
      expect(mockClientQuery).toHaveBeenCalledWith(
        'SELECT * FROM franchises ORDER BY created_at DESC',
      );
      expect(result).toEqual(mockFranchises);
    });
  });

  describe('getConsolidatedReports', () => {
    it('should simulate consolidated reports', async () => {
      const result = await getConsolidatedReports();
      expect(result.success).toBe(true);
    });
  });

  describe('getFranchiseSettings', () => {
    it('should simulate franchise settings', async () => {
      const result = await getFranchiseSettings(1);
      expect(result.success).toBe(true);
    });
  });
});
