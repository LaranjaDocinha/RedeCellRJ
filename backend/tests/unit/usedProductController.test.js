const usedProductController = require('../../controllers/usedProductController');
const db = require('../../db');
const activityLogger = require('../../utils/activityLogger'); // Import the actual module

jest.mock('../../db', () => ({
  query: jest.fn(),
  getClient: jest.fn(() => ({
    query: jest.fn(),
    release: jest.fn(),
  })),
}));

// Mock the entire module
jest.mock('../../utils/activityLogger');

describe('usedProductController', () => {
  let mockReq;
  let mockRes;
  let mockClient;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    db.getClient.mockResolvedValue(mockClient);

    mockReq = {
      user: { id: 1, name: 'Test User' },
      body: {
        product_name: 'Used Smartphone',
        description: 'Good condition',
        category_id: 1,
        serial_number: 'USED12345',
        condition: 'Boa',
        acquisition_price: 200,
        sale_price: 300,
        current_stock: 1,
        branch_id: 1,
      },
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    activityLogger.logActivity.mockClear(); // Clear the mock before each test
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUsedProduct', () => {
    it('should create a used product successfully with initial stock', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // For used_products insert
      mockClient.query.mockResolvedValueOnce({}); // For used_product_transactions insert
      mockClient.query.mockResolvedValueOnce({}); // For COMMIT

      await usedProductController.createUsedProduct(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO used_products (product_name, description, category_id, serial_number, condition, acquisition_price, sale_price, current_stock, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;',
        [
          'Used Smartphone',
          'Good condition',
          1,
          'USED12345',
          'Boa',
          200,
          300,
          1,
          1,
        ]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO used_product_transactions (used_product_id, transaction_type, quantity, price, user_id, notes) VALUES ($1, $2, $3, $4, $5, $6);',
        [1, 'initial_stock', 1, 200, 1, 'Estoque inicial na criação do produto']
      );
      expect(activityLogger.logActivity).toHaveBeenCalledWith(
        'Test User',
        'Produto seminovo #1 (Used Smartphone) criado.',
        'used_product',
        1
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ id: 1 });
    });

    it('should create a used product successfully without initial stock', async () => {
      mockReq.body.current_stock = 0;
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // For used_products insert
      mockClient.query.mockResolvedValueOnce({}); // For COMMIT

      await usedProductController.createUsedProduct(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO used_products (product_name, description, category_id, serial_number, condition, acquisition_price, sale_price, current_stock, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;',
        [
          'Used Smartphone',
          'Good condition',
          1,
          'USED12345',
          'Boa',
          200,
          300,
          0,
          1,
        ]
      );
      expect(mockClient.query).not.toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO used_product_transactions')
      );
      expect(activityLogger.logActivity).toHaveBeenCalledWith(
        'Test User',
        'Produto seminovo #1 (Used Smartphone) criado.',
        'used_product',
        1
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ id: 1 });
    });

    it('should handle errors during used product creation', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('DB Error'));

      await usedProductController.createUsedProduct(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
    });
  });
});