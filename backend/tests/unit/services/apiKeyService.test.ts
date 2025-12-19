import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiKeyService } from '../../../src/services/apiKeyService';
import pool from '../../../src/db/index';
import crypto from 'crypto';
import { AppError, NotFoundError } from '../../../src/utils/errors';

// Mock DB
vi.mock('../../../src/db/index', () => ({
  default: {
    query: vi.fn(),
  },
}));

// Mock crypto
const mockRandomBytes = {
  toString: vi.fn().mockReturnValue('raw_key_hex'),
};
const mockHash = {
  update: vi.fn().mockReturnThis(),
  digest: vi.fn().mockReturnValue('hashed_key_hex'),
};

vi.mock('crypto', () => ({
  default: {
    randomBytes: vi.fn(() => mockRandomBytes),
    createHash: vi.fn(() => mockHash),
  },
}));

describe('ApiKeyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateApiKey', () => {
    it('should generate and insert API key', async () => {
      const mockApiKey = { id: 1, key: 'hashed_key_hex' };
      (pool.query as any).mockResolvedValue({ rows: [mockApiKey] });

      const payload = {
        user_id: 'user1',
        name: 'Test Key',
        permissions: {},
      };

      const result = await apiKeyService.generateApiKey(payload);

      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO api_keys'),
        ['hashed_key_hex', 'user1', 'Test Key', {}, undefined]
      );
      expect(result).toEqual({ rawKey: 'raw_key_hex', apiKey: mockApiKey });
    });

    it('should throw AppError if insert fails', async () => {
      (pool.query as any).mockRejectedValue(new Error('DB Error'));

      await expect(apiKeyService.generateApiKey({ user_id: '1', name: 'k', permissions: {} }))
        .rejects.toThrow(AppError);
    });
  });

  describe('getApiKeyById', () => {
    it('should return api key', async () => {
      const mockKey = { id: 1 };
      (pool.query as any).mockResolvedValue({ rows: [mockKey] });

      const result = await apiKeyService.getApiKeyById(1);
      expect(result).toEqual(mockKey);
    });
  });

  describe('getApiKeyByRawKey', () => {
    it('should hash raw key and query', async () => {
      const mockKey = { id: 1 };
      (pool.query as any).mockResolvedValue({ rows: [mockKey] });

      await apiKeyService.getApiKeyByRawKey('raw_key');

      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM api_keys WHERE key = $1'),
        ['hashed_key_hex']
      );
    });
  });

  describe('getUserApiKeys', () => {
    it('should return keys for user', async () => {
      const mockKeys = [{ id: 1 }];
      (pool.query as any).mockResolvedValue({ rows: mockKeys });

      const result = await apiKeyService.getUserApiKeys('user1');
      expect(result).toEqual(mockKeys);
    });
  });

  describe('updateApiKey', () => {
    it('should update fields', async () => {
      const mockKey = { id: 1, name: 'New Name' };
      (pool.query as any).mockResolvedValue({ rows: [mockKey] });

      const result = await apiKeyService.updateApiKey(1, { name: 'New Name' });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE api_keys SET name = $1'),
        ['New Name', 1]
      );
      expect(result).toEqual(mockKey);
    });

    it('should throw NotFoundError if update affects no rows', async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      await expect(apiKeyService.updateApiKey(1, { name: 'New Name' }))
        .rejects.toThrow(NotFoundError);
    });

    it('should return existing key if no fields to update', async () => {
      const mockKey = { id: 1 };
      // Primeiro mocka o getById
      (pool.query as any).mockResolvedValueOnce({ rows: [mockKey] });

      const result = await apiKeyService.updateApiKey(1, {});
      
      expect(result).toEqual(mockKey);
      // Verifica se o update NÃO foi chamado (somente o select do getById)
      expect(pool.query).toHaveBeenCalledTimes(1); 
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM api_keys'), [1]);
    });
  });

  describe('deleteApiKey', () => {
    it('should delete key', async () => {
      (pool.query as any).mockResolvedValue({ rowCount: 1 });

      const result = await apiKeyService.deleteApiKey(1);
      expect(result).toBe(true);
    });
  });
});
