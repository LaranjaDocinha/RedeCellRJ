import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getRepairProfitability,
  getTradeInMargin,
} from '../../../src/services/extendedReportService';
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

describe('ExtendedReportService', () => {
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

  describe('getRepairProfitability', () => {
    it('should return repair profitability report', async () => {
      mockDefaultQuery.mockResolvedValueOnce({
        rows: [{ id: 1, budget_value: 200, total_cost: 100 }],
      });

      const result = await getRepairProfitability();

      const expectedQuery = `
    SELECT 
      so.id, 
      so.budget_value,
      SUM(COALESCE(p.cost_price, 0) * soi.quantity) as total_cost
    FROM service_orders so
    LEFT JOIN service_order_items soi ON so.id = soi.service_order_id
    LEFT JOIN parts p ON soi.part_id = p.id
    WHERE so.status = 'Entregue'
    GROUP BY so.id
  `;

      const normalizeSql = (sql: string) => sql.replace(/\s+/g, ' ').trim();

      expect(mockDefaultQuery).toHaveBeenCalledOnce();
      const actualQuery = mockDefaultQuery.mock.calls[0][0];
      expect(normalizeSql(actualQuery)).toBe(normalizeSql(expectedQuery));
      expect(result).toEqual([{ id: 1, budget_value: 200, total_cost: 100 }]);
    });
  });

  describe('getTradeInMargin', () => {
    it('should return empty array as placeholder', async () => {
      const result = await getTradeInMargin();
      expect(result).toEqual([]);
    });
  });
});
