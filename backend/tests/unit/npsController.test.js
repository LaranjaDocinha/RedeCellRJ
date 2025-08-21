const npsController = require('../../controllers/npsController');
const db = require('../../db');
const activityLogger = require('../../utils/activityLogger'); // Import the actual module

// Mock the db module
jest.mock('../../db', () => ({
  query: jest.fn(),
}));

// Mock the entire module
jest.mock('../../utils/activityLogger');

describe('npsController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      user: { name: 'Test User' },
      body: {
        customer_id: 1,
        score: 9,
        feedback_text: 'Great service!',
        source: 'Email',
        related_sale_id: 101,
        related_repair_id: null,
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

  describe('createNpsSurvey', () => {
    it('should submit an NPS survey successfully', async () => {
      const mockSurvey = { id: 1, ...mockReq.body };
      db.query.mockResolvedValueOnce({ rows: [mockSurvey] }); // For INSERT query

      await npsController.createNpsSurvey(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO nps_surveys (customer_id, score, feedback_text, source, related_sale_id, related_repair_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
        [1, 9, 'Great service!', 'Email', 101, null]
      );
      expect(activityLogger.logActivity).toHaveBeenCalledWith(
        'Test User',
        'Pesquisa NPS #1 submetida pelo cliente 1 com pontuação 9.',
        'nps_survey',
        1
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockSurvey);
    });

    it('should handle errors during survey submission', async () => {
      db.query.mockRejectedValueOnce(new Error('DB Error'));

      await npsController.createNpsSurvey(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing or invalid', async () => {
      delete mockReq.body.customer_id; // Missing customer_id

      await npsController.createNpsSurvey(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro ao criar pesquisa NPS.' });
      expect(db.query).not.toHaveBeenCalled();
      expect(activityLogger.logActivity).not.toHaveBeenCalled();

      mockReq.body.customer_id = 1;
      mockReq.body.score = 11; // Invalid score

      await npsController.createNpsSurvey(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro ao criar pesquisa NPS.' });
      expect(db.query).not.toHaveBeenCalled();
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
    });
  });
});