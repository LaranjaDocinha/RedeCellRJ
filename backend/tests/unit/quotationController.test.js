const quotationController = require('../../controllers/quotationController');
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

// Mock PDFDocument, fs, path for generateQuotationPdf helper
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => {
    return {
      fontSize: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      moveDown: jest.fn().mockReturnThis(),
      pipe: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
  });
});
jest.mock('fs', () => ({
  createWriteStream: jest.fn(),
}));
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')), // Simple join for mocking paths
}));

const PDFDocument = require('pdfkit'); // Explicitly import PDFDocument

describe('quotationController', () => {
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
        valid_until_date: '2025-09-01',
        notes: 'Some notes',
        items: [
          {
            description: 'Product A',
            quantity: 2,
            unit_price: 50,
            product_id: 101,
          },
          {
            description: 'Service B',
            quantity: 1,
            unit_price: 75,
          },
        ],
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

  describe('createQuotation', () => {
    it('should create a quotation successfully', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // For quotations insert
      mockClient.query.mockResolvedValueOnce({}); // For first quotation_item insert
      mockClient.query.mockResolvedValueOnce({}); // For second quotation_item insert
      mockClient.query.mockResolvedValueOnce({}); // For COMMIT

      await quotationController.createQuotation(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO quotations (customer_id, user_id, valid_until_date, total_amount, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
        [1, 1, '2025-09-01', 175, 'Some notes'] // 2*50 + 1*75 = 175
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO quotation_items (quotation_id, product_id, product_variation_id, description, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5, $6, $7);',
        [1, 101, null, 'Product A', 2, 50, 100]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO quotation_items (quotation_id, product_id, product_variation_id, description, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5, $6, $7);',
        [1, null, null, 'Service B', 1, 75, 75]
      );
      expect(logActivity).toHaveBeenCalledWith(
        'Test User',
        'Orçamento #1 criado para o cliente 1.',
        'quotation',
        1
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ id: 1 });
    });

    it('should handle errors during quotation creation', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('DB Error'));

      await quotationController.createQuotation(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
      expect(logActivity).not.toHaveBeenCalled();
    });

    it('should return 400 if customer_id is missing', async () => {
      delete mockReq.body.customer_id;

      await quotationController.createQuotation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Dados do orçamento incompletos.' });
      expect(mockClient.query).not.toHaveBeenCalled();
      expect(logActivity).not.toHaveBeenCalled();
    });

    it('should return 400 if items are missing', async () => {
      mockReq.body.items = [];

      await quotationController.createQuotation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Dados do orçamento incompletos.' });
      expect(mockClient.query).not.toHaveBeenCalled();
      expect(logActivity).not.toHaveBeenCalled();
    });
  });
});