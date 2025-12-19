import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { gdprService } from '../../src/services/gdprService.js';
import pool from '../../src/db/index.js';
import { AppError } from '../../src/utils/errors.js';

// Mock do db
vi.mock('../../src/db/index.js', () => {
  const mockQuery = vi.fn();
  const mockRelease = vi.fn();
  const mockClient = {
    query: mockQuery,
    release: mockRelease,
  };
  const mockConnect = vi.fn(() => Promise.resolve(mockClient));
  
  return {
    default: {
      query: mockQuery,
      connect: mockConnect,
    },
  };
});

describe('GdprService', () => {
  const mockQuery = pool.query as vi.Mock;
  const mockConnect = pool.connect as vi.Mock;

  beforeEach(() => {
    mockQuery.mockClear();
    mockConnect.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('deleteUserData', () => {
    it('should delete user data successfully', async () => {
      const userId = '1';
      
      // Mocks para a transação
      const mockClientQuery = vi.fn();
      const mockClientRelease = vi.fn();
      mockConnect.mockResolvedValue({
        query: mockClientQuery,
        release: mockClientRelease,
      });

      // Mock sequência de queries na transação
      mockClientQuery.mockResolvedValueOnce({}); // BEGIN
      mockClientQuery.mockResolvedValueOnce({}); // DELETE keybinds
      mockClientQuery.mockResolvedValueOnce({}); // DELETE push subs
      mockClientQuery.mockResolvedValueOnce({}); // UPDATE audit logs
      mockClientQuery.mockResolvedValueOnce({ rows: [{ id: 10 }] }); // SELECT customer
      mockClientQuery.mockResolvedValueOnce({}); // UPDATE customer anonimização
      mockClientQuery.mockResolvedValueOnce({}); // DELETE store credit
      mockClientQuery.mockResolvedValueOnce({}); // UPDATE sales
      mockClientQuery.mockResolvedValueOnce({}); // DELETE users
      mockClientQuery.mockResolvedValueOnce({}); // COMMIT

      await gdprService.deleteUserData(userId);

      expect(mockConnect).toHaveBeenCalled();
      expect(mockClientQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockClientQuery).toHaveBeenCalledWith('COMMIT');
      expect(mockClientRelease).toHaveBeenCalled();
    });

    it('should rollback transaction if deletion fails', async () => {
      const userId = '1';
      const mockClientQuery = vi.fn();
      const mockClientRelease = vi.fn();
      mockConnect.mockResolvedValue({
        query: mockClientQuery,
        release: mockClientRelease,
      });

      mockClientQuery.mockResolvedValueOnce({}); // BEGIN
      mockClientQuery.mockRejectedValueOnce(new Error('DB Error')); // Falha na primeira operação

      await expect(gdprService.deleteUserData(userId)).rejects.toThrow(AppError);
      
      expect(mockClientQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockClientQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClientRelease).toHaveBeenCalled();
    });
  });

  describe('exportUserData', () => {
    it('should export user data successfully', async () => {
      const userId = '1';
      
      // Mock user details
      mockQuery.mockResolvedValueOnce({ rows: [{ id: userId, name: 'Test User', email: 'test@test.com' }] });
      // Mock customer details
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 10, name: 'Test User', email: 'test@test.com' }] });
      // Mock sales
      mockQuery.mockResolvedValueOnce({ rows: [] });
      // Mock store credit
      mockQuery.mockResolvedValueOnce({ rows: [] });
      // Mock audit logs
      mockQuery.mockResolvedValueOnce({ rows: [] });
      // Mock keybinds
      mockQuery.mockResolvedValueOnce({ rows: [] });
      // Mock push subs
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const data = await gdprService.exportUserData(userId);

      expect(data).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.customer).toBeDefined();
    });

    it('should throw AppError if user not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // User not found

      await expect(gdprService.exportUserData('999')).rejects.toThrow(AppError);
    });
  });
});
