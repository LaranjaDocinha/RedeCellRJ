const bankReconciliationController = require('../../controllers/bankReconciliationController');
const db = require('../../db');
const activityLogger = require('../../utils/activityLogger'); // Import the actual module

// Mock the db module
jest.mock('../../db', () => ({
  query: jest.fn(),
  getClient: jest.fn(() => ({
    query: jest.fn(),
    release: jest.fn(),
  })),
}));

// Mock the entire module
jest.mock('../../utils/activityLogger');

// Mock csv, fs, multer for importBankTransactions
jest.mock('csv-parser', () => jest.fn());
jest.mock('fs', () => ({
  createReadStream: jest.fn(),
  unlink: jest.fn((path, cb) => cb()), // Mock unlink to prevent actual file deletion
}));
jest.mock('multer', () => {
  const multer = jest.fn(() => ({
    single: jest.fn(() => (req, res, next) => {
      req.file = { path: 'mock/path/to/file.csv' }; // Mock a file for testing
      next();
    }),
  }));
  multer.diskStorage = jest.fn(() => jest.fn());
  return multer;
});

describe('bankReconciliationController', () => {
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
      user: { name: 'Test User' },
      body: {
        name: 'Main Checking',
        bank_name: 'Bank of Mock',
        account_number: '123456789',
        initial_balance: 1000.00,
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

  describe('createBankAccount', () => {
    it('should create a bank account successfully', async () => {
      const mockAccount = { id: 1, ...mockReq.body, current_balance: mockReq.body.initial_balance };
      mockClient.query.mockResolvedValueOnce({ rows: [mockAccount] }); // For INSERT query

      await bankReconciliationController.createBankAccount(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO bank_accounts (name, bank_name, account_number, initial_balance, current_balance) VALUES ($1, $2, $3, $4, $4) RETURNING *;',
        ['Main Checking', 'Bank of Mock', '123456789', 1000.00]
      );
      expect(activityLogger.logActivity).toHaveBeenCalledWith(
        'Test User',
        'Conta bancária #1 (Main Checking) criada.',
        'bank_account',
        1
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockAccount);
    });

    it('should handle errors during bank account creation', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('DB Error'));

      await bankReconciliationController.createBankAccount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      delete mockReq.body.name;

      await bankReconciliationController.createBankAccount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Dados da conta bancária incompletos.' });
      expect(mockClient.query).not.toHaveBeenCalled();
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
    });
  });
});