import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import * as accountsController from '../../../src/controllers/accountsController';
import * as accountsService from '../../../src/services/accountsService';

// Mock do accountsService
vi.mock('../../../src/services/accountsService', () => ({
  createPayable: vi.fn(),
  getPayables: vi.fn(),
  updatePayableStatus: vi.fn(),
  createReceivable: vi.fn(),
  getReceivables: vi.fn(),
  updateReceivableStatus: vi.fn(),
}));

describe('AccountsController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: vi.fn(),
      status: vi.fn(() => mockResponse), // Garante que .status().json() funcione
    };
  });

  describe('createPayable', () => {
    it('should call createPayable service and return 201 with payable', async () => {
      const mockPayable = { id: 1, amount: 100, description: 'Test Payable' };
      (accountsService.createPayable as any).mockResolvedValue(mockPayable);

      mockRequest.body = { amount: 100, description: 'Test Payable' };

      await accountsController.createPayable(mockRequest as Request, mockResponse as Response);

      expect(accountsService.createPayable).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPayable);
    });

    it('should return 500 if createPayable service throws an error', async () => {
      const errorMessage = 'Failed to create payable';
      (accountsService.createPayable as any).mockRejectedValue(new Error(errorMessage));

      mockRequest.body = { amount: 100, description: 'Test Payable' };

      await accountsController.createPayable(mockRequest as Request, mockResponse as Response);

      expect(accountsService.createPayable).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('getPayables', () => {
    it('should call getPayables service and return 200 with payables', async () => {
      const mockPayables = [
        { id: 1, amount: 100 },
        { id: 2, amount: 200 },
      ];
      (accountsService.getPayables as any).mockResolvedValue(mockPayables);

      mockRequest.query = { branchId: '1', status: 'pending' };

      await accountsController.getPayables(mockRequest as Request, mockResponse as Response);

      expect(accountsService.getPayables).toHaveBeenCalledWith(1, 'pending', undefined, undefined);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPayables);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle undefined query parameters', async () => {
      const mockPayables = [{ id: 1, amount: 100 }];
      (accountsService.getPayables as any).mockResolvedValue(mockPayables);

      mockRequest.query = {};

      await accountsController.getPayables(mockRequest as Request, mockResponse as Response);

      expect(accountsService.getPayables).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockPayables);
    });

    it('should return 500 if getPayables service throws an error', async () => {
      const errorMessage = 'Failed to get payables';
      (accountsService.getPayables as any).mockRejectedValue(new Error(errorMessage));

      mockRequest.query = {}; // Garante que query não seja undefined

      await accountsController.getPayables(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('updatePayableStatus', () => {
    it('should call updatePayableStatus service and return 200 with updated payable', async () => {
      const mockUpdatedPayable = { id: 1, status: 'paid' };
      (accountsService.updatePayableStatus as any).mockResolvedValue(mockUpdatedPayable);

      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 'paid', paidDate: '2025-01-01' };

      await accountsController.updatePayableStatus(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(accountsService.updatePayableStatus).toHaveBeenCalledWith(1, 'paid', '2025-01-01');
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedPayable);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 404 if payable not found', async () => {
      (accountsService.updatePayableStatus as any).mockResolvedValue(null);

      mockRequest.params = { id: '999' };
      mockRequest.body = { status: 'paid' };

      await accountsController.updatePayableStatus(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(accountsService.updatePayableStatus).toHaveBeenCalledWith(999, 'paid', undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Payable not found' });
    });

    it('should return 500 if updatePayableStatus service throws an error', async () => {
      const errorMessage = 'Failed to update payable status';
      (accountsService.updatePayableStatus as any).mockRejectedValue(new Error(errorMessage));

      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 'paid' };

      await accountsController.updatePayableStatus(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('createReceivable', () => {
    it('should call createReceivable service and return 201 with receivable', async () => {
      const mockReceivable = { id: 1, amount: 100, description: 'Test Receivable' };
      (accountsService.createReceivable as any).mockResolvedValue(mockReceivable);

      mockRequest.body = { amount: 100, description: 'Test Receivable' };

      await accountsController.createReceivable(mockRequest as Request, mockResponse as Response);

      expect(accountsService.createReceivable).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockReceivable);
    });

    it('should return 500 if createReceivable service throws an error', async () => {
      const errorMessage = 'Failed to create receivable';
      (accountsService.createReceivable as any).mockRejectedValue(new Error(errorMessage));

      mockRequest.body = { amount: 100, description: 'Test Receivable' };

      await accountsController.createReceivable(mockRequest as Request, mockResponse as Response);

      expect(accountsService.createReceivable).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('getReceivables', () => {
    it('should call getReceivables service and return 200 with receivables', async () => {
      const mockReceivables = [
        { id: 1, amount: 100 },
        { id: 2, amount: 200 },
      ];
      (accountsService.getReceivables as any).mockResolvedValue(mockReceivables);

      mockRequest.query = { branchId: '1', status: 'pending' };

      await accountsController.getReceivables(mockRequest as Request, mockResponse as Response);

      expect(accountsService.getReceivables).toHaveBeenCalledWith(
        1,
        'pending',
        undefined,
        undefined,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockReceivables);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle undefined query parameters', async () => {
      const mockReceivables = [{ id: 1, amount: 100 }];
      (accountsService.getReceivables as any).mockResolvedValue(mockReceivables);

      mockRequest.query = {};

      await accountsController.getReceivables(mockRequest as Request, mockResponse as Response);

      expect(accountsService.getReceivables).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockReceivables);
    });

    it('should return 500 if getReceivables service throws an error', async () => {
      const errorMessage = 'Failed to get receivables';
      (accountsService.getReceivables as any).mockRejectedValue(new Error(errorMessage));

      mockRequest.query = {}; // Garante que query não seja undefined

      await accountsController.getReceivables(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('updateReceivableStatus', () => {
    it('should call updateReceivableStatus service and return 200 with updated receivable', async () => {
      const mockUpdatedReceivable = { id: 1, status: 'received' };
      (accountsService.updateReceivableStatus as any).mockResolvedValue(mockUpdatedReceivable);

      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 'received', receivedDate: '2025-01-01' };

      await accountsController.updateReceivableStatus(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(accountsService.updateReceivableStatus).toHaveBeenCalledWith(
        1,
        'received',
        '2025-01-01',
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedReceivable);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 404 if receivable not found', async () => {
      (accountsService.updateReceivableStatus as any).mockResolvedValue(null);

      mockRequest.params = { id: '999' };
      mockRequest.body = { status: 'received' };

      await accountsController.updateReceivableStatus(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(accountsService.updateReceivableStatus).toHaveBeenCalledWith(
        999,
        'received',
        undefined,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Receivable not found' });
    });

    it('should return 500 if updateReceivableStatus service throws an error', async () => {
      const errorMessage = 'Failed to update receivable status';
      (accountsService.updateReceivableStatus as any).mockRejectedValue(new Error(errorMessage));

      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 'received' };

      await accountsController.updateReceivableStatus(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });
});
