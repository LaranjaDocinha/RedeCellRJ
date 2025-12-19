import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSimplePLReport, getCashFlowReport, getProductProfitabilityReport } from '../../../src/services/financeService';
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

describe('FinanceService', () => {
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

  describe('getSimplePLReport', () => {
    it('should return a simple P&L report', async () => {
      mockDefaultQuery
        .mockResolvedValueOnce({ rows: [{ total_revenue: '1000' }] }) // revenueRes
        .mockResolvedValueOnce({ rows: [{ total_cost: '400' }] }); // partsCostRes

      const result = await getSimplePLReport('2023-01-01', '2023-01-31');

      expect(mockDefaultQuery).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ revenue: 1000, cost: 400, profit: 600 });
    });
  });

  describe('getCashFlowReport', () => {
    it('should return cash flow report', async () => {
      mockDefaultQuery.mockResolvedValueOnce({
        rows: [{ date: '2023-01-01', total_income: '500', total_expense: '200' }],
      });

      const result = await getCashFlowReport('2023-01-01', '2023-01-31');

      expect(mockDefaultQuery).toHaveBeenCalledOnce();
      expect(result).toEqual([{ date: '2023-01-01', total_income: '500', total_expense: '200' }]);
    });
  });

  describe('getProductProfitabilityReport', () => {
    it('should return product profitability report', async () => {
      mockDefaultQuery.mockResolvedValueOnce({
        rows: [
          {
            product_name: 'Product A',
            total_quantity_sold: '10',
            total_revenue: '1000',
            total_cost_of_goods_sold: '500',
            gross_profit: '500',
            gross_margin_percentage: '50',
          },
        ],
      });

      const result = await getProductProfitabilityReport('2023-01-01', '2023-01-31');

      expect(mockDefaultQuery).toHaveBeenCalledOnce();
      expect(result).toEqual([
        {
          product_name: 'Product A',
          total_quantity_sold: 10,
          total_revenue: 1000,
          total_cost_of_goods_sold: 500,
          gross_profit: 500,
          gross_margin_percentage: 50,
        },
      ]);
    });
  });
});
