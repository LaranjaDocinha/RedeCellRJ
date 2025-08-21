const cashFlowController = require('../../controllers/cashFlowController');
const db = require('../../db');
const activityLogger = require('../../utils/activityLogger'); // Import the actual module

// Mock the db module
jest.mock('../../db', () => ({
  query: jest.fn(),
}));

// Mock the entire module
jest.mock('../../utils/activityLogger');

describe('cashFlowController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      user: { name: 'Test User' },
      body: {
        projection_date: '2025-09-01',
        projected_inflow: 1000,
        projected_outflow: 500,
        notes: 'Monthly projection',
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

  describe('createProjection', () => {
    it('should create a cash flow projection successfully', async () => {
      mockReq.user = { id: 1, branch_id: 1 }; // Mock user for controller
      mockReq.body = {
        description: 'Monthly Projection',
        amount: 1000,
        type: 'inflow',
        projection_date: '2025-09-01',
        notes: 'Monthly projection notes',
      };
      const mockProjection = { id: 1, ...mockReq.body, user_id: 1, branch_id: 1 };
      db.query.mockResolvedValueOnce({ rows: [mockProjection] }); // For INSERT query

      await cashFlowController.createProjection(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO cash_flow_projections (description, amount, type, projection_date, notes, user_id, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;',
        ['Monthly Projection', 1000, 'inflow', '2025-09-01', 'Monthly projection notes', 1, 1]
      );
      expect(activityLogger.logActivity).toHaveBeenCalledWith(
        'Test User',
        'Projeção de fluxo de caixa para 2025-09-01 criada.',
        'cash_flow_projection',
        1
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Projeção criada com sucesso!', projection: mockProjection });
    });

    it('should handle errors during projection creation', async () => {
      mockReq.user = { id: 1, branch_id: 1 };
      mockReq.body = {
        description: 'Monthly Projection',
        amount: 1000,
        type: 'inflow',
        projection_date: '2025-09-01',
        notes: 'Monthly projection notes',
      };
      db.query.mockRejectedValueOnce(new Error('DB Error'));

      await expect(cashFlowController.createProjection(mockReq, mockRes)).rejects.toThrow(
        new AppError('Erro ao criar projeção.', 500)
      );

      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
    });

    
});