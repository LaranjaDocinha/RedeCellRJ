import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDbMock } from '../utils/dbMock.js';
import { AppError } from '../../src/utils/errors.js';

// Mock de serviços externos
vi.mock('../../src/services/referralService.js', () => ({
  referralService: {
    applyReferralCode: vi.fn(),
  },
}));

// Mock do pool do PostgreSQL
vi.mock('../../src/db/index.js', () => {
  const { mockPool, mockQuery, mockConnect, mockClient } = createDbMock();
  return {
    default: mockPool,
    connect: mockConnect,
    query: mockQuery,
    getPool: () => mockPool,
    _mockQuery: mockQuery,
    _mockConnect: mockConnect,
    _mockClient: mockClient,
    _mockPool: mockPool,
  };
});

// Importar o serviço APÓS os mocks
import { customerService } from '../../src/services/customerService.js';
import { referralService } from '../../src/services/referralService.js';

describe('CustomerService', () => {
  let mockQuery: any;
  let mockConnect: any;

  beforeEach(async () => {
    const dbModule = await import('../../src/db/index.js');
    mockQuery = (dbModule as any)._mockQuery;
    mockConnect = (dbModule as any)._mockConnect;

    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    mockConnect.mockResolvedValue((dbModule as any)._mockClient);
    
    vi.mocked(referralService.applyReferralCode).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllCustomers', () => {
    it('should return all customers', async () => {
      const mockCustomers = [{ id: 1, name: 'Cust 1' }];
      mockQuery.mockResolvedValueOnce({ rows: mockCustomers, rowCount: 1 });

      const result = await customerService.getAllCustomers();
      expect(result).toEqual(mockCustomers);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM customers');
    });
  });

  describe('getCustomerById', () => {
    it('should return a customer by ID', async () => {
      const mockCustomer = { id: 1, name: 'Cust 1' };
      mockQuery.mockResolvedValueOnce({ rows: [mockCustomer], rowCount: 1 });

      const result = await customerService.getCustomerById(1);
      expect(result).toEqual(mockCustomer);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM customers WHERE id = $1', [1]);
    });
  });

  describe('getCustomerByEmail', () => {
    it('should return a customer by Email', async () => {
      const mockCustomer = { id: 1, email: 'test@test.com' };
      mockQuery.mockResolvedValueOnce({ rows: [mockCustomer], rowCount: 1 });

      const result = await customerService.getCustomerByEmail('test@test.com');
      expect(result).toEqual(mockCustomer);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM customers WHERE email = $1', ['test@test.com']);
    });
  });

  describe('getCustomersWithBirthdayToday', () => {
    it('should return customers with birthday today', async () => {
      const mockCustomers = [{ id: 1, name: 'Bday Boy' }];
      mockQuery.mockResolvedValueOnce({ rows: mockCustomers, rowCount: 1 });

      const result = await customerService.getCustomersWithBirthdayToday();
      expect(result).toEqual(mockCustomers);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('EXTRACT(MONTH FROM birth_date)'));
    });
  });

  describe('createCustomer', () => {
    const payload = { name: 'New', email: 'new@test.com' };
    const mockCustomer = { id: 1, ...payload };

    it('should create a customer', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCustomer], rowCount: 1 });

      const result = await customerService.createCustomer(payload);
      expect(result).toEqual(mockCustomer);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO customers'),
        expect.any(Array)
      );
    });

    it('should apply referral code if provided', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCustomer], rowCount: 1 });
      const payloadWithRef = { ...payload, referral_code: 'REF123' };

      await customerService.createCustomer(payloadWithRef);
      expect(referralService.applyReferralCode).toHaveBeenCalledWith('REF123', 1);
    });

    it('should throw AppError on duplicate', async () => {
      const dbError = new Error('Duplicate');
      (dbError as any).code = '23505';
      mockQuery.mockRejectedValueOnce(dbError);

      await expect(customerService.createCustomer(payload)).rejects.toThrow('Customer with this email or CPF already exists');
    });
  });

  describe('updateCustomer', () => {
    const id = 1;
    const payload = { name: 'Updated' };
    const mockCustomer = { id, name: 'Updated' };

    it('should update customer', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCustomer], rowCount: 1 });
      const result = await customerService.updateCustomer(id, payload);
      expect(result).toEqual(mockCustomer);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE customers SET'),
        expect.any(Array)
      );
    });

    it('should return existing customer if no fields', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCustomer], rowCount: 1 }); // getCustomerById
      const result = await customerService.updateCustomer(id, {});
      expect(result).toEqual(mockCustomer);
      expect(mockQuery).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE customers'));
    });
  });

  describe('deleteCustomer', () => {
    it('should delete customer', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
      const result = await customerService.deleteCustomer(1);
      expect(result).toBe(true);
    });
  });

  describe('createOrUpdateCustomerFromOCR', () => {
    const data = { name: 'OCR', email: 'ocr@test.com', cpf: '123' };

    it('should update existing customer by CPF', async () => {
      const existing = { id: 1, ...data };
      mockQuery
        .mockResolvedValueOnce({ rows: [existing], rowCount: 1 }) // Find by CPF
        .mockResolvedValueOnce({ rows: [existing], rowCount: 1 }); // Update

      const result = await customerService.createOrUpdateCustomerFromOCR(data);
      expect(result).toEqual(existing);
    });

    it('should create new customer if not found', async () => {
      const newCust = { id: 2, ...data };
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Find by CPF
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Find by Email
        .mockResolvedValueOnce({ rows: [newCust], rowCount: 1 }); // Create

      const result = await customerService.createOrUpdateCustomerFromOCR(data);
      expect(result).toEqual(newCust);
    });
  });

  describe('searchCustomers', () => {
    it('should search customers', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '5' }], rowCount: 1 }) // Count
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }); // Select

      const result = await customerService.searchCustomers({ searchTerm: 'Test' });
      expect(result.totalCustomers).toBe(5);
      expect(result.customers).toHaveLength(1);
    });
  });

  describe('getCustomer360View', () => {
    it('should return 360 view', async () => {
      const mockCustomer = { id: 1, store_credit_balance: '100.00' };
      const mockSales = [{ id: 10, total_amount: '50.00' }];

      mockQuery
        .mockResolvedValueOnce({ rows: [mockCustomer], rowCount: 1 }) // Customer
        .mockResolvedValueOnce({ rows: mockSales, rowCount: 1 }); // Sales

      const result = await customerService.getCustomer360View(1);
      expect(result).toBeDefined();
      expect(result?.store_credit_balance).toBe(100.00);
      expect(result?.recent_sales).toHaveLength(1);
    });
  });

  describe('loyalty points and store credit', () => {
    it('addLoyaltyPoints', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });
      await customerService.addLoyaltyPoints(1, 10);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE customers SET loyalty_points'), [10, 1]);
    });

    it('subtractLoyaltyPoints', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });
      await customerService.subtractLoyaltyPoints(1, 10);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('GREATEST(0, loyalty_points - $1)'), [10, 1]);
    });

    it('deductStoreCredit', async () => {
      const mockClient = { query: mockQuery };
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // Update
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // Insert transaction

      await customerService.deductStoreCredit(1, 50, 100, mockClient);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO store_credit_transactions'), expect.any(Array));
    });

    it('addStoreCredit', async () => {
      const mockClient = { query: mockQuery };
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // Update
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // Insert transaction

      await customerService.addStoreCredit(1, 50, 100, mockClient);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO store_credit_transactions'), expect.any(Array));
    });

    it('addCashback', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // Update (inside addStoreCredit)
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // Insert (inside addStoreCredit)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      await customerService.addCashback(1, 10, 100);
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });
  });
});