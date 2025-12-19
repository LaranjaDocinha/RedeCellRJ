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
        getPool: vi.fn(() => mockPool),
        default: mockPool,
    };
});
// Mock AppError
vi.mock('../../src/utils/errors.js', () => ({
    AppError: vi.fn((message, statusCode) => {
        const error = new Error(message);
        error.statusCode = statusCode;
        return error;
    }),
}));
describe('saleService', () => {
    let mockedDb;
    let mockedAppError;
    beforeAll(async () => {
        // Dynamically import mocked modules
        mockedDb = vi.mocked(await import('../../src/db/index.js'));
        mockedAppError = vi.mocked(await import('../../src/utils/errors.js'));
    });
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear specific mock implementations if needed for specific tests
        mockedDb.getPool().query.mockClear();
        mockedDb.getPool().connect.mockClear(); // Clear mock for pool.connect
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
        const mockSale = { id: 1, user_id: 1, total_amount: 40.0, sale_date: new Date() };
        it('should successfully create a sale with valid items', async () => {
            mockClientQuery.mockImplementation((query, values) => {
                if (query.startsWith('SELECT price, stock_quantity')) {
                    if (values[0] === 101)
                        return Promise.resolve({ rows: [mockProductVariation1] });
                    if (values[0] === 201)
                        return Promise.resolve({ rows: [mockProductVariation2] });
                }
                if (query.startsWith('INSERT INTO sales')) {
                    return Promise.resolve({ rows: [mockSale] });
                }
                return Promise.resolve({ rows: [] });
            });
            const result = await saleService.createSale({
                customerId: 1,
                items: mockItems,
                payments: [{ method: 'cash', amount: 40.0 }],
                userId: '1',
            });
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(mockClient.release).toHaveBeenCalledTimes(1);
            expect(result.id).toBe(mockSale.id);
            expect(result.total_amount).toBe(40.0);
            expect(result.items.length).toBe(2);
        });
        it('should throw AppError if product variation not found', async () => {
            mockClientQuery.mockImplementation((query, values) => {
                if (query.startsWith('SELECT price, stock_quantity')) {
                    if (values[0] === 101)
                        return Promise.resolve({ rows: [] }); // Not found
                    if (values[0] === 201)
                        return Promise.resolve({ rows: [mockProductVariation2] });
                }
                return Promise.resolve({ rows: [] });
            });
            await expect(saleService.createSale({ customerId: 1, items: mockItems, payments: [], userId: '1' })).rejects.toThrow('Product variation 101 not found');
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalledTimes(1);
        });
        it('should throw AppError if insufficient stock', async () => {
            // Mock to return insufficient stock for the first product
            mockClient.query.mockImplementation((query) => {
                if (query.includes('SELECT price, stock_quantity')) {
                    return Promise.resolve({ rows: [{ price: '10.00', stock_quantity: 1 }] });
                }
                return Promise.resolve({ rows: [] });
            });
            await expect(saleService.createSale({ customerId: 1, items: mockItems, payments: [], userId: '1' })).rejects.toThrow(new AppError('Insufficient stock for product variation 101', 400));
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalledTimes(1);
        });
        it('should rollback transaction on error', async () => {
            // Mock a generic database error
            mockClient.query.mockImplementation((query) => {
                if (query.includes('SELECT price, stock_quantity')) {
                    return Promise.reject(new Error('DB Error'));
                }
                return Promise.resolve({ rows: [] });
            });
            await expect(saleService.createSale({ customerId: 1, items: mockItems, payments: [], userId: '1' })).rejects.toThrow('DB Error');
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalledTimes(1);
        });
    });
    describe('getSaleById', () => {
        const mockSale = { id: 1, user_id: 1, total_amount: 50.0, sale_date: new Date() };
        const mockSaleItems = [
            { id: 1, sale_id: 1, product_id: 1, quantity: 2 },
            { id: 2, sale_id: 1, product_id: 2, quantity: 1 },
        ];
        it('should return sale data with items for a valid ID', async () => {
            mockedDb.getPool().query.mockResolvedValueOnce({ rows: [mockSale], rowCount: 1 });
            mockedDb.getPool().query.mockResolvedValueOnce({ rows: mockSaleItems });
            const sale = await saleService.getSaleById(1);
            expect(sale).toEqual({ ...mockSale, items: mockSaleItems });
            expect(mockedDb.getPool().query).toHaveBeenCalledWith('SELECT * FROM sales WHERE id = $1', [
                1,
            ]);
            expect(mockedDb.getPool().query).toHaveBeenCalledWith('SELECT * FROM sale_items WHERE sale_id = $1', [1]);
        });
        it('should return undefined if sale not found', async () => {
            mockedDb.getPool().query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
            const sale = await saleService.getSaleById(999);
            expect(sale).toBeUndefined();
            expect(mockedDb.getPool().query).toHaveBeenCalledWith('SELECT * FROM sales WHERE id = $1', [
                999,
            ]);
            expect(mockedDb.getPool().query).toHaveBeenCalledTimes(1);
        });
    });
    describe('getAllSales', () => {
        const mockSales = [
            { id: 1, total_amount: 100.0, sale_date: new Date() },
            { id: 2, total_amount: 200.0, sale_date: new Date() },
        ];
        it('should return a list of sales', async () => {
            mockedDb.getPool().query.mockResolvedValueOnce({ rows: mockSales });
            const sales = await saleService.getAllSales();
            expect(sales).toEqual(mockSales);
            expect(mockedDb.getPool().query).toHaveBeenCalledWith('SELECT * FROM sales ORDER BY created_at DESC');
        });
        it('should return an empty array if no sales are found', async () => {
            mockedDb.getPool().query.mockResolvedValueOnce({ rows: [] });
            const sales = await saleService.getAllSales();
            expect(sales).toEqual([]);
            expect(mockedDb.getPool().query).toHaveBeenCalledWith('SELECT * FROM sales ORDER BY created_at DESC');
        });
    });
});
