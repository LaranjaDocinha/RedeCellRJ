const repairController = require('../../controllers/repairController');
const db = require('../../db');
const { AppError } = require('../../utils/appError'); // Import AppError

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
  let mockNext;
  let mockClient;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    db.getClient.mockResolvedValue(mockClient);

    mockReq = {
      user: { id: 1, name: 'Test User', branch_id: 1 }, // Added branch_id
      body: {
        customer_id: 1,
        device_type: 'Smartphone',
        brand: 'Apple', // Added brand
        model: 'iPhone X',
        imei_serial: 'IMEI12345', // Added imei_serial
        problem_description: 'Screen cracked',
        status: 'Diagnóstico',
        priority: 'Normal',
        service_cost: 50.00, // Added service_cost
        parts_cost: 100.00, // Added parts_cost
        final_cost: 150.00, // Added final_cost
        tags: ['tela', 'quebrada'], // Added tags
        technician_id: 1,
        start_date: '2025-08-10T10:00:00Z', // Added start_date
        expected_completion_date: '2025-08-15T10:00:00Z',
        warranty_period_days: 90,
        warranty_start_date: '2025-08-10T10:00:00Z', // Added warranty_start_date
        warranty_end_date: '2025-11-08T10:00:00Z', // Added warranty_end_date
        quotation_signature_url: 'http://example.com/quote.png', // Added quotation_signature_url
        handover_signature_url: 'http://example.com/handover.png', // Added handover_signature_url
      },
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockNext = jest.fn(); // Mock the next function
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRepair', () => {
    it('should create a repair order successfully', async () => {
      const mockRepair = { id: 1, ...mockReq.body, user_id: mockReq.user.id, branch_id: mockReq.user.branch_id };
      mockClient.query.mockResolvedValueOnce({ rows: [mockRepair] }); // For INSERT query

      await repairController.createRepair(mockReq, mockRes, mockNext); // Pass mockNext

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO repairs (customer_id, user_id, device_type, brand, model, imei_serial, problem_description, status, priority, service_cost, parts_cost, final_cost, tags, technician_id, start_date, expected_completion_date, warranty_period_days, warranty_start_date, warranty_end_date, quotation_signature_url, handover_signature_url, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *;',
        [
          1,
          1,
          'Smartphone',
          'Apple',
          'iPhone X',
          'IMEI12345',
          'Screen cracked',
          'Diagnóstico',
          'Normal',
          50.00,
          100.00,
          150.00,
          ['tela', 'quebrada'],
          1,
          '2025-08-10T10:00:00Z',
          '2025-08-15T10:00:00Z',
          90,
          '2025-08-10T10:00:00Z',
          '2025-11-08T10:00:00Z',
          'http://example.com/quote.png',
          'http://example.com/handover.png',
          1,
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
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Ordem de reparo criada com sucesso!', repair: mockRepair });
      expect(mockNext).not.toHaveBeenCalled(); // Ensure next is not called on success
    });

    it('should handle errors during repair creation', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('DB Error'));

      await repairController.createRepair(mockReq, mockRes, mockNext); // Pass mockNext

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockNext).toHaveBeenCalledWith(new AppError('Erro ao criar ordem de reparo.', 500)); // Expect next to be called with AppError
      expect(mockRes.status).not.toHaveBeenCalled(); // Ensure res.status is not called
      expect(mockRes.json).not.toHaveBeenCalled(); // Ensure res.json is not called
      expect(logActivity).not.toHaveBeenCalled();
    });
  });
});