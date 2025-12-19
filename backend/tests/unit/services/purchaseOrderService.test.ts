import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDbMock } from '../../utils/dbMock.js';
import { AppError } from '../../../src/utils/errors.js';

// Mock do inventoryService
vi.mock('../../../src/services/inventoryService.js', () => ({
  inventoryService: {
    receiveStock: vi.fn(),
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
import { purchaseOrderService } from '../../../src/services/purchaseOrderService.js';
import { inventoryService } from '../../../src/services/inventoryService.js';

describe('PurchaseOrderService', () => {
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllPurchaseOrders', () => {
    it('should return all purchase orders', async () => {
      const mockOrders = [{ id: 1, status: 'pending' }];
      mockQuery.mockResolvedValueOnce({ rows: mockOrders, rowCount: 1 });

      const result = await purchaseOrderService.getAllPurchaseOrders();
      expect(result).toEqual(mockOrders);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM purchase_orders ORDER BY created_at DESC');
    });
  });

  describe('getPurchaseOrderById', () => {
    it('should return a purchase order by id', async () => {
      const mockOrder = { id: 1, status: 'pending' };
      mockQuery.mockResolvedValueOnce({ rows: [mockOrder], rowCount: 1 });

      const result = await purchaseOrderService.getPurchaseOrderById(1);
      expect(result).toEqual(mockOrder);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM purchase_orders WHERE id = $1', [1]);
    });
  });

  describe('createPurchaseOrder', () => {
    const payload = { supplier_id: 1, items: [{ product_variation_id: 10, quantity: 5, unit_price: 10 }] };
    const mockNewOrder = { id: 1, supplier_id: 1, status: 'pending' };

    it('should create a purchase order and its items', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockNewOrder], rowCount: 1 }) // INSERT order
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT item
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const result = await purchaseOrderService.createPurchaseOrder(payload);
      expect(result).toEqual(mockNewOrder);
      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO purchase_orders'),
        expect.any(Array)
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO purchase_order_items'),
        expect.any(Array)
      );
    });

    it('should rollback if creation fails', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockRejectedValueOnce(new Error('DB Error')); // INSERT order fails

      await expect(purchaseOrderService.createPurchaseOrder(payload)).rejects.toThrow('DB Error');
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('updatePurchaseOrder', () => {
    const orderId = 1;
    const payload = { status: 'ordered' as const };
    const mockOrder = { id: orderId, status: 'ordered' };

    it('should update a purchase order', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockOrder], rowCount: 1 }) // UPDATE
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // COMMIT
        .mockResolvedValueOnce({ rows: [mockOrder], rowCount: 1 }); // getPurchaseOrderById

      const result = await purchaseOrderService.updatePurchaseOrder(orderId, payload);
      expect(result).toEqual(mockOrder);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE purchase_orders SET status = $1'),
        expect.any(Array)
      );
    });

    it('should update items if provided', async () => {
      const payloadWithItems = { items: [{ product_variation_id: 10, quantity: 10, unit_price: 10 }] };
      
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // DELETE existing items
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT new items
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // COMMIT
        .mockResolvedValueOnce({ rows: [mockOrder], rowCount: 1 }); // getPurchaseOrderById

      await purchaseOrderService.updatePurchaseOrder(orderId, payloadWithItems);
      
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM purchase_order_items WHERE purchase_order_id = $1', [orderId]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO purchase_order_items'),
        expect.any(Array)
      );
    });
  });

  describe('deletePurchaseOrder', () => {
    it('should delete a purchase order', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // DELETE items
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // DELETE order
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const result = await purchaseOrderService.deletePurchaseOrder(1);
      expect(result).toBe(true);
    });
  });

  describe('receivePurchaseOrderItems', () => {
    const orderId = 1;
    const receivedItems = [{ product_variation_id: 10, quantity: 5, unit_price: 10 }];
    const mockOrder = { id: orderId, status: 'ordered' };
    const mockOrderItems = [{ product_variation_id: 10, quantity: 5, unit_price: 10 }];

    it('should receive items and update stock', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockOrder], rowCount: 1 }) // SELECT order
        .mockResolvedValueOnce({ rows: mockOrderItems, rowCount: 1 }) // SELECT items
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE order status
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // COMMIT
        .mockResolvedValueOnce({ rows: [{ ...mockOrder, status: 'received' }], rowCount: 1 }); // getPurchaseOrderById

      vi.mocked(inventoryService.receiveStock).mockResolvedValue({} as any);

      const result = await purchaseOrderService.receivePurchaseOrderItems(orderId, receivedItems, 'user1');

      expect(result?.status).toBe('received');
      expect(inventoryService.receiveStock).toHaveBeenCalledWith(
        10, 5, 10, 'user1', expect.anything()
      );
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw error if order not found', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT order (not found)

      await expect(purchaseOrderService.receivePurchaseOrderItems(orderId, receivedItems)).rejects.toThrow(
        new AppError(`Purchase order ${orderId} not found.`, 404)
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error if order status is not ordered', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ ...mockOrder, status: 'pending' }], rowCount: 1 }); // SELECT order

      await expect(purchaseOrderService.receivePurchaseOrderItems(orderId, receivedItems)).rejects.toThrow(
        new AppError(`Purchase order ${orderId} is not in 'ordered' status. Current status: pending`, 400)
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error if received item is not in order', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockOrder], rowCount: 1 }) // SELECT order
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT items (empty or mismatch)

      await expect(purchaseOrderService.receivePurchaseOrderItems(orderId, receivedItems)).rejects.toThrow(
        new AppError(`Item (product_variation_id: 10) not found in purchase order ${orderId}.`, 400)
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });
  });
});
