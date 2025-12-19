import { dashboardService } from '../../src/services/dashboardService.js';
import { vi } from 'vitest';
// Mock ../db/index.js
vi.mock('../../src/db/index.js', () => {
    const mockQuery = vi.fn();
    const mockClient = {
        query: vi.fn(),
        release: vi.fn(),
        begin: vi.fn(),
        commit: vi.fn(),
        rollback: vi.fn(),
    };
    const mockPool = {
        query: mockQuery,
        connect: vi.fn(() => Promise.resolve(mockClient)),
    };
    return {
        __esModule: true,
        default: mockPool,
        query: mockQuery,
    };
});
describe('dashboardService', () => {
    let mockedDb; // Declare mockedDb here
    beforeAll(async () => {
        // Dynamically import mocked modules
        mockedDb = vi.mocked(await import('../../src/db/index.js'));
    });
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear specific mock implementations if needed for specific tests
        mockedDb.query.mockClear();
        mockedDb.default.query.mockClear(); // Clear mock for pool.query
        mockedDb.default.connect.mockClear(); // Clear mock for pool.connect
    });
    describe('getTotalSalesAmount', () => {
        it('should return the total sales amount', async () => {
            mockedDb.query.mockResolvedValueOnce({ rows: [{ total_sales: '1234.56' }] });
            const totalSales = await dashboardService.getTotalSalesAmount();
            expect(totalSales).toBe(1234.56);
            expect(mockedDb.query).toHaveBeenCalledWith('SELECT COALESCE(SUM(total_amount), 0) AS total_sales FROM sales;');
        });
        it('should return 0 if no sales are found', async () => {
            mockedDb.query.mockResolvedValueOnce({ rows: [{ total_sales: '0' }] });
            const totalSales = await dashboardService.getTotalSalesAmount();
            expect(totalSales).toBe(0);
            expect(mockedDb.query).toHaveBeenCalledWith('SELECT COALESCE(SUM(total_amount), 0) AS total_sales FROM sales;');
        });
    });
    describe('getSalesByMonth', () => {
        it('should return monthly sales data', async () => {
            const mockMonthlySales = [
                { month: '2023-01', monthly_sales: '100.00' },
                { month: '2023-02', monthly_sales: '200.50' },
            ];
            mockedDb.query.mockResolvedValueOnce({ rows: mockMonthlySales });
            const salesByMonth = await dashboardService.getSalesByMonth();
            expect(salesByMonth).toEqual([
                { month: '2023-01', monthly_sales: 100.0 },
                { month: '2023-02', monthly_sales: 200.5 },
            ]);
            expect(mockedDb.query).toHaveBeenCalledWith(`SELECT
        TO_CHAR(sale_date, 'YYYY-MM') AS month,
        COALESCE(SUM(total_amount), 0) AS monthly_sales
      FROM sales
      GROUP BY month
      ORDER BY month ASC;`);
        });
        it('should return an empty array if no sales are found', async () => {
            mockedDb.query.mockResolvedValueOnce({ rows: [] });
            const salesByMonth = await dashboardService.getSalesByMonth();
            expect(salesByMonth).toEqual([]);
            expect(mockedDb.query).toHaveBeenCalledWith(`SELECT
        TO_CHAR(sale_date, 'YYYY-MM') AS month,
        COALESCE(SUM(total_amount), 0) AS monthly_sales
      FROM sales
      GROUP BY month
      ORDER BY month ASC;`);
        });
    });
    describe('getTopSellingProducts', () => {
        it('should return top-selling products', async () => {
            const mockTopProducts = [
                { product_name: 'Product X', variation_color: 'Red', total_quantity_sold: '100' },
                { product_name: 'Product Y', variation_color: 'Blue', total_quantity_sold: '50' },
            ];
            mockedDb.query.mockResolvedValueOnce({ rows: mockTopProducts });
            const topProducts = await dashboardService.getTopSellingProducts();
            expect(topProducts).toEqual([
                { product_name: 'Product X', variation_color: 'Red', total_quantity_sold: 100 },
                { product_name: 'Product Y', variation_color: 'Blue', total_quantity_sold: 50 },
            ]);
            expect(mockedDb.query).toHaveBeenCalledWith(`SELECT
        p.name AS product_name,
        pv.color AS variation_color,
        SUM(si.quantity) AS total_quantity_sold
      FROM sale_items si
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      GROUP BY p.name, pv.color
      ORDER BY total_quantity_sold DESC
      LIMIT $1;`, [5]);
        });
        it('should return an empty array if no products are found', async () => {
            mockedDb.query.mockResolvedValueOnce({ rows: [] });
            const topProducts = await dashboardService.getTopSellingProducts();
            expect(topProducts).toEqual([]);
            expect(mockedDb.query).toHaveBeenCalledWith(`SELECT
        p.name AS product_name,
        pv.color AS variation_color,
        SUM(si.quantity) AS total_quantity_sold
      FROM sale_items si
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      GROUP BY p.name, pv.color
      ORDER BY total_quantity_sold DESC
      LIMIT $1;`, [5]);
        });
        it('should use the provided limit', async () => {
            const mockTopProducts = [
                { product_name: 'Product Z', variation_color: 'Green', total_quantity_sold: '200' },
            ];
            mockedDb.query.mockResolvedValueOnce({ rows: mockTopProducts });
            const topProducts = await dashboardService.getTopSellingProducts(1);
            expect(topProducts).toEqual([
                { product_name: 'Product Z', variation_color: 'Green', total_quantity_sold: 200 },
            ]);
            expect(mockedDb.query).toHaveBeenCalledWith(`SELECT
        p.name AS product_name,
        pv.color AS variation_color,
        SUM(si.quantity) AS total_quantity_sold
      FROM sale_items si
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      GROUP BY p.name, pv.color
      ORDER BY total_quantity_sold DESC
      LIMIT $1;`, [1]);
        });
    });
});
