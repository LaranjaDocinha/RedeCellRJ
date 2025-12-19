import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import * as customerPortalController from '../../../src/controllers/customerPortalController.js';
import * as customerPortalService from '../../../src/services/customerPortalService.js';
import { AppError } from '../../../src/utils/errors.js';

// Mock the service
vi.mock('../../../src/services/customerPortalService.js');

describe('CustomerPortalController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            params: { customerId: '1' },
            body: {},
        };
        res = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };
        next = vi.fn();
        vi.clearAllMocks();
    });

    describe('getCustomerHistory', () => {
        it('should return customer history successfully', async () => {
            const mockHistory = [{ id: 1, action: 'login' }];
            vi.mocked(customerPortalService.getCustomerHistory).mockResolvedValue(mockHistory as any);

            await customerPortalController.getCustomerHistory(req as Request, res as Response, next);

            expect(customerPortalService.getCustomerHistory).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockHistory);
        });

        it('should call next with error if service throws', async () => {
            const error = new Error('Service error');
            vi.mocked(customerPortalService.getCustomerHistory).mockRejectedValue(error);

            await customerPortalController.getCustomerHistory(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updateCustomerData', () => {
        it('should update customer data successfully', async () => {
            const mockData = { name: 'Updated Name' };
            const mockResult = { success: true };
            req.body = { data: mockData };
            vi.mocked(customerPortalService.updateCustomerData).mockResolvedValue(mockResult as any);

            await customerPortalController.updateCustomerData(req as Request, res as Response, next);

            expect(customerPortalService.updateCustomerData).toHaveBeenCalledWith(1, mockData);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        it('should call next with error if service throws', async () => {
            const error = new AppError('Update failed', 400);
            vi.mocked(customerPortalService.updateCustomerData).mockRejectedValue(error);

            await customerPortalController.updateCustomerData(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getCustomerInvoices', () => {
        it('should return customer invoices successfully', async () => {
            const mockInvoices = [{ id: 101, amount: 100 }];
            vi.mocked(customerPortalService.getCustomerInvoices).mockResolvedValue(mockInvoices as any);

            await customerPortalController.getCustomerInvoices(req as Request, res as Response, next);

            expect(customerPortalService.getCustomerInvoices).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockInvoices);
        });

        it('should call next with error if service throws', async () => {
            const error = new Error('Database connection failed');
            vi.mocked(customerPortalService.getCustomerInvoices).mockRejectedValue(error);

            await customerPortalController.getCustomerInvoices(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getCustomerWarranties', () => {
        it('should return customer warranties successfully', async () => {
            const mockWarranties = [{ id: 202, item: 'Phone' }];
            vi.mocked(customerPortalService.getCustomerWarranties).mockResolvedValue(mockWarranties as any);

            await customerPortalController.getCustomerWarranties(req as Request, res as Response, next);

            expect(customerPortalService.getCustomerWarranties).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockWarranties);
        });

        it('should call next with error if service throws', async () => {
            const error = new Error('Something went wrong');
            vi.mocked(customerPortalService.getCustomerWarranties).mockRejectedValue(error);

            await customerPortalController.getCustomerWarranties(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
