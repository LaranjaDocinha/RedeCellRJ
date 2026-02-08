import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as partnerApiService from '../../../src/services/partnerApiService.js';

const mockQuery = vi.fn();
vi.mock('../../../src/db/index.js', () => ({
  getPool: vi.fn(() => ({
    query: mockQuery,
  })),
}));

describe('PartnerApiService', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe('createApiKey', () => {
    it('should create an API key', async () => {
      const mockKey = { id: 1, partner_name: 'Partner', api_key: 'hashed' };
      mockQuery.mockResolvedValueOnce({ rows: [mockKey] });

      const result = await partnerApiService.createApiKey('Partner', ['read']);
      expect(result).toEqual(mockKey);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO partner_api_keys'),
        ['Partner', expect.any(String), ['read'], undefined],
      );
    });
  });

  describe('revokeApiKey', () => {
    it('should revoke an API key', async () => {
      const mockKey = { id: 1, is_active: false };
      mockQuery.mockResolvedValueOnce({ rows: [mockKey] });

      const result = await partnerApiService.revokeApiKey(1);
      expect(result).toEqual(mockKey);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE partner_api_keys SET is_active = FALSE'),
        [1],
      );
    });
  });

  describe('getApiKeys', () => {
    it('should return all API keys', async () => {
      const keys = [{ id: 1 }];
      mockQuery.mockResolvedValueOnce({ rows: keys });

      const result = await partnerApiService.getApiKeys();
      expect(result).toEqual(keys);
    });
  });

  describe('authenticateApiKey', () => {
    it('should return key if valid', async () => {
      const mockKey = { id: 1, api_key: 'valid' };
      mockQuery.mockResolvedValueOnce({ rows: [mockKey] });

      const result = await partnerApiService.authenticateApiKey('valid');
      expect(result).toEqual(mockKey);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM partner_api_keys WHERE api_key = $1'),
        ['valid'],
      );
    });

    it('should return undefined if invalid', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const result = await partnerApiService.authenticateApiKey('invalid');
      expect(result).toBeUndefined();
    });
  });
});
