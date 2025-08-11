const repairController = require('../../controllers/repairController');
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

describe('repairController', () => {
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
        customer_id: 1,
        device_type: 'Smartphone',
        model: 'iPhone X',
        problem_description: 'Screen cracked',
        status: 'Diagnóstico',
        technician_id: 1,
        priority: 'Normal',
        expected_completion_date: '2025-08-15T10:00:00Z',
        serial_number: 'SN12345',
        accessories: 'Case',
        condition_on_receipt: 'Good',
        repair_actions: 'None',
        parts_cost: 0,
        labor_cost: 0,
        discount: 0,
        final_cost: 0,
        payment_status: 'Pending',
        notes: 'Customer wants quick repair',
        warranty_period_days: 90,
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

  describe('createRepair', () => {
    it('should create a repair order successfully', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // For INSERT query

      await repairController.createRepair(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO repairs (customer_id, user_id, device_type, model, problem_description, status, technician_id, priority, expected_completion_date, serial_number, accessories, condition_on_receipt, repair_actions, parts_cost, labor_cost, discount, final_cost, payment_status, notes, warranty_period_days) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *;',
        [
          1,
          1,
          'Smartphone',
          'iPhone X',
          'Screen cracked',
          'Diagnóstico',
          1,
          'Normal',
          '2025-08-15T10:00:00Z',
          'SN12345',
          'Case',
          'Good',
          'None',
          0,
          0,
          0,
          0,
          'Pending',
          'Customer wants quick repair',
          90,
        ]
      );
      expect(logActivity).toHaveBeenCalledWith(
        'Test User',
        'Nova ordem de reparo #1 criada.',
        'repair',
        1
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ id: 1 });
    });

    it('should handle errors during repair creation', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('DB Error'));

      await repairController.createRepair(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
      expect(logActivity).not.toHaveBeenCalled();
    });
  });
});