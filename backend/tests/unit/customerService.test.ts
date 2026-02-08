import { describe, it, expect, vi, beforeEach } from 'vitest';
import { customerService } from '../../src/services/customerService.js';
import { customerRepository } from '../../src/repositories/customer.repository.js';
import { referralService } from '../../src/services/referralService.js';
import { AppError } from '../../src/utils/errors.js';
import pool from '../../src/db/index.js';

// Mocks
const mocks = vi.hoisted(() => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };
  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn(),
  };
  return { mockClient, mockPool };
});

vi.mock('../../src/db/index.js', () => ({
  default: mocks.mockPool,
  getPool: () => mocks.mockPool,
}));

vi.mock('../../src/repositories/customer.repository.js', () => ({
  customerRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByCpf: vi.fn(),
    findWithBirthdayToday: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getSegments: vi.fn(),
    search: vi.fn(),
    updateLoyaltyPoints: vi.fn(),
    updateStoreCredit: vi.fn(),
    logStoreCreditTransaction: vi.fn(),
  },
}));

vi.mock('../../src/services/referralService.js', () => ({
  referralService: {
    applyReferralCode: vi.fn(),
  },
}));

describe('CustomerService', () => {
  const mockCustomer = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '12345',
    cpf: '123.456.789-00',
    store_credit_balance: '100.00',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllCustomers', () => {
    it('should return all customers from repository', async () => {
      vi.mocked(customerRepository.findAll).mockResolvedValue([mockCustomer] as any);
      const result = await customerService.getAllCustomers();
      expect(result).toEqual([mockCustomer]);
      expect(customerRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getCustomerById', () => {
    it('should return customer by id', async () => {
      vi.mocked(customerRepository.findById).mockResolvedValue(mockCustomer as any);
      const result = await customerService.getCustomerById('1');
      expect(result).toEqual(mockCustomer);
      expect(customerRepository.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('getCustomerByEmail', () => {
    it('should return customer by email', async () => {
      vi.mocked(customerRepository.findByEmail).mockResolvedValue(mockCustomer as any);
      const result = await customerService.getCustomerByEmail('john@example.com');
      expect(result).toEqual(mockCustomer);
      expect(customerRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    });
  });

  describe('getCustomersWithBirthdayToday', () => {
    it('should return customers with birthday today', async () => {
      vi.mocked(customerRepository.findWithBirthdayToday).mockResolvedValue([mockCustomer] as any);
      const result = await customerService.getCustomersWithBirthdayToday();
      expect(result).toEqual([mockCustomer]);
      expect(customerRepository.findWithBirthdayToday).toHaveBeenCalled();
    });
  });

  describe('createCustomer', () => {
    it('should create a customer successfully', async () => {
      vi.mocked(customerRepository.create).mockResolvedValue(mockCustomer as any);

      const result = await customerService.createCustomer({
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'John Doe' }),
      );
    });

    it('should apply referral code if provided', async () => {
      vi.mocked(customerRepository.create).mockResolvedValue(mockCustomer as any);

      await customerService.createCustomer({
        name: 'John Doe',
        email: 'john@example.com',
        referral_code: 'REF123',
      });

      expect(referralService.applyReferralCode).toHaveBeenCalledWith('REF123', mockCustomer.id);
    });

    it('should throw AppError if customer with email/CPF already exists', async () => {
      const error = new Error('Unique constraint violation');
      (error as any).code = '23505';
      vi.mocked(customerRepository.create).mockRejectedValue(error);

      await expect(
        customerService.createCustomer({ name: 'John', email: 'john@example.com' }),
      ).rejects.toThrow('Customer with this email or CPF already exists');
    });
  });

  describe('updateCustomer', () => {
    it('should update customer successfully', async () => {
      vi.mocked(customerRepository.update).mockResolvedValue(mockCustomer as any);
      const result = await customerService.updateCustomer('1', { name: 'Updated' });
      expect(result).toEqual(mockCustomer);
      expect(customerRepository.update).toHaveBeenCalledWith('1', { name: 'Updated' });
    });

    it('should return current customer if update returns nothing but customer exists', async () => {
      vi.mocked(customerRepository.update).mockResolvedValue(undefined);
      vi.mocked(customerRepository.findById).mockResolvedValue(mockCustomer as any);

      const result = await customerService.updateCustomer('1', { name: 'Same' });
      expect(result).toEqual(mockCustomer);
    });

    it('should throw AppError if update fails with 23505', async () => {
      const error = new Error('Unique constraint');
      (error as any).code = '23505';
      vi.mocked(customerRepository.update).mockRejectedValue(error);

      await expect(customerService.updateCustomer('1', { email: 'dup@test.com' })).rejects.toThrow(
        'Customer with this email or CPF already exists',
      );
    });
  });

  describe('deleteCustomer', () => {
    it('should delete customer', async () => {
      vi.mocked(customerRepository.delete).mockResolvedValue(true);
      const result = await customerService.deleteCustomer('1');
      expect(result).toBe(true);
      expect(customerRepository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('createOrUpdateCustomerFromOCR', () => {
    it('should update existing customer if found by CPF', async () => {
      vi.mocked(customerRepository.findByCpf).mockResolvedValue(mockCustomer as any);
      vi.mocked(customerRepository.update).mockResolvedValue(mockCustomer as any);

      const result = await customerService.createOrUpdateCustomerFromOCR({
        cpf: mockCustomer.cpf,
        name: 'OCR Name',
      });

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.update).toHaveBeenCalled();
    });

    it('should update existing customer if found by Email', async () => {
      vi.mocked(customerRepository.findByCpf).mockResolvedValue(undefined);
      vi.mocked(customerRepository.findByEmail).mockResolvedValue(mockCustomer as any);
      vi.mocked(customerRepository.update).mockResolvedValue(mockCustomer as any);

      const result = await customerService.createOrUpdateCustomerFromOCR({
        email: mockCustomer.email,
        name: 'OCR Name',
      });

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.update).toHaveBeenCalled();
    });

    it('should create new customer if not found', async () => {
      vi.mocked(customerRepository.findByCpf).mockResolvedValue(undefined);
      vi.mocked(customerRepository.findByEmail).mockResolvedValue(undefined);
      vi.mocked(customerRepository.create).mockResolvedValue(mockCustomer as any);

      const result = await customerService.createOrUpdateCustomerFromOCR({
        name: 'New OCR',
        email: 'new@ocr.com',
      });

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.create).toHaveBeenCalled();
    });

    it('should throw error if name or email missing for new customer', async () => {
      vi.mocked(customerRepository.findByCpf).mockResolvedValue(undefined);
      vi.mocked(customerRepository.findByEmail).mockResolvedValue(undefined);

      await expect(customerService.createOrUpdateCustomerFromOCR({ cpf: '123' })).rejects.toThrow(
        'Name and email are required',
      );
    });
  });

  describe('getCustomerSegments', () => {
    it('should return segments from repository', async () => {
      const mockSegments = [{ segment: 'VIP', count: 5 }];
      vi.mocked(customerRepository.getSegments).mockResolvedValue(mockSegments);
      const result = await customerService.getCustomerSegments();
      expect(result).toEqual(mockSegments);
    });
  });

  describe('searchCustomers', () => {
    it('should search customers and return result with total', async () => {
      const searchResult = { customers: [mockCustomer], total: 1 };
      vi.mocked(customerRepository.search).mockResolvedValue(searchResult as any);

      const result = await customerService.searchCustomers({ searchTerm: 'John' });

      expect(result.customers).toEqual([mockCustomer]);
      expect(result.totalCustomers).toBe(1);
    });
  });

  describe('getCustomer360View', () => {
    it('should return 360 view if customer exists', async () => {
      vi.mocked(customerRepository.findById).mockResolvedValue(mockCustomer as any);
      vi.mocked(mocks.mockPool.query).mockResolvedValue({
        rows: [{ id: 101, total_amount: '50.00', sale_date: new Date() }],
      });

      const result = await customerService.getCustomer360View('1');

      expect(result).toBeDefined();
      expect(result?.recent_sales).toHaveLength(1);
      expect(result?.recent_sales[0].total_amount).toBe(50.0);
    });

    it('should return undefined if customer not found', async () => {
      vi.mocked(customerRepository.findById).mockResolvedValue(undefined);
      const result = await customerService.getCustomer360View('999');
      expect(result).toBeUndefined();
    });
  });

  describe('Loyalty Points', () => {
    it('should add loyalty points', async () => {
      vi.mocked(customerRepository.updateLoyaltyPoints).mockResolvedValue(mockCustomer as any);
      await customerService.addLoyaltyPoints('1', 10);
      expect(customerRepository.updateLoyaltyPoints).toHaveBeenCalledWith('1', 10);
    });

    it('should subtract loyalty points', async () => {
      vi.mocked(customerRepository.updateLoyaltyPoints).mockResolvedValue(mockCustomer as any);
      await customerService.subtractLoyaltyPoints('1', 5);
      expect(customerRepository.updateLoyaltyPoints).toHaveBeenCalledWith('1', -5);
    });
  });

  describe('deductStoreCredit', () => {
    it('should deduct store credit successfully using transaction', async () => {
      vi.mocked(customerRepository.findById).mockResolvedValue(mockCustomer as any);
      vi.mocked(customerRepository.updateStoreCredit).mockResolvedValue(mockCustomer as any);

      const result = await customerService.deductStoreCredit('1', 50);

      expect(result).toEqual(mockCustomer);
      expect(mocks.mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(customerRepository.updateStoreCredit).toHaveBeenCalledWith('1', -50, mocks.mockClient);
      expect(mocks.mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mocks.mockClient.release).toHaveBeenCalled();
    });

    it('should throw error if customer not found', async () => {
      vi.mocked(customerRepository.findById).mockResolvedValue(undefined);
      await expect(customerService.deductStoreCredit('999', 50)).rejects.toThrow(
        'Customer not found',
      );
    });

    it('should throw error if insufficient balance', async () => {
      vi.mocked(customerRepository.findById).mockResolvedValue({
        ...mockCustomer,
        store_credit_balance: '10.00',
      } as any);
      await expect(customerService.deductStoreCredit('1', 50)).rejects.toThrow(
        'Insufficient store credit balance',
      );
    });

    it('should rollback on error', async () => {
      vi.mocked(customerRepository.findById).mockResolvedValue(mockCustomer as any);
      vi.mocked(customerRepository.updateStoreCredit).mockRejectedValue(new Error('Update failed'));

      await expect(customerService.deductStoreCredit('1', 50)).rejects.toThrow('Update failed');
      expect(mocks.mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('addStoreCredit', () => {
    it('should add store credit and log transaction', async () => {
      vi.mocked(customerRepository.updateStoreCredit).mockResolvedValue(mockCustomer as any);

      await customerService.addStoreCredit('1', 50);

      expect(customerRepository.updateStoreCredit).toHaveBeenCalledWith('1', 50, null);
      expect(customerRepository.logStoreCreditTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'credit', amount: 50 }),
        null,
      );
    });
  });

  describe('addCashback', () => {
    it('should add cashback using transaction', async () => {
      vi.mocked(customerRepository.updateStoreCredit).mockResolvedValue(mockCustomer as any);

      await customerService.addCashback('1', 5);

      expect(mocks.mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(customerRepository.updateStoreCredit).toHaveBeenCalledWith('1', 5, mocks.mockClient);
      expect(customerRepository.logStoreCreditTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'cashback', amount: 5 }),
        mocks.mockClient,
      );
      expect(mocks.mockClient.query).toHaveBeenCalledWith('COMMIT');
    });
  });
});
