import { describe, it, expect, vi, beforeEach } from 'vitest';
import { walletService } from '../../../src/services/walletService.js';
import pool from '../../../src/db/index.js';

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
}));

describe('WalletService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });
    mocks.mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('addCredit', () => {
    it('should add credit using transaction', async () => {
      await walletService.addCredit(1, 100, 'reward');

      expect(mocks.mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mocks.mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO customer_wallets'), [1, 100]);
      expect(mocks.mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO wallet_transactions'), [1, 100, 'reward', undefined, undefined]);
      expect(mocks.mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should rollback on error', async () => {
      mocks.mockClient.query.mockResolvedValueOnce({}); // BEGIN
      mocks.mockClient.query.mockRejectedValueOnce(new Error('Fail'));

      await expect(walletService.addCredit(1, 100, 'type')).rejects.toThrow();
      expect(mocks.mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('debit', () => {
    it('should debit successfully if balance sufficient', async () => {
      mocks.mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ balance: '200.00' }] }) // SELECT
        .mockResolvedValueOnce({}) // UPDATE
        .mockResolvedValueOnce({}) // INSERT log
        .mockResolvedValueOnce({}); // COMMIT

      await walletService.debit(1, 50, 101);

      expect(mocks.mockClient.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE customer_wallets'), [50, 1]);
      expect(mocks.mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw error if balance insufficient', async () => {
      mocks.mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ balance: '10.00' }] }); // SELECT

      await expect(walletService.debit(1, 50, 101)).rejects.toThrow('Saldo insuficiente');
      expect(mocks.mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('getBalance', () => {
    it('should return balance from db', async () => {
      mocks.mockPool.query.mockResolvedValueOnce({ rows: [{ balance: '150.50' }] });
      const balance = await walletService.getBalance(1);
      expect(balance).toBe(150.5);
    });

    it('should return 0 if no wallet found', async () => {
      mocks.mockPool.query.mockResolvedValueOnce({ rows: [] });
      const balance = await walletService.getBalance(1);
      expect(balance).toBe(0);
    });
  });
});
