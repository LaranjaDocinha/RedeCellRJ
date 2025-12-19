import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import * as activityFeedController from '../../../src/controllers/activityFeedController';
import * as activityFeedService from '../../../src/services/activityFeedService';

// Mock do activityFeedService
vi.mock('../../../src/services/activityFeedService', () => ({
  getFeed: vi.fn(),
}));

describe('ActivityFeedController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: vi.fn(),
      status: vi.fn(() => mockResponse),
    };
  });

  describe('getFeed', () => {
    it('should call getFeed service and return 200 with feed data', async () => {
      const mockFeed = [{ id: 1, action: 'User login' }];
      (activityFeedService.getFeed as any).mockResolvedValue(mockFeed);

      mockRequest.query = { branchId: '1', limit: '10', offset: '0' };

      await activityFeedController.getFeed(mockRequest as Request, mockResponse as Response);

      expect(activityFeedService.getFeed).toHaveBeenCalledWith(1, 10, 0);
      expect(mockResponse.json).toHaveBeenCalledWith(mockFeed);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle undefined query parameters', async () => {
      const mockFeed = [{ id: 1, action: 'User login' }];
      (activityFeedService.getFeed as any).mockResolvedValue(mockFeed);

      mockRequest.query = {};

      await activityFeedController.getFeed(mockRequest as Request, mockResponse as Response);

      expect(activityFeedService.getFeed).toHaveBeenCalledWith(undefined, undefined, undefined);
      expect(mockResponse.json).toHaveBeenCalledWith(mockFeed);
    });

    it('should return 500 if getFeed service throws an error', async () => {
      const errorMessage = 'DB Error';
      (activityFeedService.getFeed as any).mockRejectedValue(new Error(errorMessage));

      mockRequest.query = {}; // Define query para evitar erros de desestruturação, se houver

      await activityFeedController.getFeed(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      // O controller retorna o objeto de erro diretamente na propriedade 'error'
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error fetching activity feed',
        error: expect.any(Error),
      });
    });
  });
});
