import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CommissionRulesService } from '../../../src/services/CommissionRulesService';
import * as dbModule from '../../../src/db/index';

// Hoisted mocks
const { mockClientQuery, mockClientConnect, mockGetPool, mockDefaultQuery } = vi.hoisted(() => {
  const query = vi.fn();
  const connect = vi.fn();
  const getPool = vi.fn(() => ({
    query: query,
    connect: connect,
    end: vi.fn(),
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
    ...actual,
    getPool: mockGetPool,
    default: {
      query: mockDefaultQuery,
      connect: mockClientConnect,
      getPool: mockGetPool,
    },
  };
});

vi.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

describe('CommissionRulesService', () => {
  let service: CommissionRulesService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDefaultQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    // O pool é obtido no topo do arquivo do serviço, então ele usa a instância retornada por mockGetPool na importação
    // Precisamos garantir que mockClientQuery (retornado por pool.query) seja o que estamos configurando
    mockClientQuery.mockResolvedValue({ rows: [], rowCount: 0 });

    service = new CommissionRulesService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createCommissionRule', () => {
    it('should create a commission rule', async () => {
      const payload: any = {
        name: 'Rule 1',
        value_type: 'percentage',
        value: 10,
        applies_to: 'all',
      };
      const createdRule = { id: 'mock-uuid', ...payload };
      mockClientQuery.mockResolvedValueOnce({ rows: [createdRule] });

      const result = await service.createCommissionRule(payload);

      expect(mockClientQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO commission_rules'),
        expect.arrayContaining(['mock-uuid', 'Rule 1']),
      );
      expect(result).toEqual(createdRule);
    });
  });

  describe('getCommissionRules', () => {
    it('should return all rules', async () => {
      const rules = [{ id: '1', name: 'Rule 1' }];
      mockClientQuery.mockResolvedValueOnce({ rows: rules });

      const result = await service.getCommissionRules();

      expect(mockClientQuery).toHaveBeenCalledWith('SELECT * FROM commission_rules');
      expect(result).toEqual(rules);
    });
  });

  describe('updateCommissionRule', () => {
    it('should update a rule', async () => {
      const payload = { name: 'Updated Rule' };
      const updatedRule = { id: '1', name: 'Updated Rule' };
      mockClientQuery.mockResolvedValueOnce({ rows: [updatedRule] });

      const result = await service.updateCommissionRule('1', payload);

      expect(mockClientQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE commission_rules SET'),
        expect.arrayContaining(['1', 'Updated Rule']),
      );
      expect(result).toEqual(updatedRule);
    });
  });

  describe('deleteCommissionRule', () => {
    it('should return true if rule deleted', async () => {
      mockClientQuery.mockResolvedValueOnce({ rowCount: 1 });

      const result = await service.deleteCommissionRule('1');

      expect(mockClientQuery).toHaveBeenCalledWith(
        'DELETE FROM commission_rules WHERE id = $1 RETURNING id',
        ['1'],
      );
      expect(result).toBe(true);
    });
  });
});
