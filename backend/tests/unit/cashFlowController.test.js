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

  describe('createCashFlowProjection', () => {
    it('should create a cash flow projection successfully', async () => {
      const mockProjection = { id: 1, ...mockReq.body };
      db.query.mockResolvedValueOnce({ rows: [mockProjection] }); // For INSERT query

      await cashFlowController.createCashFlowProjection(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO cash_flow_projections (projection_date, projected_inflow, projected_outflow, notes) VALUES ($1, $2, $3, $4) RETURNING *;',
        ['2025-09-01', 1000, 500, 'Monthly projection']
      );
      expect(activityLogger.logActivity).toHaveBeenCalledWith(
        'Test User',
        'Projeção de fluxo de caixa para 2025-09-01 criada.',
        'cash_flow_projection',
        1
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockProjection);
    });

    it('should handle errors during projection creation', async () => {
      db.query.mockRejectedValueOnce(new Error('DB Error'));

      await cashFlowController.createCashFlowProjection(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      delete mockReq.body.projection_date;

      await cashFlowController.createCashFlowProjection(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Dados da projeção incompletos.' });
      expect(db.query).not.toHaveBeenCalled();
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
    });
  });
});