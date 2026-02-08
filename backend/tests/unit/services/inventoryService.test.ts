import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { inventoryService } from '../../../src/services/inventoryService.js';
import { AppError } from '../../../src/utils/errors.js';
import { demandPredictionService } from '../../../src/services/demandPredictionService.js';
import { inventoryRepository } from '../../../src/repositories/inventory.repository.js';

// Mock do módulo de banco de dados (para transações)
vi.mock('../../../src/db/index.js', () => {
  const mockQuery = vi.fn();
  const mockRelease = vi.fn();
  const mockClient = {
    query: mockQuery,
    release: mockRelease,
  };
  const mockConnect = vi.fn().mockResolvedValue(mockClient);
  const mockPool = {
    query: mockQuery, // Used for non-transactional if any (service uses repo now, but pool.connect needed)
    connect: mockConnect,
  };

  return {
    default: mockPool,
    getPool: () => mockPool,
    _mockQuery: mockQuery,
    _mockConnect: mockConnect,
    _mockClient: mockClient,
  };
});

// Mock do repositório
vi.mock('../../../src/repositories/inventory.repository.js', () => ({
  inventoryRepository: {
    findLowStockProducts: vi.fn(),
    findStockForUpdate: vi.fn(),
    updateStockQuantity: vi.fn(),
    createMovement: vi.fn(),
    findPurchaseLayers: vi.fn(),
    decrementMovementRemaining: vi.fn(),
    findDiscrepancies: vi.fn(),
    findProductsBelowThreshold: vi.fn(),
  },
}));

// Mock do módulo de predição
vi.mock('../../../src/services/demandPredictionService.js', () => ({
  demandPredictionService: {
    predictDemand: vi.fn(),
  },
}));

// Mock do fetch global
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({}),
});

describe('inventoryService', () => {
  let mockQuery: any;
  let mockConnect: any;
  let mockClient: any;

  beforeEach(async () => {
    const dbModule = await import('../../../src/db/index.js');
    mockQuery = (dbModule as any)._mockQuery;
    mockConnect = (dbModule as any)._mockConnect;
    mockClient = (dbModule as any)._mockClient;

    vi.clearAllMocks();

    // Default behaviors
    mockConnect.mockResolvedValue(mockClient);
    (global.fetch as vi.Mock).mockClear().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.mocked(demandPredictionService.predictDemand).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('adjustStock', () => {
    const variationId = 1;
    const branchId = 1;
    const userId = 'test-user-id';

    it('should increase stock and record movement successfully', async () => {
      // Setup Repository Mocks
      vi.mocked(inventoryRepository.findStockForUpdate).mockResolvedValue({
        stock_quantity: 10,
        low_stock_threshold: 5,
        product_id: 101,
      });
      vi.mocked(inventoryRepository.updateStockQuantity).mockResolvedValue({
        quantity: 15,
      });
      vi.mocked(inventoryRepository.createMovement).mockResolvedValue(undefined);

      const result = await inventoryService.adjustStock(
        variationId,
        5,
        'stock_received',
        userId,
        undefined,
        10,
        branchId,
      );

      expect(result).toEqual({ quantity: 15 });

      // Check Transaction Management
      expect(mockConnect).toHaveBeenCalled();
      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();

      // Check Repository Calls
      expect(inventoryRepository.findStockForUpdate).toHaveBeenCalledWith(
        variationId,
        branchId,
        mockClient,
      );
      expect(inventoryRepository.updateStockQuantity).toHaveBeenCalledWith(
        variationId,
        branchId,
        15,
        mockClient,
      );
      expect(inventoryRepository.createMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          product_variation_id: variationId,
          branch_id: branchId,
          quantity_change: 5,
          reason: 'stock_received',
          user_id: userId,
          unit_cost: 10,
          quantity_remaining: 5,
        }),
        mockClient,
      );
    });

    it('should decrease stock and record movement successfully (non-FIFO)', async () => {
      vi.mocked(inventoryRepository.findStockForUpdate).mockResolvedValue({
        stock_quantity: 10,
        low_stock_threshold: 5,
        product_id: 101,
      });
      vi.mocked(inventoryRepository.updateStockQuantity).mockResolvedValue({
        quantity: 7,
      });
      vi.mocked(inventoryRepository.createMovement).mockResolvedValue(undefined);

      // Fix: Mock findPurchaseLayers to return enough stock to cover the decrease (3 units)
      vi.mocked(inventoryRepository.findPurchaseLayers).mockResolvedValue([
        { id: 999, quantity_remaining: 100 },
      ]);
      vi.mocked(inventoryRepository.decrementMovementRemaining).mockResolvedValue(undefined);

      const result = await inventoryService.adjustStock(
        variationId,
        -3,
        'stock_dispatched',
        userId,
        undefined,
        undefined,
        branchId,
      );

      expect(result).toEqual({ quantity: 7 });
      expect(inventoryRepository.createMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity_change: -3,
          quantity_remaining: null,
        }),
        mockClient,
      );
      // Verify FIFO logic was engaged even in this basic test
      expect(inventoryRepository.findPurchaseLayers).toHaveBeenCalled();
      expect(inventoryRepository.decrementMovementRemaining).toHaveBeenCalledWith(
        999,
        3,
        mockClient,
      );
    });

    it('should throw AppError if product variation stock not found', async () => {
      vi.mocked(inventoryRepository.findStockForUpdate).mockResolvedValue(null);

      await expect(
        inventoryService.adjustStock(
          variationId,
          5,
          'stock_received',
          userId,
          undefined,
          10,
          branchId,
        ),
      ).rejects.toThrow('Product variation stock not found for this branch.');

      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw AppError if stock quantity becomes negative', async () => {
      vi.mocked(inventoryRepository.findStockForUpdate).mockResolvedValue({
        stock_quantity: 2,
        low_stock_threshold: 5,
        product_id: 101,
      });

      await expect(
        inventoryService.adjustStock(
          variationId,
          -5,
          'stock_dispatched',
          userId,
          undefined,
          undefined,
          branchId,
        ),
      ).rejects.toThrow('Stock quantity cannot be negative');

      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw AppError if unit cost is not provided for stock_received', async () => {
      vi.mocked(inventoryRepository.findStockForUpdate).mockResolvedValue({
        stock_quantity: 10,
        low_stock_threshold: 5,
        product_id: 101,
      });

      await expect(
        inventoryService.adjustStock(
          variationId,
          5,
          'stock_received',
          userId,
          undefined,
          undefined,
          branchId,
        ),
      ).rejects.toThrow('Unit cost is required');

      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should send low stock notification if stock falls below threshold', async () => {
      vi.mocked(inventoryRepository.findStockForUpdate).mockResolvedValue({
        stock_quantity: 10,
        low_stock_threshold: 5,
        product_id: 101,
      });
      vi.mocked(inventoryRepository.updateStockQuantity).mockResolvedValue({
        quantity: 4, // Below threshold 5
      });
      // Mock layers to avoid error in FIFO logic
      vi.mocked(inventoryRepository.findPurchaseLayers).mockResolvedValue([
        { id: 999, quantity_remaining: 100 },
      ]);

      await inventoryService.adjustStock(
        variationId,
        -6,
        'stock_dispatched',
        userId,
        undefined,
        undefined,
        branchId,
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/send/in-app'),
        expect.any(Object),
      );
    });

    it('should apply FIFO logic when decreasing stock', async () => {
      vi.mocked(inventoryRepository.findStockForUpdate).mockResolvedValue({
        stock_quantity: 10,
        low_stock_threshold: 5,
        product_id: 101,
      });
      vi.mocked(inventoryRepository.updateStockQuantity).mockResolvedValue({
        quantity: 0,
      });
      vi.mocked(inventoryRepository.findPurchaseLayers).mockResolvedValue([
        { id: 1001, quantity_remaining: 3 },
        { id: 1002, quantity_remaining: 7 },
      ]);

      await inventoryService.adjustStock(
        variationId,
        -10,
        'stock_dispatched',
        userId,
        undefined,
        undefined,
        branchId,
      );

      // Should consume 3 from layer 1001
      expect(inventoryRepository.decrementMovementRemaining).toHaveBeenCalledWith(
        1001,
        3,
        mockClient,
      );
      // Should consume 7 from layer 1002
      expect(inventoryRepository.decrementMovementRemaining).toHaveBeenCalledWith(
        1002,
        7,
        mockClient,
      );
    });

    it('should throw AppError if not enough stock layers for FIFO', async () => {
      vi.mocked(inventoryRepository.findStockForUpdate).mockResolvedValue({
        stock_quantity: 10,
        low_stock_threshold: 5,
        product_id: 101,
      });
      vi.mocked(inventoryRepository.updateStockQuantity).mockResolvedValue({
        quantity: 0,
      });
      vi.mocked(inventoryRepository.findPurchaseLayers).mockResolvedValue([
        { id: 1001, quantity_remaining: 5 }, // Only 5 avail
      ]);

      await expect(
        inventoryService.adjustStock(
          variationId,
          -10, // Need 10
          'stock_dispatched',
          userId,
          undefined,
          undefined,
          branchId,
        ),
      ).rejects.toThrow('Not enough stock layers');

      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should manage transaction correctly when dbClient is not provided', async () => {
      vi.mocked(inventoryRepository.findStockForUpdate).mockResolvedValue({
        stock_quantity: 10,
        low_stock_threshold: 5,
        product_id: 101,
      });
      vi.mocked(inventoryRepository.updateStockQuantity).mockResolvedValue({ quantity: 15 });

      await inventoryService.adjustStock(
        variationId,
        5,
        'stock_received',
        userId,
        undefined,
        10,
        branchId,
      );

      expect(mockConnect).toHaveBeenCalled();
      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should use provided dbClient and not manage transaction', async () => {
      const customMockClient = {
        query: vi.fn(),
        release: vi.fn(),
      } as any;

      vi.mocked(inventoryRepository.findStockForUpdate).mockResolvedValue({
        stock_quantity: 10,
        low_stock_threshold: 5,
        product_id: 101,
      });
      vi.mocked(inventoryRepository.updateStockQuantity).mockResolvedValue({ quantity: 15 });

      await inventoryService.adjustStock(
        variationId,
        5,
        'stock_received',
        userId,
        customMockClient,
        10,
        branchId,
      );

      expect(mockConnect).not.toHaveBeenCalled();
      expect(customMockClient.query).not.toHaveBeenCalledWith('BEGIN');
      expect(customMockClient.query).not.toHaveBeenCalledWith('COMMIT');

      // Repo calls should use customMockClient
      expect(inventoryRepository.findStockForUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        customMockClient,
      );
    });
  });

  describe('receiveStock', () => {
    const variationId = 1;
    const quantity = 5;
    const unitCost = 10;
    const userId = 'test-user-id';

    it('should call adjustStock with correct parameters', async () => {
      const adjustStockSpy = vi.spyOn(inventoryService, 'adjustStock');
      adjustStockSpy.mockResolvedValueOnce({ quantity: 15 });

      await inventoryService.receiveStock(variationId, quantity, unitCost, userId, undefined);

      expect(adjustStockSpy).toHaveBeenCalledWith(
        variationId,
        quantity,
        'stock_received',
        userId,
        undefined,
        unitCost,
      );
    });
  });

  describe('dispatchStock', () => {
    const variationId = 1;
    const quantity = 5;
    const userId = 'test-user-id';

    it('should call adjustStock with correct parameters', async () => {
      const adjustStockSpy = vi.spyOn(inventoryService, 'adjustStock');
      adjustStockSpy.mockResolvedValueOnce({ quantity: 5 });

      await inventoryService.dispatchStock(variationId, quantity, userId, undefined);

      expect(adjustStockSpy).toHaveBeenCalledWith(
        variationId,
        -quantity,
        'stock_dispatched',
        userId,
        undefined,
      );
    });
  });

  describe('getLowStockProducts', () => {
    it('should return products below threshold', async () => {
      const mockLowStockProducts = [
        { product_id: 1, name: 'Product A', stock_quantity: 3, low_stock_threshold: 5 },
      ];
      vi.mocked(inventoryRepository.findLowStockProducts).mockResolvedValue(mockLowStockProducts);

      const result = await inventoryService.getLowStockProducts(5);
      expect(result).toEqual(mockLowStockProducts);
      expect(inventoryRepository.findLowStockProducts).toHaveBeenCalledWith(5);
    });
  });

  describe('getInventoryDiscrepancies', () => {
    const branchId = 1;
    it('should return inventory discrepancies', async () => {
      const mockDiscrepancies = [{ product_name: 'Produto X', discrepancy: -2 } as any];
      vi.mocked(inventoryRepository.findDiscrepancies).mockResolvedValue(mockDiscrepancies);

      const result = await inventoryService.getInventoryDiscrepancies(branchId);
      expect(result).toEqual(mockDiscrepancies);
      expect(inventoryRepository.findDiscrepancies).toHaveBeenCalledWith(branchId);
    });
  });

  describe('suggestPurchaseOrders', () => {
    const branchId = 1;
    it('should suggest purchase orders', async () => {
      const mockProducts = [
        {
          product_id: 1,
          product_name: 'Product A',
          variation_id: 101,
          variation_color: 'Red',
          current_stock: 3,
          low_stock_threshold: 5,
          reorder_point: 5,
          lead_time_days: 7,
        },
      ];
      vi.mocked(inventoryRepository.findProductsBelowThreshold).mockResolvedValue(mockProducts);
      vi.mocked(demandPredictionService.predictDemand).mockResolvedValue(20);

      const result = await inventoryService.suggestPurchaseOrders(branchId);

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(1);
      expect(inventoryRepository.findProductsBelowThreshold).toHaveBeenCalledWith(branchId);
    });
  });
});
