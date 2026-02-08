import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { imeiService } from '../../../src/services/imeiService';
import * as dbModule from '../../../src/db/index'; // Importa o módulo real para tipagem
import { AppError } from '../../../src/utils/errors';

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

describe('ImeiService', () => {
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

  describe('recordImeiEvent', () => {
    it('should record an IMEI event', async () => {
      const mockEvent = { id: 1, imei: '123', event_type: 'Activation' };
      mockDefaultQuery.mockResolvedValueOnce({ rows: [mockEvent] });

      const payload = { imei: '123', event_type: 'Activation' };
      const result = await imeiService.recordImeiEvent(payload);

      expect(mockDefaultQuery).toHaveBeenCalledOnce();
      expect(mockDefaultQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO imei_lifecycle_events'),
        [payload.imei, payload.event_type, undefined, undefined],
      );
      expect(result).toEqual(mockEvent);
    });
  });

  describe('getImeiHistory', () => {
    it('should return IMEI history', async () => {
      const mockHistory = [{ id: 1, imei: '123', event_type: 'Activation' }];
      mockDefaultQuery.mockResolvedValueOnce({ rows: mockHistory });

      const result = await imeiService.getImeiHistory('123');

      expect(mockDefaultQuery).toHaveBeenCalledOnce();
      expect(mockDefaultQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM imei_lifecycle_events WHERE imei = $1'),
        ['123'],
      );
      expect(result).toEqual(mockHistory);
    });
  });
});
