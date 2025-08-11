const appointmentController = require('../../controllers/appointmentController');
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

describe('appointmentController', () => {
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
        service_type: 'Repair',
        appointment_date_time: '2025-08-20T14:00:00Z',
        notes: 'Urgent repair needed',
        technician_id: 2,
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

  describe('createAppointment', () => {
    it('should create an appointment successfully', async () => {
      const mockAppointment = { id: 1, ...mockReq.body };
      mockClient.query.mockResolvedValueOnce({ rows: [mockAppointment] }); // For INSERT query

      await appointmentController.createAppointment(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO appointments (customer_id, service_type, appointment_date_time, notes, technician_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
        [
          1,
          'Repair',
          '2025-08-20T14:00:00Z',
          'Urgent repair needed',
          2,
        ]
      );
      expect(activityLogger.logActivity).toHaveBeenCalledWith(
        'Test User',
        'Agendamento #1 criado para o cliente 1.',
        'appointment',
        1
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockAppointment);
    });

    it('should handle errors during appointment creation', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('DB Error'));

      await appointmentController.createAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      delete mockReq.body.customer_id;

      await appointmentController.createAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Dados do agendamento incompletos.' });
      expect(mockClient.query).not.toHaveBeenCalled();
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
    });
  });
});