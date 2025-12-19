import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPool } from '../../src/db/index.js';
import { gdprService } from '../../src/services/gdprService.js';
import { logActivityService } from '../../src/services/logActivityService.js';
import { AppError } from '../../src/utils/errors.js';
// Mock the database pool and logActivityService
vi.mock('../../src/db/index.js', () => ({
    getPool: vi.fn(),
}));
vi.mock('../../src/services/logActivityService.js', () => ({
    logActivityService: {
        logActivity: vi.fn(),
    },
}));
describe('GdprService', () => {
    let mockQuery;
    beforeEach(() => {
        mockQuery = vi.fn();
        getPool.mockReturnValue({
            query: mockQuery,
        });
        vi.clearAllMocks();
    });
    describe('requestDataDeletion', () => {
        it('should anonymize user data and log activity', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // For UPDATE query
            const userId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
            const requestingUserId = 'req-user-id';
            await gdprService.requestDataDeletion('user', userId, requestingUserId);
            expect(mockQuery).toHaveBeenCalledTimes(2); // UPDATE users, UPDATE sales
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE users SET'), [
                expect.any(String),
                userId,
            ]);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE sales SET user_id = NULL'), [userId]);
            expect(logActivityService.logActivity).toHaveBeenCalledWith({
                userId: requestingUserId,
                action: 'GDPR Data Deletion Request (User)',
                resourceType: 'User',
                resourceId: userId,
                details: `User ${userId} data anonymized.`,
            });
        });
        it('should anonymize customer data and log activity', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // For UPDATE query
            const customerId = 'b1c2d3e4-f5a6-7890-1234-567890abcdef';
            const requestingUserId = 'req-user-id';
            await gdprService.requestDataDeletion('customer', customerId, requestingUserId);
            expect(mockQuery).toHaveBeenCalledTimes(2); // UPDATE customers, UPDATE sales
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE customers SET'), [
                expect.any(String),
                customerId,
            ]);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE sales SET customer_id = NULL'), [customerId]);
            expect(logActivityService.logActivity).toHaveBeenCalledWith({
                userId: requestingUserId,
                action: 'GDPR Data Deletion Request (Customer)',
                resourceType: 'Customer',
                resourceId: customerId,
                details: `Customer ${customerId} data anonymized.`,
            });
        });
        it('should throw AppError for invalid entity type', async () => {
            const invalidEntityType = 'invalid';
            const entityId = 'some-id';
            const requestingUserId = 'req-user-id';
            await expect(gdprService.requestDataDeletion(invalidEntityType, entityId, requestingUserId)).rejects.toThrow(AppError);
            expect(logActivityService.logActivity).not.toHaveBeenCalled();
        });
        it('should throw AppError if database operation fails', async () => {
            mockQuery.mockRejectedValueOnce(new Error('DB error'));
            const userId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
            const requestingUserId = 'req-user-id';
            await expect(gdprService.requestDataDeletion('user', userId, requestingUserId)).rejects.toThrow(AppError);
            expect(logActivityService.logActivity).not.toHaveBeenCalled();
        });
    });
    describe('requestDataExport', () => {
        it('should export user data and log activity', async () => {
            const userId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
            const requestingUserId = 'req-user-id';
            const mockUser = { id: userId, name: 'Test User', email: 'test@example.com' };
            const mockSales = [{ id: 'sale1', total_amount: 100 }];
            mockQuery.mockResolvedValueOnce({ rows: [mockUser] }); // For user query
            mockQuery.mockResolvedValueOnce({ rows: mockSales }); // For sales query
            const result = await gdprService.requestDataExport('user', userId, requestingUserId);
            expect(mockQuery).toHaveBeenCalledTimes(2);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT id, name, email'), [
                userId,
            ]);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM sales'), [
                userId,
            ]);
            expect(result).toEqual({ user: mockUser, sales: mockSales });
            expect(logActivityService.logActivity).toHaveBeenCalledWith({
                userId: requestingUserId,
                action: 'GDPR Data Export Request (User)',
                resourceType: 'User',
                resourceId: userId,
                details: `User ${userId} data exported.`,
            });
        });
        it('should export customer data and log activity', async () => {
            const customerId = 'b1c2d3e4-f5a6-7890-1234-567890abcdef';
            const requestingUserId = 'req-user-id';
            const mockCustomer = { id: customerId, name: 'Test Customer', email: 'customer@example.com' };
            const mockSales = [{ id: 'sale2', total_amount: 200 }];
            const mockStoreCredit = [{ id: 'sc1', amount: 50 }];
            mockQuery.mockResolvedValueOnce({ rows: [mockCustomer] }); // For customer query
            mockQuery.mockResolvedValueOnce({ rows: mockSales }); // For sales query
            mockQuery.mockResolvedValueOnce({ rows: mockStoreCredit }); // For store credit query
            const result = await gdprService.requestDataExport('customer', customerId, requestingUserId);
            expect(mockQuery).toHaveBeenCalledTimes(3);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT id, name, email, phone'), [customerId]);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM sales'), [
                customerId,
            ]);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM store_credit_transactions'), [customerId]);
            expect(result).toEqual({
                customer: mockCustomer,
                sales: mockSales,
                storeCreditTransactions: mockStoreCredit,
            });
            expect(logActivityService.logActivity).toHaveBeenCalledWith({
                userId: requestingUserId,
                action: 'GDPR Data Export Request (Customer)',
                resourceType: 'Customer',
                resourceId: customerId,
                details: `Customer ${customerId} data exported.`,
            });
        });
        it('should throw AppError if user not found for export', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [] }); // User not found
            const userId = 'non-existent-user-id';
            const requestingUserId = 'req-user-id';
            await expect(gdprService.requestDataExport('user', userId, requestingUserId)).rejects.toThrow(AppError);
            expect(logActivityService.logActivity).not.toHaveBeenCalled();
        });
        it('should throw AppError if customer not found for export', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [] }); // Customer not found
            const customerId = 'non-existent-customer-id';
            const requestingUserId = 'req-user-id';
            await expect(gdprService.requestDataExport('customer', customerId, requestingUserId)).rejects.toThrow(AppError);
            expect(logActivityService.logActivity).not.toHaveBeenCalled();
        });
        it('should throw AppError for invalid entity type', async () => {
            const invalidEntityType = 'invalid';
            const entityId = 'some-id';
            const requestingUserId = 'req-user-id';
            await expect(gdprService.requestDataExport(invalidEntityType, entityId, requestingUserId)).rejects.toThrow(AppError);
            expect(logActivityService.logActivity).not.toHaveBeenCalled();
        });
        it('should throw AppError if database operation fails during export', async () => {
            mockQuery.mockRejectedValueOnce(new Error('DB error'));
            const userId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
            const requestingUserId = 'req-user-id';
            await expect(gdprService.requestDataExport('user', userId, requestingUserId)).rejects.toThrow(AppError);
            expect(logActivityService.logActivity).not.toHaveBeenCalled();
        });
    });
});
