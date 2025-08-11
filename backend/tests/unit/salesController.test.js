const salesController = require('../../controllers/salesController');
const db = require('../../db');

// Mock the db module
jest.mock('../../db', () => ({
  query: jest.fn(),
  getClient: jest.fn(() => ({
    query: jest.fn(),
    release: jest.fn(),
    query: jest.fn(), // Mock client.query as well
  })),
}));

// Mock logActivity
jest.mock('../../utils/activityLogger', () => ({
  logActivity: jest.fn(),
}));

describe('salesController', () => {
  let mockReq;
  let mockRes;
  let mockClient;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
      query: jest.fn(), // Ensure client.query is mocked
    };
    db.getClient.mockResolvedValue(mockClient);

    mockReq = {
      user: { id: 1, branch_id: 1 },
      body: {
        customer_id: 1,
        total_amount: 100,
        payment_method: 'Cash',
        products: [{ product_id: 1, quantity: 1, price_at_sale: 100 }],
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

  describe('createSale', () => {
    it('should create a sale successfully without gift card', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // For sales insert
      mockClient.query.mockResolvedValueOnce({}); // For product_variations update
      mockClient.query.mockResolvedValueOnce({}); // For sale_items insert
      mockClient.query.mockResolvedValueOnce({}); // For COMMIT

      await salesController.createSale(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO sales (customer_id, user_id, total_amount, payment_method, sale_date, gift_card_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;',
        [1, 1, 100, 'Cash', expect.any(Date), null]
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Venda criada com sucesso!', saleId: 1 });
      expect(logActivity).toHaveBeenCalled();
    });

    it('should create a sale successfully with gift card payment', async () => {
      mockReq.body.gift_card_code = 'GIFTCARD123';
      mockReq.body.gift_card_amount = 50;
      mockReq.body.total_amount = 100; // Original total amount

      mockClient.query.mockResolvedValueOnce({ // For gift_cards select
        rows: [{ id: 101, code: 'GIFTCARD123', current_value: 70, status: 'active', expiry_date: null }],
      });
      mockClient.query.mockResolvedValueOnce({}); // For gift_cards update
      mockClient.query.mockResolvedValueOnce({}); // For gift_card_transactions insert
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // For sales insert
      mockClient.query.mockResolvedValueOnce({}); // For product_variations update
      mockClient.query.mockResolvedValueOnce({}); // For sale_items insert
      mockClient.query.mockResolvedValueOnce({}); // For COMMIT

      await salesController.createSale(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'UPDATE gift_cards SET current_value = $1, status = $2, updated_at = NOW() WHERE id = $3;',
        [20, 'active', 101] // 70 - 50 = 20
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO gift_card_transactions (gift_card_id, transaction_type, amount, user_id, notes) VALUES ($1, $2, $3, $4, $5);',
        [101, 'redeem', 50, 1, 'Resgate em venda']
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO sales (customer_id, user_id, total_amount, payment_method, sale_date, gift_card_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;',
        [1, 1, 50, 'Cash', expect.any(Date), 101] // 100 - 50 = 50
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Venda criada com sucesso!', saleId: 1 });
      expect(logActivity).toHaveBeenCalled();
    });

    it('should handle insufficient gift card balance', async () => {
      mockReq.body.gift_card_code = 'GIFTCARD123';
      mockReq.body.gift_card_amount = 150;
      mockReq.body.total_amount = 100;

      mockClient.query.mockResolvedValueOnce({
        rows: [{ id: 101, code: 'GIFTCARD123', current_value: 70, status: 'active', expiry_date: null }],
      });

      await salesController.createSale(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Saldo insuficiente no vale-presente. Saldo atual: R$70.' });
      expect(logActivity).not.toHaveBeenCalled();
    });

    it('should handle expired gift card', async () => {
      mockReq.body.gift_card_code = 'GIFTCARD123';
      mockReq.body.gift_card_amount = 50;
      mockReq.body.total_amount = 100;

      mockClient.query.mockResolvedValueOnce({
        rows: [{ id: 101, code: 'GIFTCARD123', current_value: 70, status: 'active', expiry_date: new Date('2023-01-01') }],
      });

      await salesController.createSale(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Vale-presente expirado.' });
      expect(logActivity).not.toHaveBeenCalled();
    });

    it('should handle inactive gift card', async () => {
      mockReq.body.gift_card_code = 'GIFTCARD123';
      mockReq.body.gift_card_amount = 50;
      mockReq.body.total_amount = 100;

      mockClient.query.mockResolvedValueOnce({
        rows: [{ id: 101, code: 'GIFTCARD123', current_value: 70, status: 'inactive', expiry_date: null }],
      });

      await salesController.createSale(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Vale-presente não está ativo. Status atual: inactive.' });
      expect(logActivity).not.toHaveBeenCalled();
    });

    it('should handle non-existent gift card', async () => {
      mockReq.body.gift_card_code = 'NONEXISTENT';
      mockReq.body.gift_card_amount = 50;
      mockReq.body.total_amount = 100;

      mockClient.query.mockResolvedValueOnce({ rows: [] });

      await salesController.createSale(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Vale-presente não encontrado.' });
      expect(logActivity).not.toHaveBeenCalled();
    });
  });
});