import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { apiKeyController } from '../../../src/controllers/apiKeyController';
import { apiKeyService } from '../../../src/services/apiKeyService';
import { AppError } from '../../../src/utils/errors';

// Mock do apiKeyService
vi.mock('../../../src/services/apiKeyService', () => ({
  apiKeyService: {
    generateApiKey: vi.fn(),
    getUserApiKeys: vi.fn(),
    updateApiKey: vi.fn(),
    deleteApiKey: vi.fn(),
  },
}));

describe('ApiKeyController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = {
      body: {},
      params: {},
      // Mock req.user para testes que dependem de autenticação
      user: { id: 1, email: 'test@example.com' },
    };
    mockResponse = {
      json: vi.fn(),
      status: vi.fn(() => mockResponse), // Garante que .status().json() funcione
      send: vi.fn(),
    };
    mockNext = vi.fn(); // Mock da função next
  });

  describe('generateApiKey', () => {
    it('should generate an API key and return 201', async () => {
      const mockApiKey = { rawKey: 'raw_test_key', apiKey: { id: 1, name: 'test-key' } };
      (apiKeyService.generateApiKey as any).mockResolvedValue(mockApiKey);

      mockRequest.body = { name: 'My Test Key', permissions: { users: ['read'] } };

      await apiKeyController.generateApiKey(mockRequest as Request, mockResponse as Response, mockNext);

      expect(apiKeyService.generateApiKey).toHaveBeenCalledWith({
        ...mockRequest.body,
        user_id: (mockRequest.user as any).id,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockApiKey);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error if generation fails due to service error', async () => {
      const errorMessage = 'Failed to generate key';
      const error = new Error(errorMessage);
      (apiKeyService.generateApiKey as any).mockRejectedValue(error);

      mockRequest.body = { name: 'My Test Key' };

      await apiKeyController.generateApiKey(mockRequest as Request, mockResponse as Response, mockNext);

      expect(apiKeyService.generateApiKey).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with error if validation fails', async () => {
      mockRequest.body = { name: 'a' }; // Nome muito curto para passar na validação Zod

      await apiKeyController.generateApiKey(mockRequest as Request, mockResponse as Response, mockNext);

      expect(apiKeyService.generateApiKey).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].issues[0].message).toContain('at least 3 characters');
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('getUserApiKeys', () => {
    it('should return all API keys for the user', async () => {
      const mockKeys = [{ id: 1, name: 'Key 1' }];
      (apiKeyService.getUserApiKeys as any).mockResolvedValue(mockKeys);

      await apiKeyController.getUserApiKeys(mockRequest as Request, mockResponse as Response, mockNext);

      expect(apiKeyService.getUserApiKeys).toHaveBeenCalledWith((mockRequest.user as any).id);
      expect(mockResponse.json).toHaveBeenCalledWith(mockKeys);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error if fetching keys fails', async () => {
      const errorMessage = 'Failed to fetch keys';
      const error = new Error(errorMessage);
      (apiKeyService.getUserApiKeys as any).mockRejectedValue(error);

      await apiKeyController.getUserApiKeys(mockRequest as Request, mockResponse as Response, mockNext);

      expect(apiKeyService.getUserApiKeys).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('updateApiKey', () => {
    it('should update an API key and return 200', async () => {
      const mockUpdatedKey = { id: 1, name: 'Updated Key' };
      (apiKeyService.updateApiKey as any).mockResolvedValue(mockUpdatedKey);

      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Updated Key' };

      await apiKeyController.updateApiKey(mockRequest as Request, mockResponse as Response, mockNext);

      expect(apiKeyService.updateApiKey).toHaveBeenCalledWith(1, mockRequest.body);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedKey);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with AppError for invalid ID', async () => {
      mockRequest.params = { id: 'invalid' };

      await apiKeyController.updateApiKey(mockRequest as Request, mockResponse as Response, mockNext);

      expect(apiKeyService.updateApiKey).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].message).toBe('Invalid API Key ID');
    });

    it('should call next with error if update fails due to service error', async () => {
      const errorMessage = 'Failed to update key';
      const error = new Error(errorMessage);
      (apiKeyService.updateApiKey as any).mockRejectedValue(error);

      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Updated Key' };

      await apiKeyController.updateApiKey(mockRequest as Request, mockResponse as Response, mockNext);

      expect(apiKeyService.updateApiKey).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with error if validation fails', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'a' }; // Nome muito curto para passar na validação Zod

      await apiKeyController.updateApiKey(mockRequest as Request, mockResponse as Response, mockNext);

      expect(apiKeyService.updateApiKey).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].issues[0].message).toContain('at least 3 characters');
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('deleteApiKey', () => {
    it('should delete an API key and return 204', async () => {
      (apiKeyService.deleteApiKey as any).mockResolvedValue(true);

      mockRequest.params = { id: '1' };

      await apiKeyController.deleteApiKey(mockRequest as Request, mockResponse as Response, mockNext);

      expect(apiKeyService.deleteApiKey).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with AppError for invalid ID', async () => {
      mockRequest.params = { id: 'invalid' };

      await apiKeyController.deleteApiKey(mockRequest as Request, mockResponse as Response, mockNext);

      expect(apiKeyService.deleteApiKey).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].message).toBe('Invalid API Key ID');
    });

    it('should call next with error if deletion fails due to service error', async () => {
      const errorMessage = 'Failed to delete key';
      const error = new Error(errorMessage);
      (apiKeyService.deleteApiKey as any).mockRejectedValue(error);

      mockRequest.params = { id: '1' };

      await apiKeyController.deleteApiKey(mockRequest as Request, mockResponse as Response, mockNext);

      expect(apiKeyService.deleteApiKey).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.send).not.toHaveBeenCalled();
    });
  });
});
