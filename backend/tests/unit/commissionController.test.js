const commissionController = require('../../controllers/commissionController');
const db = require('../../db');

// Mock the db module
jest.mock('../../db', () => ({
  query: jest.fn(),
  getClient: jest.fn(() => ({
    query: jest.fn(),
    release: jest.fn(),
  })),
}));

// Mock logActivity
jest.mock('../../utils/activityLogger', () => ({
  logActivity: jest.fn(),
}));

describe('commissionController', () => {
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
        role_id: 1,
        commission_type: 'percentage_of_sale',
        value: 0.05,
        applies_to: 'sales',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
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

  describe('createCommissionRule', () => {
    it('should create a commission rule successfully', async () => {
      const mockRule = { id: 1, ...mockReq.body };
      mockClient.query.mockResolvedValueOnce({ rows: [mockRule] }); // For INSERT query

      await commissionController.createCommissionRule(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO commission_rules (role_id, commission_type, value, applies_to, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
        [1, 'percentage_of_sale', 0.05, 'sales', '2025-01-01', '2025-12-31']
      );
      expect(logActivity).toHaveBeenCalledWith(
        'Test User',
        'Regra de comissão #1 criada para o papel 1.',
        'commission_rule',
        1
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockRule);
    });

    it('should handle errors during commission rule creation', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('DB Error'));

      await commissionController.createCommissionRule(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
      expect(logActivity).not.toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      delete mockReq.body.role_id;

      await commissionController.createCommissionRule(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Dados da regra de comissão incompletos.' });
      expect(mockClient.query).not.toHaveBeenCalled();
      expect(logActivity).not.toHaveBeenCalled();
    });
  });
});