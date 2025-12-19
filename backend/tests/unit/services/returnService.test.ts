import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDbMock } from '../../utils/dbMock.js';
import { AppError } from '../../../src/utils/errors.js';

// Mocks para serviços externos
vi.mock('../../../src/services/inventoryService.js', () => ({
  inventoryService: {
    receiveStock: vi.fn(),
  },
}));
vi.mock('../../../src/services/storeCreditService.js', () => ({
  storeCreditService: {
    addCredit: vi.fn(),
  },
}));

// Mock do pool do PostgreSQL
vi.mock('../../../src/db/index.js', () => {
  const { mockPool, mockQuery, mockConnect, mockClient } = createDbMock();
  return {
    default: mockPool,
    connect: mockConnect,
    query: mockQuery,
    getPool: () => mockPool,
    _mockQuery: mockQuery,
    _mockConnect: mockConnect,
    _mockClient: mockClient,
    _mockPool: mockPool,
  };
});

// Importar o serviço APÓS os mocks
import { returnService } from '../../../src/services/returnService.js';
import { inventoryService } from '../../../src/services/inventoryService.js';
import { storeCreditService } from '../../../src/services/storeCreditService.js';

describe('ReturnService', () => {
  let mockQuery: any;
  let mockConnect: any;

  beforeEach(async () => {
    const dbModule = await import('../../../src/db/index.js');
    mockQuery = (dbModule as any)._mockQuery;
    mockConnect = (dbModule as any)._mockConnect;

    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    mockConnect.mockResolvedValue((dbModule as any)._mockClient);
    
    vi.mocked(inventoryService.receiveStock).mockClear();
    vi.mocked(storeCreditService.addCredit).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createReturn', () => {
    const payload = {
      sale_id: 1,
      items: [{ product_id: 1, variation_id: 10, quantity: 1 }],
      refund_method: 'original_payment' as const,
    };
    const mockNewReturn = { id: 1, sale_id: 1, refund_amount: 100, status: 'pending' };

    it('should create a return successfully', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ price: 100 }], rowCount: 1 }) // SELECT price from sale_items
        .mockResolvedValueOnce({ rows: [mockNewReturn], rowCount: 1 }) // INSERT return
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT return_items
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const result = await returnService.createReturn(payload);
      expect(result.id).toBe(1);
      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should handle store credit refund', async () => {
      const payloadStoreCredit = { ...payload, refund_method: 'store_credit' as const };
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ price: 100 }], rowCount: 1 }) // SELECT price
        .mockResolvedValueOnce({ rows: [mockNewReturn], rowCount: 1 }) // INSERT return
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT return_items
        .mockResolvedValueOnce({ rows: [{ customer_id: 10 }], rowCount: 1 }) // SELECT sale customer
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      await returnService.createReturn(payloadStoreCredit);
      expect(storeCreditService.addCredit).toHaveBeenCalledWith(10, 100, expect.stringContaining('Refund'), 1);
    });

    it('should throw error if sale item not found', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT price (empty)

      await expect(returnService.createReturn(payload)).rejects.toThrow('Item with variation_id 10 not found in sale 1');
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('inspectReturnItem', () => {
    const returnItemId = 1;
    const mockReturnItem = { id: 1, sale_id: 1, variation_id: 10, quantity: 1, inspection_status: 'pending' };

    it('should approve item and return to stock', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockReturnItem], rowCount: 1 }) // SELECT return item
        .mockResolvedValueOnce({ rows: [{ cost_at_sale: 50 }], rowCount: 1 }) // SELECT cost
        .mockResolvedValueOnce({ rows: [{ ...mockReturnItem, inspection_status: 'approved' }], rowCount: 1 }) // UPDATE
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      await returnService.inspectReturnItem(returnItemId, 'approved', 'OK', 'user1');

      expect(inventoryService.receiveStock).toHaveBeenCalledWith(10, 1, 50, 'user1', expect.anything());
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should reject item without returning to stock', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockReturnItem], rowCount: 1 }) // SELECT return item
        .mockResolvedValueOnce({ rows: [{ ...mockReturnItem, inspection_status: 'rejected' }], rowCount: 1 }) // UPDATE
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      await returnService.inspectReturnItem(returnItemId, 'rejected', 'Damaged', 'user1');

      expect(inventoryService.receiveStock).not.toHaveBeenCalled();
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw error if return item not found', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT return item (empty)

      await expect(returnService.inspectReturnItem(returnItemId, 'approved', 'OK')).rejects.toThrow(
        'Return item not found'
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error if item already inspected', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ ...mockReturnItem, inspection_status: 'approved' }], rowCount: 1 }); // SELECT return item (already approved)

      await expect(returnService.inspectReturnItem(returnItemId, 'approved', 'OK')).rejects.toThrow(
        'Item has already been inspected'
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('getAllReturns', () => {
    it('should return all returns', async () => {
      const mockReturns = [{ id: 1 }];
      mockQuery.mockResolvedValueOnce({ rows: mockReturns, rowCount: 1 });
      const result = await returnService.getAllReturns();
      expect(result).toEqual(mockReturns);
    });
  });

  describe('updateReturn', () => {
    it('should update return', async () => {
      const mockReturn = { id: 1, reason: 'New Reason' };
      mockQuery.mockResolvedValueOnce({ rows: [mockReturn], rowCount: 1 });
      const result = await returnService.updateReturn(1, { reason: 'New Reason' });
      expect(result).toEqual(mockReturn);
    });

    it('should return existing return if no fields to update', async () => {
      const mockReturn = { id: 1, reason: 'Reason' };
      mockQuery.mockResolvedValueOnce({ rows: [mockReturn], rowCount: 1 }); // getReturnById
      const result = await returnService.updateReturn(1, {});
      expect(result).toEqual(mockReturn);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM returns WHERE id = $1'), [1]);
    });

    it('should return undefined if return not found for update (no fields)', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // getReturnById (not found)
      const result = await returnService.updateReturn(999, {});
      expect(result).toBeUndefined();
    });

    it('should throw AppError if DB error occurs', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB Error'));
      await expect(returnService.updateReturn(1, { reason: 'New' })).rejects.toThrow('DB Error');
    });
  });

  describe('deleteReturn', () => {
    it('should delete return', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
      const result = await returnService.deleteReturn(1);
      expect(result).toBe(true);
    });
  });
  
  describe('getPendingInspectionItems', () => {
      it('should return pending items', async () => {
          const mockItems = [{ id: 1 }];
          mockQuery.mockResolvedValueOnce({ rows: mockItems, rowCount: 1 });
          const result = await returnService.getPendingInspectionItems();
          expect(result).toEqual(mockItems);
      });
  });

  describe('getReturnById', () => {
    it('should return return by ID', async () => {
      const mockReturn = { id: 1 };
      mockQuery.mockResolvedValueOnce({ rows: [mockReturn], rowCount: 1 });
      const result = await returnService.getReturnById(1);
      expect(result).toEqual(mockReturn);
    });
  });

  describe('getReturnItemById', () => {
    it('should return return item by ID', async () => {
      const mockItem = { id: 1 };
      mockQuery.mockResolvedValueOnce({ rows: [mockItem], rowCount: 1 });
      const result = await returnService.getReturnItemById(1);
      expect(result).toEqual(mockItem);
    });
  });
});