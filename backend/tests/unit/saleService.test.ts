import { saleService } from '../../src/services/saleService.js';
import { vi } from 'vitest';
import { AppError } from '../../src/utils/errors.js';

// Mock ../db/index.js
const mockClientQuery = vi.fn(); // Global mock for client.query
const mockClientRelease = vi.fn();
const mockClientBegin = vi.fn();
const mockClientCommit = vi.fn();
const mockClientRollback = vi.fn();

const mockClient = {
  query: mockClientQuery,
  release: mockClientRelease,
  begin: mockClientBegin,
  commit: mockClientCommit,
  rollback: mockClientRollback,
};

vi.mock('../../src/db/index.js', () => {
  const mockQuery = vi.fn(); // For pool.query
  const mockPool = {
    query: mockQuery,
    connect: vi.fn(() => Promise.resolve(mockClient)), // Connect returns our global mockClient
  };

  return {
    __esModule: true,
    default: mockPool,
    query: mockQuery,
  };
});

// Mock AppError
vi.mock('../../src/utils/errors.js', () => ({
  AppError: vi.fn((message, statusCode) => {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  }),
}));

describe('saleService', () => {
  let mockedDb: any;
  let mockedAppError: any;

  beforeAll(async () => {
    // Dynamically import mocked modules
    mockedDb = vi.mocked(await import('../../src/db/index.js'));
    mockedAppError = vi.mocked(await import('../../src/utils/errors.js'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear specific mock implementations if needed for specific tests
    mockedDb.query.mockClear();
    mockedDb.default.query.mockClear(); // Clear mock for pool.query
    mockedDb.default.connect.mockClear(); // Clear mock for pool.connect

    // Clear mockClient's mocks
    mockClientQuery.mockClear();
    mockClientRelease.mockClear();
    mockClientBegin.mockClear();
    mockClientCommit.mockClear();
    mockClientRollback.mockClear();
  });

  describe('createSale', () => {
    const mockItems = [
      { product_id: 1, variation_id: 101, quantity: 2 },
      { product_id: 2, variation_id: 201, quantity: 1 },
    ];
    const mockProductVariation1 = { price: '10.00', stock_quantity: 5 };
    const mockProductVariation2 = { price: '20.00', stock_quantity: 3 };
    const mockSale = { id: 1, user_id: 1, total_amount: 40.00, sale_date: new Date() };

    it('should successfully create a sale with valid items', async () => {
      // Mock implementation based on query arguments
      mockClient.query.mockImplementation((query: string, values: any[]) => {
        if (query.includes('SELECT price, stock_quantity')) {
          if (values.includes(101)) return Promise.resolve({ rows: [mockProductVariation1] });
          if (values.includes(201)) return Promise.resolve({ rows: [mockProductVariation2] });
        }
        if (query.includes('INSERT INTO sales')) {
          return Promise.resolve({ rows: [mockSale] });
        }
        // Default mock for UPDATE, INSERT INTO sale_items, etc.
        return Promise.resolve({ rows: [] });
      });

      const result = await saleService.createSale(1, mockItems);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT price, stock_quantity FROM product_variations WHERE id = $1 AND product_id = $2;',
        [101, 1]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT price, stock_quantity FROM product_variations WHERE id = $1 AND product_id = $2;',
        [201, 2]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'UPDATE product_variations SET stock_quantity = stock_quantity - $1 WHERE id = $2;',
        [2, 101]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'UPDATE product_variations SET stock_quantity = stock_quantity - $1 WHERE id = $2;',
        [1, 201]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO sales (user_id, total_amount) VALUES ($1, $2) RETURNING id, sale_date;',
        [1, 40.00]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO sale_items (sale_id, product_id, variation_id, quantity, price_at_sale) VALUES ($1, $2, $3, $4, $5);',
        [mockSale.id, 1, 101, 2, 10.00]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO sale_items (sale_id, product_id, variation_id, quantity, price_at_sale) VALUES ($1, $2, $3, $4, $5);',
        [mockSale.id, 2, 201, 1, 20.00]
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
      expect(result.id).toBe(mockSale.id);
      expect(result.total_amount).toBe(40.00); // Corrected expected total amount
      expect(result.items.length).toBe(2);
    });

    it('should throw AppError if product variation not found', async () => {
      // Mock to return no rows for the first product variation check
      mockClient.query.mockImplementation((query: string) => {
        if (query.includes('SELECT price, stock_quantity')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      await expect(saleService.createSale(1, mockItems)).rejects.toThrow(expect.any(Error));
      expect(AppError).toHaveBeenCalledWith('Product variation 101 not found.', 404);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError if insufficient stock', async () => {
      // Mock to return insufficient stock for the first product
      mockClient.query.mockImplementation((query: string) => {
        if (query.includes('SELECT price, stock_quantity')) {
          return Promise.resolve({ rows: [{ price: '10.00', stock_quantity: 1 }] });
        }
        return Promise.resolve({ rows: [] });
      });

      await expect(saleService.createSale(1, mockItems)).rejects.toThrow(expect.any(Error));
      expect(AppError).toHaveBeenCalledWith('Insufficient stock for variation 101. Available: 1, Requested: 2', 400);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

    it('should rollback transaction on error', async () => {
      // Mock a generic database error
      mockClient.query.mockImplementation((query: string) => {
        if (query.includes('SELECT price, stock_quantity')) {
          return Promise.reject(new Error('DB Error'));
        }
        return Promise.resolve({ rows: [] });
      });

      await expect(saleService.createSale(1, mockItems)).rejects.toThrow('DB Error');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSaleById', () => {
    const mockSale = { id: 1, user_id: 1, total_amount: 50.00, sale_date: new Date() };
    const mockSaleItems = [
      { id: 1, sale_id: 1, product_id: 1, quantity: 2 },
      { id: 2, sale_id: 1, product_id: 2, quantity: 1 },
    ];

    it('should return sale data with items for a valid ID', async () => {
      mockedDb.query.mockResolvedValueOnce({ rows: [mockSale] });
      mockedDb.query.mockResolvedValueOnce({ rows: mockSaleItems });

      const sale = await saleService.getSaleById(1);

      expect(sale).toEqual({ ...mockSale, items: mockSaleItems });
      expect(mockedDb.query).toHaveBeenCalledWith('SELECT * FROM sales WHERE id = $1;', [1]);
      expect(mockedDb.query).toHaveBeenCalledWith('SELECT * FROM sale_items WHERE sale_id = $1;', [1]);
    });

    it('should return null if sale not found', async () => {
      mockedDb.query.mockResolvedValueOnce({ rows: [] });

      const sale = await saleService.getSaleById(999);

      expect(sale).toBeNull();
      expect(mockedDb.query).toHaveBeenCalledWith('SELECT * FROM sales WHERE id = $1;', [999]);
      expect(mockedDb.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllSales', () => {
    const mockSales = [
      { id: 1, total_amount: 100.00, sale_date: new Date() },
      { id: 2, total_amount: 200.00, sale_date: new Date() },
    ];

    it('should return a list of sales', async () => {
      mockedDb.query.mockResolvedValueOnce({ rows: mockSales });

      const sales = await saleService.getAllSales();

      expect(sales).toEqual(mockSales);
      expect(mockedDb.query).toHaveBeenCalledWith('SELECT * FROM sales ORDER BY sale_date DESC;');
    });

    it('should return an empty array if no sales are found', async () => {
      mockedDb.query.mockResolvedValueOnce({ rows: [] });

      const sales = await saleService.getAllSales();

      expect(sales).toEqual([]);
      expect(mockedDb.query).toHaveBeenCalledWith('SELECT * FROM sales ORDER BY sale_date DESC;');
    });
  });
});