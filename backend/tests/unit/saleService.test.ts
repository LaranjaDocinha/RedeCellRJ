import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks do DB e Client
const mocks = vi.hoisted(() => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };
  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn(),
  };
  return { mockClient, mockPool };
});

vi.mock('../../src/db/index.js', () => ({
  default: mocks.mockPool,
  getPool: () => mocks.mockPool,
}));

// Mock Repositories
vi.mock('../../src/repositories/sale.repository.js', () => ({
  saleRepository: {
    create: vi.fn(),
    addItem: vi.fn(),
    addPayment: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
  },
}));

vi.mock('../../src/repositories/product.repository.js', () => ({
  productRepository: {
    findVariationWithStockForUpdate: vi.fn(),
    findSerializedItemForUpdate: vi.fn(),
    updateSerializedItemStatus: vi.fn(),
    logSerializedItemHistory: vi.fn(),
  },
}));

vi.mock('../../src/repositories/inventory.repository.js', () => ({
  inventoryRepository: {
    decreaseStock: vi.fn(),
  },
}));

// Mock external services
vi.mock('../../src/services/customerService.js', () => ({
  customerService: {
    getCustomerById: vi.fn(),
    deductStoreCredit: vi.fn(),
    addStoreCredit: vi.fn(),
  },
}));

vi.mock('../../src/services/activityFeedService.js', () => ({
  createActivity: vi.fn(),
}));

vi.mock('../../src/services/gamificationService.js', () => ({
  updateChallengeProgress: vi.fn(),
}));

vi.mock('../../src/services/gamificationEngine.js', () => ({
  gamificationEngine: {
    processSale: vi.fn(),
  },
}));

vi.mock('../../src/services/marketplaceSyncService.js', () => ({
  marketplaceSyncService: {
    updateStockOnSale: vi.fn(),
  },
}));

vi.mock('../../src/services/commissionService.js', () => ({
  commissionService: {
    calculateForSale: vi.fn().mockResolvedValue(undefined),
    calculateForOS: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../src/events/appEvents.js', () => ({
  default: {
    emit: vi.fn(),
  },
}));

import { saleService } from '../../src/services/saleService.js';
import { saleRepository } from '../../src/repositories/sale.repository.js';
import { productRepository } from '../../src/repositories/product.repository.js';
import { inventoryRepository } from '../../src/repositories/inventory.repository.js';

describe('SaleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('createSale', () => {
    const saleData = {
      customerId: '1',
      items: [{ product_id: 1, variation_id: 101, quantity: 2, unit_price: 10 }],
      payments: [{ method: 'cash', amount: 20 }],
      userId: '1',
    };

    it('should successfully create a sale', async () => {
      // Mock Variation Fetch
      vi.mocked(productRepository.findVariationWithStockForUpdate).mockResolvedValue({
        price: 10,
        stock_quantity: 10,
        cost_price: 5,
        is_serialized: false,
      });
      // Mock Sale Creation
      vi.mocked(saleRepository.create).mockResolvedValue({ id: 1, sale_date: new Date() } as any);

      const result = await saleService.createSale(saleData);

      expect(result).toBeDefined();
      expect(result.sale_id).toBe(1);

      // Check Transaction
      expect(mocks.mockPool.connect).toHaveBeenCalled();
      expect(mocks.mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mocks.mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mocks.mockClient.release).toHaveBeenCalled();

      // Check Repo Calls
      expect(productRepository.findVariationWithStockForUpdate).toHaveBeenCalledWith(
        101,
        1,
        mocks.mockClient,
      );
      expect(inventoryRepository.decreaseStock).toHaveBeenCalledWith(2, 101, 1, mocks.mockClient);
      expect(saleRepository.create).toHaveBeenCalled();
      expect(saleRepository.addItem).toHaveBeenCalled();
      expect(saleRepository.addPayment).toHaveBeenCalled();
    });

    it('should throw AppError if product variation not found', async () => {
      vi.mocked(productRepository.findVariationWithStockForUpdate).mockResolvedValue(null);

      await expect(saleService.createSale(saleData)).rejects.toThrow(
        'Product variation 101 not found',
      );
      expect(mocks.mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw AppError if insufficient stock', async () => {
      vi.mocked(productRepository.findVariationWithStockForUpdate).mockResolvedValue({
        price: 10,
        stock_quantity: 1,
        cost_price: 5,
        is_serialized: false, // Qty 1 < 2
      });

      await expect(saleService.createSale(saleData)).rejects.toThrow(
        'Insufficient stock for product variation 101',
      );
      expect(mocks.mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should handle serialized items correctly', async () => {
      const serializedSaleData = {
        ...saleData,
        items: [
          {
            product_id: 1,
            variation_id: 999,
            quantity: 1,
            unit_price: 100,
            serial_numbers: ['SN123'],
          },
        ],
        payments: [{ method: 'cash', amount: 100 }],
      };

      vi.mocked(productRepository.findVariationWithStockForUpdate).mockResolvedValue({
        price: 100,
        stock_quantity: 1,
        cost_price: 50,
        is_serialized: true,
      });
      vi.mocked(productRepository.findSerializedItemForUpdate).mockResolvedValue({
        id: 555,
        status: 'in_stock',
      });
      vi.mocked(saleRepository.create).mockResolvedValue({ id: 1, sale_date: new Date() } as any);

      await saleService.createSale(serializedSaleData);

      expect(productRepository.findSerializedItemForUpdate).toHaveBeenCalledWith(
        'SN123',
        999,
        1,
        mocks.mockClient,
      );
      expect(productRepository.updateSerializedItemStatus).toHaveBeenCalledWith(
        555,
        'sold',
        mocks.mockClient,
      );
      expect(productRepository.logSerializedItemHistory).toHaveBeenCalled();
    });
  });

  describe('getAllSales', () => {
    it('should return all sales ordered by date desc', async () => {
      const mockSales = [{ id: 1 }, { id: 2 }];
      vi.mocked(saleRepository.findAll).mockResolvedValue(mockSales as any);

      const sales = await saleService.getAllSales();

      expect(sales).toEqual(mockSales);
      expect(saleRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getSaleById', () => {
    it('should return sale with items and payments', async () => {
      const mockSale = { id: 1, total: 100, items: [], payments: [] };
      vi.mocked(saleRepository.findById).mockResolvedValue(mockSale as any);

      const result = await saleService.getSaleById(1);

      expect(result).toEqual(mockSale);
      expect(saleRepository.findById).toHaveBeenCalledWith(1);
    });
  });
});
