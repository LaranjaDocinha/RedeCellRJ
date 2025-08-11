const giftCardController = require('../../controllers/giftCardController');
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

// Mock generateUniqueCode helper function
// We need to mock it within the same file context as it's not exported
// This is a bit tricky, usually you'd export helpers for easier testing
// For now, we'll mock db.query to control its behavior for generateUniqueCode
// A more robust solution would involve refactoring generateUniqueCode to be injectable or exported.

describe('giftCardController', () => {
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
        initial_value: 100,
        expiry_date: '2026-12-31',
        customer_id: 1,
      },
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock db.query for generateUniqueCode to always return a unique code
    db.query.mockResolvedValue({ rows: [] });
    activityLogger.logActivity.mockClear(); // Clear the mock before each test
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createGiftCard', () => {
    it('should create a gift card successfully', async () => {
      const mockGiftCard = {
        id: 1,
        code: 'TESTCODE',
        initial_value: 100,
        current_value: 100,
        expiry_date: '2026-12-31T00:00:00.000Z',
        customer_id: 1,
        created_by_user_id: 1,
      };
      mockClient.query.mockResolvedValueOnce({ rows: [mockGiftCard] }); // For gift_cards insert
      mockClient.query.mockResolvedValueOnce({}); // For gift_card_transactions insert
      mockClient.query.mockResolvedValueOnce({}); // For COMMIT

      await giftCardController.createGiftCard(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO gift_cards (code, initial_value, current_value, expiry_date, customer_id, created_by_user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
        [
          expect.any(String), // Code is generated
          100,
          100,
          '2026-12-31',
          1,
          1,
        ]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO gift_card_transactions (gift_card_id, transaction_type, amount, user_id, notes) VALUES ($1, $2, $3, $4, $5);',
        [1, 'issue', 100, 1, 'Emissão de vale-presente']
      );
      expect(activityLogger.logActivity).toHaveBeenCalledWith(
        'Test User',
        `Vale-presente #1 (Código: ${mockGiftCard.code}) criado com valor de R$100.`,
        'gift_card',
        1
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockGiftCard);
    });

    it('should handle errors during gift card creation', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('DB Error'));

      await giftCardController.createGiftCard(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
    });

    it('should return 400 if initial_value is invalid', async () => {
      mockReq.body.initial_value = 0;

      await giftCardController.createGiftCard(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Valor inicial inválido.' });
      expect(mockClient.query).not.toHaveBeenCalled(); // No DB interaction
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
    });
  });
});