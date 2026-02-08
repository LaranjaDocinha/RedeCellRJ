import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiKeyController } from '../../../src/controllers/apiKeyController.js';
import { apiKeyService } from '../../../src/services/apiKeyService.js';
import { Request, Response } from 'express';
import { AppError } from '../../../src/utils/errors.js';

// Mock the service
vi.mock('../../../src/services/apiKeyService.js', () => ({
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
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = {
      user: { id: 1 },
      params: {},
      body: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  describe('generateApiKey', () => {
    it('should generate an API key and return 201', async () => {
      mockRequest.body = { name: 'My Test Key' };
      (apiKeyService.generateApiKey as vi.Mock).mockResolvedValue({
        rawKey: 'raw_abc',
        apiKey: { id: 1 },
      });

      await apiKeyController.generateApiKey(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(apiKeyService.generateApiKey).toHaveBeenCalledWith({
        name: 'My Test Key',
        user_id: 1,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ rawKey: 'raw_abc', apiKey: { id: 1 } });
    });

    it('should call next with error if validation fails', async () => {
      mockRequest.body = { name: '' }; // Too short

      await apiKeyController.generateApiKey(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(apiKeyService.generateApiKey).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateApiKey', () => {
    it('should update an API key', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'New Name' };
      (apiKeyService.updateApiKey as vi.Mock).mockResolvedValue({ id: 1, name: 'New Name' });

      await apiKeyController.updateApiKey(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(apiKeyService.updateApiKey).toHaveBeenCalledWith(1, { name: 'New Name' });
      expect(mockResponse.json).toHaveBeenCalledWith({ id: 1, name: 'New Name' });
    });

    it('should throw error for invalid ID', async () => {
      mockRequest.params = { id: 'abc' };

      await apiKeyController.updateApiKey(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
