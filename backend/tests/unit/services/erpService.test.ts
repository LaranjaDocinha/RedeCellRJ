import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { erpService } from '../../../src/services/erpService';
import * as dbModule from '../../../src/db/index'; // Importa o módulo real para tipagem
import * as loggerModule from '../../../src/utils/logger';
import * as fs from 'fs/promises'; // Importar fs/promises no topo
import * as path from 'path';

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

// Mock logger
vi.mock('../../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fs/promises - Comportamento com default e named exports
vi.mock('fs/promises', () => {
  const mkdir = vi.fn();
  const writeFile = vi.fn();
  return {
    default: {
      mkdir,
      writeFile,
    },
    mkdir, // Exporta nomeado também para cobrir importações { mkdir }
    writeFile, // Exporta nomeado também
  };
});

// Mock path
vi.mock('path', () => ({
  default: {
    resolve: vi.fn((p) => p), // Apenas retorna o caminho para simplificar
    join: vi.fn((...args) => args.join('/')),
  },
}));

describe('ErpService', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpa todas as chamadas e mocks

    // Resetar os mocks específicos para cada teste
    mockClientQuery.mockReset();
    mockClientConnect.mockReset();
    mockGetPool.mockClear(); // mockClear para vi.hoisted functions
    mockDefaultQuery.mockReset();
    (loggerModule.logger.info as ReturnType<typeof vi.fn>).mockReset();
    (loggerModule.logger.error as ReturnType<typeof vi.fn>).mockReset();

    // Acessar os mocks via vi.mocked para garantir que o mock seja usado
    vi.mocked(fs.default).mkdir.mockReset(); // Correção aqui
    vi.mocked(fs.default).writeFile.mockReset(); // Correção aqui

    (path.default.join as ReturnType<typeof vi.fn>).mockReset();

    mockClientQuery.mockResolvedValue({ rows: [], rowCount: 0 }); // Default mock
    mockClientConnect.mockResolvedValue({ query: mockClientQuery, release: vi.fn() }); // Mocka a conexão
    // mockGetPool já retorna a estrutura correta definida no hoisted
    mockDefaultQuery.mockResolvedValue({ rows: [], rowCount: 0 }); // Default mock para o default pool.query

    // Simular ERP_EXPORT_DIR
    process.env.ERP_EXPORT_DIR = '/tmp/erp_exports';
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restaura tudo
    delete process.env.ERP_EXPORT_DIR; // Limpa variável de ambiente
  });

  describe('exportSalesToERP', () => {
    it('should export sales data to JSON file', async () => {
      mockDefaultQuery.mockResolvedValueOnce({
        rows: [
          {
            sale_id: 1,
            total_amount: 100,
            sale_date: new Date(),
            product_id: 1,
            quantity: 1,
            unit_price: 100,
            cost_price: 50,
            payment_method: 'Credit Card',
            payment_amount: 100,
          },
        ],
      });
      vi.mocked(fs.default).writeFile.mockResolvedValue(undefined); // Correção aqui

      const startDate = new Date(2023, 0, 1);
      const endDate = new Date(2023, 0, 31);
      const result = await erpService.exportSalesToERP(startDate, endDate);

      expect(mockDefaultQuery).toHaveBeenCalledOnce();
      // O path.resolve mockado retorna o argumento 'temp/erp_exports', e a variável de ambiente não afeta a constante já inicializada
      expect(vi.mocked(fs.default).mkdir).toHaveBeenCalledWith('temp/erp_exports', {
        recursive: true,
      }); // Correção aqui
      expect(vi.mocked(fs.default).writeFile).toHaveBeenCalledWith(
        expect.stringContaining('temp/erp_exports/sales_erp_export_'),
        expect.any(String),
      );
      expect(result).toContain('temp/erp_exports/sales_erp_export_');
    });

    it('should return "No data exported." if no sales data', async () => {
      mockDefaultQuery.mockResolvedValueOnce({ rows: [] });

      const startDate = new Date(2023, 0, 1);
      const endDate = new Date(2023, 0, 31);
      const result = await erpService.exportSalesToERP(startDate, endDate);

      expect(mockDefaultQuery).toHaveBeenCalledOnce();
      expect(loggerModule.logger.info).toHaveBeenCalledWith('No sales data to export for ERP.');
      expect(result).toBe('No data exported.');
    });
  });

  describe('exportExpensesToERP', () => {
    it('should export expense data to JSON file', async () => {
      mockDefaultQuery.mockResolvedValueOnce({
        rows: [
          {
            expense_id: 1,
            amount: 50,
            description: 'Office Supplies',
            expense_date: new Date(),
            category: 'Supplies',
            payment_method: 'Cash',
          },
        ],
      });
      vi.mocked(fs.default).writeFile.mockResolvedValue(undefined); // Correção aqui

      const startDate = new Date(2023, 0, 1);
      const endDate = new Date(2023, 0, 31);
      const result = await erpService.exportExpensesToERP(startDate, endDate);

      expect(mockDefaultQuery).toHaveBeenCalledOnce();
      expect(vi.mocked(fs.default).mkdir).toHaveBeenCalledWith('temp/erp_exports', {
        recursive: true,
      }); // Correção aqui
      expect(vi.mocked(fs.default).writeFile).toHaveBeenCalledWith(
        expect.stringContaining('temp/erp_exports/expenses_erp_export_'),
        expect.any(String),
      );
      expect(result).toContain('temp/erp_exports/expenses_erp_export_');
    });

    it('should return "No data exported." if no expense data', async () => {
      mockDefaultQuery.mockResolvedValueOnce({ rows: [] });

      const startDate = new Date(2023, 0, 1);
      const endDate = new Date(2023, 0, 31);
      const result = await erpService.exportExpensesToERP(startDate, endDate);

      expect(mockDefaultQuery).toHaveBeenCalledOnce();
      expect(loggerModule.logger.info).toHaveBeenCalledWith('No expense data to export for ERP.');
      expect(result).toBe('No data exported.');
    });
  });
});
