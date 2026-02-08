import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loyaltyService } from '../../../src/services/loyaltyService.js';
import { loyaltyRepository } from '../../../src/repositories/loyalty.repository.js';
import { AppError } from '../../../src/utils/errors.js';
import pool, { getPool } from '../../../src/db/index.js';

vi.mock('../../../src/repositories/loyalty.repository.js', () => ({
  loyaltyRepository: {
    getPoints: vi.fn(),
    getPointsForUpdate: vi.fn(),
    updatePoints: vi.fn(),
    createTransaction: vi.fn(),
  },
}));

// Mock DB
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

vi.mock('../../../src/db/index.js', () => ({
  default: mocks.mockPool,
  getPool: () => mocks.mockPool,
  connect: mocks.mockPool.connect,
}));

describe('LoyaltyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });
    mocks.mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('getLoyaltyPoints', () => {
    it('should return points', async () => {
      vi.mocked(loyaltyRepository.getPoints).mockResolvedValue(100);
      const points = await loyaltyService.getLoyaltyPoints(1);
      expect(points).toBe(100);
    });

    it('should throw error if customer not found', async () => {
      vi.mocked(loyaltyRepository.getPoints).mockResolvedValue(null);
      await expect(loyaltyService.getLoyaltyPoints(1)).rejects.toThrow('Customer not found');
    });
  });

  describe('addLoyaltyPoints', () => {
    it('should add points and log transaction earned', async () => {
      vi.mocked(loyaltyRepository.getPoints).mockResolvedValue(100);
      vi.mocked(loyaltyRepository.updatePoints).mockResolvedValue(150);

      const res = await loyaltyService.addLoyaltyPoints(1, 50, 'P');
      expect(res).toBe(150);
      expect(loyaltyRepository.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ points: 50, type: 'earned' }),
        mocks.mockClient,
      );
    });

    it('should rollback on error', async () => {
      vi.mocked(loyaltyRepository.getPoints).mockResolvedValue(100);
      vi.mocked(loyaltyRepository.updatePoints).mockRejectedValue(new Error('DB Fail'));

      await expect(loyaltyService.addLoyaltyPoints(1, 50, 'reason')).rejects.toThrow();
      expect(mocks.mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('redeemLoyaltyPoints', () => {
    it('should throw an error if customer is not found', async () => {
      vi.mocked(loyaltyRepository.getPointsForUpdate).mockResolvedValue(null);
      await expect(loyaltyService.redeemLoyaltyPoints(1, 100)).rejects.toThrow(
        'Customer not found.',
      );
    });

    it('should throw an error if loyalty points are insufficient', async () => {
      vi.mocked(loyaltyRepository.getPointsForUpdate).mockResolvedValue(50);
      await expect(loyaltyService.redeemLoyaltyPoints(1, 100)).rejects.toThrow(
        'Insufficient loyalty points.',
      );
    });

    it('should redeem loyalty points successfully', async () => {
      vi.mocked(loyaltyRepository.getPointsForUpdate).mockResolvedValue(200);
      vi.mocked(loyaltyRepository.updatePoints).mockResolvedValue(100);

      const res = await loyaltyService.redeemLoyaltyPoints(1, 100);
      expect(res.success).toBe(true);
      expect(loyaltyRepository.updatePoints).toHaveBeenCalledWith(1, -100, mocks.mockClient);
    });
  });

  describe('getLoyaltyTransactions', () => {
    it('should return transactions', async () => {
      mocks.mockPool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // customer check
        .mockResolvedValueOnce({
          rows: [{ points_change: 100, reason: 'earned', created_at: new Date() }],
          rowCount: 1,
        });

      const res = await loyaltyService.getLoyaltyTransactions(1);
      expect(res).toHaveLength(1);
    });

    it('should throw 404 if customer not found', async () => {
      mocks.mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      await expect(loyaltyService.getLoyaltyTransactions(1)).rejects.toThrow(/não encontrado/);
    });
  });

  describe('Tier Management', () => {
    const mockTier = { id: 1, name: 'Gold', min_points: 1000 };

    it('should get all tiers', async () => {
      mocks.mockPool.query.mockResolvedValue({ rows: [mockTier] });
      const res = await loyaltyService.getAllLoyaltyTiers();
      expect(res).toEqual([mockTier]);
    });

    it('should get tier by id', async () => {
      mocks.mockPool.query.mockResolvedValue({ rows: [mockTier] });
      const res = await loyaltyService.getLoyaltyTierById(1);
      expect(res).toEqual(mockTier);
    });

    it('should create tier', async () => {
      mocks.mockPool.query.mockResolvedValue({ rows: [mockTier] });
      const res = await loyaltyService.createLoyaltyTier({ name: 'Gold', min_points: 1000 });
      expect(res).toEqual(mockTier);
    });

    it('should throw 409 on duplicate tier name/points', async () => {
      const error = new Error('Unique violation');
      (error as any).code = '23505';
      mocks.mockPool.query.mockRejectedValue(error);
      await expect(loyaltyService.createLoyaltyTier({ name: 'Gold', min_points: 1000 })).rejects.toThrow(AppError);
    });

    it('should update tier', async () => {
      mocks.mockPool.query.mockResolvedValue({ rows: [{ ...mockTier, name: 'Platinum' }] });
      const res = await loyaltyService.updateLoyaltyTier(1, { name: 'Platinum' });
      expect(res?.name).toBe('Platinum');
    });

    it('should delete tier', async () => {
      mocks.mockPool.query.mockResolvedValue({ rowCount: 1 });
      const res = await loyaltyService.deleteLoyaltyTier(1);
      expect(res).toBe(true);
    });
  });

  describe('getUserLoyaltyTier', () => {
    it('should return highest applicable tier', async () => {
      vi.mocked(loyaltyRepository.getPoints).mockResolvedValue(1500);
      mocks.mockPool.query.mockResolvedValue({ rows: [{ id: 2, name: 'Silver' }] });

      const tier = await loyaltyService.getUserLoyaltyTier(1);
      expect(tier?.name).toBe('Silver');
      expect(mocks.mockPool.query).toHaveBeenCalledWith(expect.stringContaining('min_points <= $1'), [1500]);
    });
  });

  describe('updateAllCustomerTiers', () => {
    it('should update tiers for customers whose current tier is different', async () => {
      // Sequence: BEGIN -> SELECT tiers -> SELECT customers -> UPDATE -> COMMIT
      mocks.mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ // SELECT tiers
          rows: [
            { id: 3, name: 'VIP', min_points: 2000 },
            { id: 2, name: 'Regular', min_points: 1000 }
          ] 
        })
        .mockResolvedValueOnce({ // SELECT customers
          rows: [
            { id: 10, loyalty_tier_id: null, loyalty_points: 1500 },
            { id: 11, loyalty_tier_id: 2, loyalty_points: 2500 }
          ] 
        })
        .mockResolvedValueOnce({}) // UPDATE
        .mockResolvedValueOnce({}); // COMMIT

      await loyaltyService.updateAllCustomerTiers();

      expect(mocks.mockClient.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE customers SET loyalty_tier_id'));
      expect(mocks.mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should do nothing if no tiers', async () => {
      mocks.mockClient.query.mockResolvedValueOnce({ rows: [] });
      await loyaltyService.updateAllCustomerTiers();
      expect(mocks.mockClient.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE customers'));
    });
  });
});
