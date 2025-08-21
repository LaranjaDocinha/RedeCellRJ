const productController = require('../../controllers/productController');
const db = require('../../db');
const { redisClient } = require('../../db');
const { AppError } = require('../../utils/appError'); // Import AppError

// Mock the db and redisClient modules
jest.mock('../../db', () => ({
  query: jest.fn(),
  getClient: jest.fn(() => ({
    query: jest.fn(),
    release: jest.fn(),
  })),
  redisClient: {
    get: jest.fn(),
    setex: jest.fn(),
  },
}));

// Mock logActivity
jest.mock('../../utils/activityLogger', () => ({
  logActivity: jest.fn(),
}));

describe('productController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      query: {},
      user: { branch_id: 1 },
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

  describe('getAllProducts', () => {
    it('should return all products from cache if available', async () => {
      const cachedData = { products: [{ id: 1, name: 'Cached Product' }], total: 1 };
      redisClient.get.mockResolvedValueOnce(JSON.stringify(cachedData));

      await productController.getAllProducts(mockReq, mockRes);

      expect(redisClient.get).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(cachedData);
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should return all products from DB if cache is not available', async () => {
      redisClient.get.mockResolvedValueOnce(null);
      db.query.mockResolvedValueOnce({ rows: [{ count: '0' }] }); // For count query
      db.query.mockResolvedValueOnce({ rows: [] }); // For main query

      await productController.getAllProducts(mockReq, mockRes);

      expect(redisClient.get).toHaveBeenCalled();
      expect(db.query).toHaveBeenCalledTimes(2); // count and main query
      expect(mockRes.json).toHaveBeenCalledWith({ products: [], total: 0 });
      expect(redisClient.setex).toHaveBeenCalled();
    });

    it('should handle errors when fetching products', async () => {
      redisClient.get.mockResolvedValueOnce(null);
      db.query.mockRejectedValueOnce(new Error('DB Error'));

      await expect(productController.getAllProducts(mockReq, mockRes)).rejects.toThrow(
        new AppError('Erro ao listar produtos.', 500)
      );

      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.send).not.toHaveBeenCalled();
    });
  });
});