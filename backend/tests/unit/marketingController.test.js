const marketingController = require('../../controllers/marketingController');
const db = require('../../db');
const { sendEmail } = require('../../utils/emailService');
const { sendSms } = require('../../utils/smsService');
const activityLogger = require('../../utils/activityLogger'); // Import the actual module

jest.mock('../../db', () => ({
  query: jest.fn(),
  getClient: jest.fn(() => ({
    query: jest.fn(),
    release: jest.fn(),
  })),
}));

// Mock the entire module
jest.mock('../../utils/activityLogger');

// Mock emailService and smsService
jest.mock('../../utils/emailService', () => ({
  sendEmail: jest.fn(),
}));
jest.mock('../../utils/smsService', () => ({
  sendSms: jest.fn(),
}));

describe('marketingController', () => {
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
        name: 'Summer Sale',
        type: 'Email',
        message_template: 'Hello, check out our summer sale!',
        scheduled_date_time: '2025-07-01T10:00:00Z',
      },
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    activityLogger.logActivity.mockClear(); // Clear the mock before each test
    sendEmail.mockClear();
    sendSms.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMarketingCampaign', () => {
    it('should create a marketing campaign successfully', async () => {
      const mockCampaign = { id: 1, ...mockReq.body };
      mockClient.query.mockResolvedValueOnce({ rows: [mockCampaign] }); // For INSERT query

      await marketingController.createMarketingCampaign(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO marketing_campaigns (name, type, segmentation_criteria, message_template, scheduled_date_time, created_by_user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
        [
          'Summer Sale',
          'Email',
          null,
          'Hello, check out our summer sale!',
          '2025-07-01T10:00:00Z',
          1,
        ]
      );
      expect(activityLogger.logActivity).toHaveBeenCalledWith(
        'Test User',
        'Campanha de marketing #1 (Summer Sale) criada.',
        'marketing_campaign',
        1
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockCampaign);
    });

    it('should handle errors during campaign creation', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('DB Error'));

      await marketingController.createMarketingCampaign(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      delete mockReq.body.name;

      await marketingController.createMarketingCampaign(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Nome, tipo e template da mensagem são obrigatórios.' });
      expect(mockClient.query).not.toHaveBeenCalled();
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
    });
  });

  describe('sendMarketingCampaign', () => {
    it('should send email campaign successfully', async () => {
      const mockCampaign = { id: 1, name: 'Email Campaign', type: 'Email', message_template: 'Test Email' };
      const mockCustomers = [{ id: 1, name: 'Customer 1', email: 'customer1@example.com', phone: null }];

      mockClient.query.mockResolvedValueOnce({ rows: [mockCampaign] }); // For campaign select
      mockClient.query.mockResolvedValueOnce({ rows: mockCustomers }); // For customers select
      mockClient.query.mockResolvedValueOnce({}); // For campaign_recipients insert
      mockClient.query.mockResolvedValueOnce({}); // For campaign update
      mockClient.query.mockResolvedValueOnce({}); // For COMMIT

      await marketingController.sendMarketingCampaign({ params: { id: 1 }, user: { name: 'Test User' } }, mockRes);

      expect(sendEmail).toHaveBeenCalledWith('customer1@example.com', 'Email Campaign', 'Test Email');
      expect(sendSms).not.toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO campaign_recipients'),
        [1, 1, 'Sent', expect.any(Date), null]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'UPDATE marketing_campaigns SET status = $1, updated_at = NOW() WHERE id = $2;',
        ['Sent', 1]
      );
      expect(activityLogger.logActivity).toHaveBeenCalledWith(
        'Test User',
        'Campanha de marketing #1 (Email Campaign) enviada para 1 clientes.',
        'marketing_campaign',
        1
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Campanha enviada com sucesso para 1 clientes.' });
    });

    it('should send SMS campaign successfully', async () => {
      const mockCampaign = { id: 2, name: 'SMS Campaign', type: 'SMS', message_template: 'Test SMS' };
      const mockCustomers = [{ id: 2, name: 'Customer 2', email: null, phone: '123456789' }];

      mockClient.query.mockResolvedValueOnce({ rows: [mockCampaign] }); // For campaign select
      mockClient.query.mockResolvedValueOnce({ rows: mockCustomers }); // For customers select
      mockClient.query.mockResolvedValueOnce({}); // For campaign_recipients insert
      mockClient.query.mockResolvedValueOnce({}); // For campaign update
      mockClient.query.mockResolvedValueOnce({}); // For COMMIT

      await marketingController.sendMarketingCampaign({ params: { id: 2 }, user: { name: 'Test User' } }, mockRes);

      expect(sendEmail).not.toHaveBeenCalled();
      expect(sendSms).toHaveBeenCalledWith('123456789', 'Test SMS');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO campaign_recipients'),
        [2, 2, 'Sent', expect.any(Date), null]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'UPDATE marketing_campaigns SET status = $1, updated_at = NOW() WHERE id = $2;',
        ['Sent', 2]
      );
      expect(activityLogger.logActivity).toHaveBeenCalledWith(
        'Test User',
        'Campanha de marketing #2 (SMS Campaign) enviada para 1 clientes.',
        'marketing_campaign',
        2
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Campanha enviada com sucesso para 1 clientes.' });
    });

    it('should handle campaign already sent', async () => {
      const mockCampaign = { id: 1, name: 'Sent Campaign', type: 'Email', message_template: 'Test', status: 'Sent' };
      mockClient.query.mockResolvedValueOnce({ rows: [mockCampaign] });

      await marketingController.sendMarketingCampaign({ params: { id: 1 }, user: { name: 'Test User' } }, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Campanha já foi enviada.' });
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
      expect(sendSms).not.toHaveBeenCalled();
    });

    it('should handle errors during campaign sending', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('DB Error'));

      await marketingController.sendMarketingCampaign({ params: { id: 1 }, user: { name: 'Test User' } }, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
      expect(activityLogger.logActivity).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
      expect(sendSms).not.toHaveBeenCalled();
    });
  });
});