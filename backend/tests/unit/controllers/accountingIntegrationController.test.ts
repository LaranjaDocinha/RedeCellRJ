import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import * as accountingIntegrationController from '../../../src/controllers/accountingIntegrationController';
import * as accountingIntegrationService from '../../../src/services/accountingIntegrationService';

// Mock do accountingIntegrationService
vi.mock('../../../src/services/accountingIntegrationService', () => ({
  syncSales: vi.fn(),
  syncExpenses: vi.fn(),
  getIntegrationStatus: vi.fn(),
}));

describe('AccountingIntegrationController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: vi.fn(),
      status: vi.fn(() => mockResponse), // Garante que .status().json() funcione
    };
  });

  describe('syncSales', () => {
    it('should call syncSales service and return 200 with result', async () => {
      const mockResult = { success: true, message: 'Sales synced' };
      (accountingIntegrationService.syncSales as any).mockResolvedValue(mockResult);

      mockRequest.body = { data: 'sales data' };

      await accountingIntegrationController.syncSales(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(accountingIntegrationService.syncSales).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 500 if syncSales service throws an error', async () => {
      const errorMessage = 'Failed to sync sales';
      (accountingIntegrationService.syncSales as any).mockRejectedValue(new Error(errorMessage));

      mockRequest.body = { data: 'sales data' };

      await accountingIntegrationController.syncSales(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(accountingIntegrationService.syncSales).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('syncExpenses', () => {
    it('should call syncExpenses service and return 200 with result', async () => {
      const mockResult = { success: true, message: 'Expenses synced' };
      (accountingIntegrationService.syncExpenses as any).mockResolvedValue(mockResult);

      mockRequest.body = { data: 'expenses data' };

      await accountingIntegrationController.syncExpenses(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(accountingIntegrationService.syncExpenses).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 500 if syncExpenses service throws an error', async () => {
      const errorMessage = 'Failed to sync expenses';
      (accountingIntegrationService.syncExpenses as any).mockRejectedValue(new Error(errorMessage));

      mockRequest.body = { data: 'expenses data' };

      await accountingIntegrationController.syncExpenses(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(accountingIntegrationService.syncExpenses).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('getStatus', () => {
    it('should call getIntegrationStatus service and return 200 with status', async () => {
      const mockStatus = { status: 'active', lastSync: '2025-01-01' };
      (accountingIntegrationService.getIntegrationStatus as any).mockResolvedValue(mockStatus);

      await accountingIntegrationController.getStatus(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(accountingIntegrationService.getIntegrationStatus).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockStatus);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 500 if getIntegrationStatus service throws an error', async () => {
      const errorMessage = 'Failed to get status';
      (accountingIntegrationService.getIntegrationStatus as any).mockRejectedValue(
        new Error(errorMessage),
      );

      await accountingIntegrationController.getStatus(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(accountingIntegrationService.getIntegrationStatus).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });
});
