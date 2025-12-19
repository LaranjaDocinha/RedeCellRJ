import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getFinancialDashboardData } from '../../../src/services/financialDashboardService';
import * as dbModule from '../../../src/db/index'; // Importa o módulo real para tipagem

// Define os mocks hoisted para serem acessíveis dentro de vi.mock e nos testes
const { mockClientQuery, mockClientRelease, mockClientConnect, mockGetPool, mockDefaultQuery } =
  vi.hoisted(() => {
    const query = vi.fn();
    const release = vi.fn();
    const connect = vi.fn(() => ({
      query: query,
      release: release,
    }));
    const end = vi.fn();
    const getPool = vi.fn(() => ({
      query: query,
      connect: connect,
      end: end,
    }));
    const defaultQuery = vi.fn();
    return {
      mockClientQuery: query,
      mockClientRelease: release,
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

describe('FinancialDashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpa todas as chamadas e mocks

    // Resetar os mocks específicos para cada teste
    mockClientQuery.mockReset();
    mockClientConnect.mockReset();
    mockClientRelease.mockReset();
    mockGetPool.mockClear(); // mockClear para vi.hoisted functions
    mockDefaultQuery.mockReset();

    mockClientQuery.mockResolvedValue({ rows: [], rowCount: 0 }); // Default mock
    mockClientConnect.mockResolvedValue({ query: mockClientQuery, release: mockClientRelease }); // Mocka a conexão
    // mockGetPool já retorna a estrutura correta definida no hoisted
    mockDefaultQuery.mockResolvedValue({ rows: [], rowCount: 0 }); // Default mock para o default pool.query
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restaura tudo
  });

  describe('getFinancialDashboardData', () => {
    it('should return financial dashboard data', async () => {
      mockClientQuery
        .mockResolvedValueOnce({ rows: [{ total_revenue: '1000', total_cogs: '500' }] }) // financialSummary
        .mockResolvedValueOnce({ rows: [{ category_name: 'Cat1', total_sales: '500' }] }) // salesByCategory
        .mockResolvedValueOnce({ rows: [{ product_name: 'Prod1', total_quantity_sold: '10' }] }); // topSellingProducts

      const result = await getFinancialDashboardData();

      expect(mockClientConnect).toHaveBeenCalledOnce();
      expect(mockClientQuery).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        total_revenue: 1000,
        total_cogs: 500,
        total_profit: 500,
        sales_by_category: [{ category_name: 'Cat1', total_sales: '500' }],
        top_selling_products: [{ product_name: 'Prod1', total_quantity_sold: '10' }],
      });
      expect(mockClientRelease).toHaveBeenCalledOnce();
    });

    it('should handle null/undefined values for financial summary', async () => {
      mockClientQuery
        .mockResolvedValueOnce({ rows: [{ total_revenue: null, total_cogs: null }] }) // financialSummary
        .mockResolvedValueOnce({ rows: [] }) // salesByCategory
        .mockResolvedValueOnce({ rows: [] }); // topSellingProducts

      const result = await getFinancialDashboardData();

      expect(result.total_revenue).toBe(0);
      expect(result.total_cogs).toBe(0);
      expect(result.total_profit).toBe(0);
    });
  });
});
