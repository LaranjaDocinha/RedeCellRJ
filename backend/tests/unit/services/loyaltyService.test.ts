import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDbMock } from '../../utils/dbMock.js';
import { AppError } from '../../../src/utils/errors.js';

// Mock do pool do PostgreSQL
vi.mock('../../../src/db/index.js', () => {
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
import { loyaltyService } from '../../../src/services/loyaltyService.js';

describe('LoyaltyService', () => {
  let mockQuery: any;
  let mockConnect: any;

  beforeEach(async () => {
    // Importar as referências dos mocks
    const dbModule = await import('../../../src/db/index.js');
    mockQuery = (dbModule as any)._mockQuery;
    mockConnect = (dbModule as any)._mockConnect;

    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 }); // Default fallback for query
    mockConnect.mockResolvedValue((dbModule as any)._mockClient); // Default fallback for connect
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getLoyaltyPoints', () => {
    it('should return loyalty points for a user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ loyalty_points: 100 }], rowCount: 1 });

      const points = await loyaltyService.getLoyaltyPoints(1);
      expect(points).toBe(100);
      expect(mockQuery).toHaveBeenCalledWith('SELECT loyalty_points FROM users WHERE id = $1', [1]);
    });

    it('should throw AppError if user not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await expect(loyaltyService.getLoyaltyPoints(999)).rejects.toThrow(new AppError('User not found', 404));
    });
  });

  describe('addLoyaltyPoints', () => {
    const userId = 1;
    const points = 50;
    const reason = 'Purchase';

    it('should add loyalty points and log transaction', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ loyalty_points: 150 }], rowCount: 1 }) // UPDATE users
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT loyalty_transactions
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const newPoints = await loyaltyService.addLoyaltyPoints(userId, points, reason);
      expect(newPoints).toBe(150);
      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE users SET loyalty_points = loyalty_points + $1 WHERE id = $2 RETURNING loyalty_points',
        [points, userId],
      );
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO loyalty_transactions (user_id, points_change, reason) VALUES ($1, $2, $3)',
        [userId, points, reason],
      );
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw AppError if user not found during update', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // UPDATE users (no user returned)

      await expect(loyaltyService.addLoyaltyPoints(userId, points, reason)).rejects.toThrow(
        new AppError('User not found.', 404),
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should rollback transaction if DB error occurs', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockRejectedValueOnce(new Error('DB Error')); // UPDATE users fails

      await expect(loyaltyService.addLoyaltyPoints(userId, points, reason)).rejects.toThrow(
        'DB Error',
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('redeemLoyaltyPoints', () => {
    const userId = 1;
    const points = 50;
    const reason = 'Discount';

    it('should redeem loyalty points and log transaction', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ loyalty_points: 100 }], rowCount: 1 }) // SELECT user for points check
        .mockResolvedValueOnce({ rows: [{ loyalty_points: 50 }], rowCount: 1 }) // UPDATE users
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT loyalty_transactions
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const newPoints = await loyaltyService.redeemLoyaltyPoints(userId, points, reason);
      expect(newPoints).toBe(50);
      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockQuery).toHaveBeenCalledWith('SELECT loyalty_points FROM users WHERE id = $1 FOR UPDATE', [userId]);
      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE users SET loyalty_points = loyalty_points - $1 WHERE id = $2 RETURNING loyalty_points',
        [points, userId],
      );
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO loyalty_transactions (user_id, points_change, reason) VALUES ($1, $2, $3)',
        [userId, -points, reason],
      );
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw AppError if user not found', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT user returns empty

      await expect(loyaltyService.redeemLoyaltyPoints(userId, points, reason)).rejects.toThrow(
        new AppError('User not found', 404),
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw AppError if insufficient loyalty points', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ loyalty_points: 20 }], rowCount: 1 }); // User has 20, needs 50

      await expect(loyaltyService.redeemLoyaltyPoints(userId, points, reason)).rejects.toThrow(
        new AppError('Insufficient loyalty points.', 400),
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should rollback transaction if DB error occurs', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ loyalty_points: 100 }], rowCount: 1 }) // SELECT user
        .mockRejectedValueOnce(new Error('DB Error')); // UPDATE users fails

      await expect(loyaltyService.redeemLoyaltyPoints(userId, points, reason)).rejects.toThrow(
        'DB Error',
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('getLoyaltyTransactions', () => {
    const userId = 1;
    const mockTransactions = [{ points_change: 50, reason: 'Purchase', created_at: new Date() }];

    it('should return loyalty transactions for a user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: userId }], rowCount: 1 }) // User check
        .mockResolvedValueOnce({ rows: mockTransactions, rowCount: 1 }); // Transactions

      const transactions = await loyaltyService.getLoyaltyTransactions(userId);
      expect(transactions).toEqual(mockTransactions);
      expect(mockQuery).toHaveBeenCalledWith('SELECT id FROM users WHERE id = $1', [userId]);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT points_change, reason, created_at FROM loyalty_transactions WHERE user_id = $1 ORDER BY created_at DESC',
        [userId],
      );
    });

    it('should throw AppError if user not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // User check returns empty

      await expect(loyaltyService.getLoyaltyTransactions(userId)).rejects.toThrow(
        new AppError('User not found', 404),
      );
    });

    it('should return empty array if no transactions found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: userId }], rowCount: 1 }) // User check
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // No transactions

      const transactions = await loyaltyService.getLoyaltyTransactions(userId);
      expect(transactions).toEqual([]);
    });
  });

  describe('getAllLoyaltyTiers', () => {
    const mockTiers = [{ id: 1, name: 'Bronze', min_points: 0 }];

    it('should return all loyalty tiers', async () => {
      mockQuery.mockResolvedValueOnce({ rows: mockTiers, rowCount: 1 });

      const tiers = await loyaltyService.getAllLoyaltyTiers();
      expect(tiers).toEqual(mockTiers);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM loyalty_tiers ORDER BY min_points ASC');
    });

    it('should return empty array if no tiers found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const tiers = await loyaltyService.getAllLoyaltyTiers();
      expect(tiers).toEqual([]);
    });
  });

  describe('getLoyaltyTierById', () => {
    const mockTier = { id: 1, name: 'Bronze', min_points: 0 };

    it('should return a loyalty tier by ID', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockTier], rowCount: 1 });

      const tier = await loyaltyService.getLoyaltyTierById(1);
      expect(tier).toEqual(mockTier);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM loyalty_tiers WHERE id = $1', [1]);
    });

    it('should return undefined if tier not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const tier = await loyaltyService.getLoyaltyTierById(999);
      expect(tier).toBeUndefined();
    });
  });

  describe('createLoyaltyTier', () => {
    const payload = { name: 'Silver', min_points: 500, description: 'Silver Tier' };
    const mockCreatedTier = { id: 2, ...payload, benefits: null };

    it('should create a new loyalty tier', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCreatedTier], rowCount: 1 });

      const createdTier = await loyaltyService.createLoyaltyTier(payload);
      expect(createdTier).toEqual(mockCreatedTier);
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO loyalty_tiers (name, min_points, description, benefits) VALUES ($1, $2, $3, $4) RETURNING *',
        [payload.name, payload.min_points, payload.description, payload.benefits],
      );
    });

    it('should throw AppError if tier with same name or min_points already exists (23505)', async () => {
      const dbError = new Error('duplicate key value violates unique constraint');
      (dbError as any).code = '23505';
      mockQuery.mockRejectedValueOnce(dbError);

      await expect(loyaltyService.createLoyaltyTier(payload)).rejects.toThrow(
        new AppError('Loyalty tier with this name or min_points already exists', 409),
      );
    });

    it('should rethrow other DB errors', async () => {
      const dbError = new Error('Another DB error');
      (dbError as any).code = 'XXXYY';
      mockQuery.mockRejectedValueOnce(dbError);

      await expect(loyaltyService.createLoyaltyTier(payload)).rejects.toThrow('Another DB error');
    });
  });

  describe('updateLoyaltyTier', () => {
    const tierId = 1;
    const initialTier = { id: tierId, name: 'Bronze', min_points: 0 };
    const updatePayload = { name: 'Gold', min_points: 1000 };
    const mockUpdatedTier = { ...initialTier, ...updatePayload };

    it('should update a loyalty tier', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedTier], rowCount: 1 });

      const updatedTier = await loyaltyService.updateLoyaltyTier(tierId, updatePayload);
      expect(updatedTier).toEqual(mockUpdatedTier);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE loyalty_tiers SET name = $1, min_points = $2, updated_at = current_timestamp WHERE id = $3 RETURNING *'),
        [updatePayload.name, updatePayload.min_points, tierId],
      );
    });

    it('should return undefined if tier not found for update', async () => {
      // updateLoyaltyTier não chama get se tem campos
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // UPDATE (no rows affected)

      const updatedTier = await loyaltyService.updateLoyaltyTier(999, updatePayload);
      expect(updatedTier).toBeUndefined();
    });

    it('should return existing tier if no fields to update', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [initialTier], rowCount: 1 }); // getLoyaltyTierById

      const updatedTier = await loyaltyService.updateLoyaltyTier(tierId, {}); // Empty payload
      expect(updatedTier).toEqual(initialTier);
      expect(mockQuery).toHaveBeenCalledTimes(1); // Only for getLoyaltyTierById
    });

    it('should throw AppError if tier with same name or min_points already exists (23505)', async () => {
      const dbError = new Error('duplicate key value violates unique constraint');
      (dbError as any).code = '23505';
      mockQuery.mockRejectedValueOnce(dbError); // UPDATE fails

      await expect(loyaltyService.updateLoyaltyTier(tierId, updatePayload)).rejects.toThrow(
        new AppError('Loyalty tier with this name or min_points already exists', 409),
      );
    });

    it('should rethrow other DB errors', async () => {
      const dbError = new Error('Another DB error');
      (dbError as any).code = 'XXXYY';
      mockQuery.mockRejectedValueOnce(dbError); // UPDATE fails

      await expect(loyaltyService.updateLoyaltyTier(tierId, updatePayload)).rejects.toThrow('Another DB error');
    });
  });

  describe('deleteLoyaltyTier', () => {
    it('should delete a loyalty tier', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });

      const isDeleted = await loyaltyService.deleteLoyaltyTier(1);
      expect(isDeleted).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM loyalty_tiers WHERE id = $1 RETURNING id', [1]);
    });

    it('should return false if tier not found for deletion', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const isDeleted = await loyaltyService.deleteLoyaltyTier(999);
      expect(isDeleted).toBe(false);
    });
  });

  describe('getUserLoyaltyTier', () => {
    const userId = 1;
    const userPoints = 750;
    const mockTier = { id: 2, name: 'Silver', min_points: 500 };

    it('should return the correct loyalty tier for a user', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ loyalty_points: userPoints }], rowCount: 1 }) // getLoyaltyPoints
        .mockResolvedValueOnce({ rows: [mockTier], rowCount: 1 }); // SELECT loyalty_tiers

      const tier = await loyaltyService.getUserLoyaltyTier(userId);
      expect(tier).toEqual(mockTier);
      expect(mockQuery).toHaveBeenCalledWith('SELECT loyalty_points FROM users WHERE id = $1', [userId]);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM loyalty_tiers WHERE min_points <= $1 ORDER BY min_points DESC LIMIT 1',
        [userPoints],
      );
    });

    it('should throw AppError if user not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // getLoyaltyPoints (user not found)

      await expect(loyaltyService.getUserLoyaltyTier(userId)).rejects.toThrow('User not found');
    });

    it('should return undefined if no applicable tier found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ loyalty_points: userPoints }], rowCount: 1 }) // getLoyaltyPoints
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT loyalty_tiers returns empty

      const tier = await loyaltyService.getUserLoyaltyTier(userId);
      expect(tier).toBeUndefined();
    });
  });

  describe('updateAllCustomerTiers', () => {
    const mockTiers = [
      { id: 3, name: 'Gold', min_points: 1000 },
      { id: 2, name: 'Silver', min_points: 500 },
      { id: 1, name: 'Bronze', min_points: 0 },
    ];
    const mockCustomers = [
      { id: 101, loyalty_tier_id: 1, loyalty_points: 600, email: 'cust1@example.com' }, // Should become Silver (id 2)
      { id: 102, loyalty_tier_id: 3, loyalty_points: 1200, email: 'cust2@example.com' }, // Already Gold (id 3)
      { id: 103, loyalty_tier_id: null, loyalty_points: 200, email: 'cust3@example.com' }, // Should become Bronze (id 1)
      { id: 104, loyalty_tier_id: 2, loyalty_points: 400, email: 'cust4@example.com' }, // Should become Bronze (id 1)
    ];

    it('should update loyalty tiers for customers needing updates', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: mockTiers, rowCount: mockTiers.length }) // SELECT loyalty_tiers
        .mockResolvedValueOnce({ rows: mockCustomers, rowCount: mockCustomers.length }) // SELECT customers
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE customers
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // COMMIT
        .mockResolvedValue({ rows: [], rowCount: 0 }); // Fallback

      await loyaltyService.updateAllCustomerTiers();

      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
      
      const calls = mockQuery.mock.calls.map((c: any) => c[0].replace(/\s+/g, ' ').trim()); // Normalizar espaços
      expect(calls.some((sql: string) => sql.includes('SELECT * FROM loyalty_tiers ORDER BY min_points DESC'))).toBe(true);
      expect(calls.some((sql: string) => sql.includes('SELECT c.id, c.loyalty_tier_id, u.loyalty_points FROM customers c JOIN users u ON c.email = u.email'))).toBe(true);
      expect(calls.some((sql: string) => sql.includes('UPDATE customers SET loyalty_tier_id = temp.new_tier_id FROM (VALUES'))).toBe(true);
    });

    it('should not update if no loyalty tiers are defined', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // SELECT loyalty_tiers (empty)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {}); // Suppress console.log
      await loyaltyService.updateAllCustomerTiers();
      expect(consoleSpy).toHaveBeenCalledWith('No loyalty tiers defined. Skipping tier update.');
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
      expect(mockQuery).toHaveBeenCalledTimes(3); // BEGIN, SELECT tiers, COMMIT
      consoleSpy.mockRestore();
    });

    it('should not update if all customer tiers are already up to date', async () => {
      const updatedCustomers = [
        { id: 101, loyalty_tier_id: 2, loyalty_points: 600, email: 'cust1@example.com' }, // Already Silver
        { id: 102, loyalty_tier_id: 3, loyalty_points: 1200, email: 'cust2@example.com' }, // Already Gold
      ];
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: mockTiers, rowCount: mockTiers.length }) // SELECT loyalty_tiers
        .mockResolvedValueOnce({ rows: updatedCustomers, rowCount: updatedCustomers.length }) // SELECT customers
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT (no updates)

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await loyaltyService.updateAllCustomerTiers();
      expect(consoleSpy).toHaveBeenCalledWith('All customer loyalty tiers are up to date.');
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
      expect(mockQuery).toHaveBeenCalledTimes(4); // BEGIN, SELECT tiers, SELECT customers, COMMIT
      consoleSpy.mockRestore();
    });

    it('should rollback transaction if error occurs during tier update', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: mockTiers, rowCount: mockTiers.length }) // SELECT loyalty_tiers
        .mockRejectedValueOnce(new Error('DB Error during customer select')); // SELECT customers fails

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await expect(loyaltyService.updateAllCustomerTiers()).rejects.toThrow(
        'DB Error during customer select',
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating customer loyalty tiers:',
        expect.any(Error),
      );
      consoleErrorSpy.mockRestore();
    });
  });
});