import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saleService } from '../../src/services/saleService.js';
import { getPool } from '../../src/db/index.js';
import { AppError } from '../../src/utils/errors.js';

// Mocks
vi.mock('../../src/db/index.js', () => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };
  const mockPool = {
    connect: vi.fn(() => Promise.resolve(mockClient)),
    query: vi.fn(),
  };
  return {
    getPool: vi.fn(() => mockPool),
  };
});

// Mock external services used in createSale
vi.mock('../../src/services/customerService.js', () => ({
  customerService: {
    getCustomerById: vi.fn(),
    deductStoreCredit: vi.fn(),
    addStoreCredit: vi.fn(),
  }
}));

vi.mock('../../src/services/activityFeedService.js', () => ({
  createActivity: vi.fn(),
}));

vi.mock('../../src/services/gamificationService.js', () => ({
  updateChallengeProgress: vi.fn(),
}));

vi.mock('../../src/services/marketplaceSyncService.js', () => ({
  updateStockOnSale: vi.fn(),
}));

// Mock appEvents
vi.mock('../../src/events/appEvents.js', () => ({
  default: {
    emit: vi.fn(),
  },
}));

describe('SaleService', () => {
  let mockClient: any;
  let mockPoolQuery: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const pool = getPool();
    mockPoolQuery = pool.query;
    mockPoolQuery.mockReset();
    // Access the mock client returned by connect
    pool.connect().then((c: any) => {
      mockClient = c;
    });
  });

  describe('createSale', () => {
    const saleData = {
      customerId: '1',
      items: [
        { product_id: 1, variation_id: 101, quantity: 2, unit_price: 10 },
        { product_id: 2, variation_id: 201, quantity: 1, unit_price: 20 },
      ],
      payments: [{ method: 'cash', amount: 40 }], // Total 40 matches items (2*10 + 1*20)
      userId: '1',
    };

    it('should successfully create a sale', async () => {
      const pool = getPool();
      const client = await pool.connect(); // Get the mock client instance

      // Mock query responses in sequence for createSale transaction
      client.query
        .mockResolvedValueOnce({}) // BEGIN
        // Item 1: Select variation
        .mockResolvedValueOnce({
          rows: [{ price: 10, stock_quantity: 10, cost_price: 5, is_serialized: false }],
        })
        // Item 1: Update stock
        .mockResolvedValueOnce({})
        // Item 2: Select variation
        .mockResolvedValueOnce({
          rows: [{ price: 20, stock_quantity: 5, cost_price: 10, is_serialized: false }],
        })
        // Item 2: Update stock
        .mockResolvedValueOnce({})
        // Insert Sale
        .mockResolvedValueOnce({ rows: [{ id: 1, sale_date: new Date() }] })
        // Insert Sale Items (loop)
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        // Insert Payments (loop)
        .mockResolvedValueOnce({})
        // COMMIT
        .mockResolvedValueOnce({});

      const result = await saleService.createSale(saleData);

      expect(result).toBeDefined();
      expect(result.sale_id).toBe(1);
      expect(result.total_amount).toBe(40);
      expect(client.query).toHaveBeenCalledWith('BEGIN');
      expect(client.query).toHaveBeenCalledWith('COMMIT');
      expect(client.release).toHaveBeenCalled();
    });

    it('should throw AppError if product variation not found', async () => {
      const pool = getPool();
      const client = await pool.connect();

      client.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [] }); // Select variation returns empty

      await expect(saleService.createSale(saleData)).rejects.toThrow(
        'Product variation 101 not found',
      );
      expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw AppError if insufficient stock', async () => {
      const pool = getPool();
      const client = await pool.connect();

      client.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ price: 10, stock_quantity: 1, cost_price: 5, is_serialized: false }], // Qty 1 < Requested 2
        });

      await expect(saleService.createSale(saleData)).rejects.toThrow(
        'Insufficient stock for product variation 101',
      );
      expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('getAllSales', () => {
    it('should return all sales ordered by date desc', async () => {
      const mockSales = [{ id: 1 }, { id: 2 }];
      mockPoolQuery.mockResolvedValueOnce({ rows: mockSales });

      const sales = await saleService.getAllSales();
      
      expect(sales).toEqual(mockSales);
      expect(mockPoolQuery).toHaveBeenCalledWith('SELECT * FROM sales ORDER BY sale_date DESC');
    });
  });

  describe('getSaleById', () => {
    it('should return sale with items and payments', async () => {
      const mockSale = { id: 1, total: 100 };
      const mockItems = [{ id: 1, product_id: 1 }];
      const mockPayments = [{ id: 1, amount: 100 }];

      mockPoolQuery
        .mockResolvedValueOnce({ rows: [mockSale] }) // Sale query
        .mockResolvedValueOnce({ rows: mockItems }) // Items query
        .mockResolvedValueOnce({ rows: mockPayments }); // Payments query

      const result = await saleService.getSaleById(1);

      expect(result).toEqual({
        ...mockSale,
        items: mockItems,
        payments: mockPayments,
      });
    });

    it('should return null if sale not found', async () => {
      mockPoolQuery.mockResolvedValueOnce({ rows: [] });

      const result = await saleService.getSaleById(999);

      expect(result).toBeNull();
    });
  });
});