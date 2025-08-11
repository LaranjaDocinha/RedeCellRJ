const reportController = require('../../controllers/reportController');
const db = require('../../db');

// Mock the db module
jest.mock('../../db', () => ({
  query: jest.fn(),
}));

describe('reportController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      query: {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      },
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSalesReport', () => {
    it('should return sales report successfully', async () => {
      const mockSalesData = [
        {
          sale_id: 1,
          sale_date: '2025-01-15T10:00:00Z',
          total_amount: 100,
          payment_method: 'Cash',
          user_name: 'User A',
          customer_name: 'Customer X',
          product_name: 'Product 1',
          quantity: 1,
          price_at_sale: 100,
          cost_at_sale: 50,
        },
      ];
      db.query.mockResolvedValueOnce({ rows: mockSalesData });

      await reportController.getSalesReport(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['2025-01-01', '2025-01-31']
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockSalesData);
    });

    it('should handle errors when generating sales report', async () => {
      db.query.mockRejectedValueOnce(new Error('DB Error'));

      await reportController.getSalesReport(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor.' });
    });
  });
});