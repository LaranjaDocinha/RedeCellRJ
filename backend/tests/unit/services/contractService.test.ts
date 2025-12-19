import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { contractService } from '../../../src/services/contractService';
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

describe('ContractService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDefaultQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateContractHtml', () => {
    it('should generate HTML with sale data', async () => {
      const saleData = {
        id: 1,
        customer_name: 'John Doe',
        sale_date: '2023-01-01',
        total_amount: 1000,
        items: [{ quantity: 1, product_name: 'Product A', price_at_sale: 1000 }],
      };

      const html = await contractService.generateContractHtml(saleData);

      expect(html).toContain('Contrato de Venda #1');
      expect(html).toContain('John Doe');
      expect(html).toContain('Product A');
    });
  });

  describe('createSaleContract', () => {
    it('should create a sale contract', async () => {
      const payload: any = { sale_id: 1, contract_url: 'http://url.com', signed_at: '2023-01-01' };
      const createdContract = { id: 1, ...payload };
      mockDefaultQuery.mockResolvedValueOnce({ rows: [createdContract] });

      const result = await contractService.createSaleContract(payload);

      expect(mockDefaultQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sale_contracts'),
        [payload.sale_id, payload.contract_url, undefined, payload.signed_at]
      );
      expect(result).toEqual(createdContract);
    });
  });

  describe('getSaleContractById', () => {
    it('should return a contract by id', async () => {
      const contract = { id: 1, sale_id: 1 };
      mockDefaultQuery.mockResolvedValueOnce({ rows: [contract] });

      const result = await contractService.getSaleContractById(1);

      expect(mockDefaultQuery).toHaveBeenCalledWith('SELECT * FROM sale_contracts WHERE id = $1', [1]);
      expect(result).toEqual(contract);
    });
  });

  describe('getSaleContractsBySaleId', () => {
    it('should return contracts for a sale', async () => {
      const contracts = [{ id: 1, sale_id: 1 }];
      mockDefaultQuery.mockResolvedValueOnce({ rows: contracts });

      const result = await contractService.getSaleContractsBySaleId(1);

      expect(mockDefaultQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM sale_contracts WHERE sale_id = $1'),
        [1]
      );
      expect(result).toEqual(contracts);
    });
  });

  describe('updateSaleContractSignature', () => {
    it('should update contract signature', async () => {
      const updatedContract = { id: 1, signature_image_url: 'http://sig.com' };
      mockDefaultQuery.mockResolvedValueOnce({ rows: [updatedContract] });

      const result = await contractService.updateSaleContractSignature(1, 'http://sig.com');

      expect(mockDefaultQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE sale_contracts SET signature_image_url = $1'),
        ['http://sig.com', 1]
      );
      expect(result).toEqual(updatedContract);
    });
  });
});
