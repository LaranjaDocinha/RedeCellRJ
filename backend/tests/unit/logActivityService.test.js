import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPool } from '../../src/db/index.js';
import { logActivityService } from '../../src/services/logActivityService.js';
// Mock the database pool
vi.mock('../../src/db/index.js', () => ({
    getPool: vi.fn(),
}));
describe('LogActivityService', () => {
    let mockQuery;
    beforeEach(() => {
        mockQuery = vi.fn();
        getPool.mockReturnValue({
            query: mockQuery,
        });
        vi.clearAllMocks();
    });
    it('should successfully log an activity with all parameters', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
        const options = {
            userId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            action: 'User Updated Profile',
            resourceType: 'User',
            resourceId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            oldValue: { name: 'Old Name' },
            newValue: { name: 'New Name' },
            ipAddress: '192.168.1.1',
        };
        await logActivityService.logActivity(options);
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(`INSERT INTO audit_logs (user_id, action, details)
         VALUES ($1, $2, $3)`, [
            options.userId,
            options.action,
            JSON.stringify({
                resourceType: options.resourceType,
                resourceId: options.resourceId,
                oldValue: options.oldValue,
                newValue: options.newValue,
                ipAddress: options.ipAddress,
            }),
        ]);
    });
    it('should successfully log an activity with minimal parameters', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
        const options = {
            action: 'Application Started',
        };
        await logActivityService.logActivity(options);
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(`INSERT INTO audit_logs (user_id, action, details)
         VALUES ($1, $2, $3)`, [
            undefined, // userId is optional
            options.action,
            JSON.stringify({
                resourceType: undefined,
                resourceId: undefined,
                oldValue: undefined,
                newValue: undefined,
                ipAddress: undefined,
            }),
        ]);
    });
    it('should log an error if the database query fails', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        mockQuery.mockRejectedValueOnce(new Error('DB connection failed'));
        const options = {
            userId: 'some-user-id',
            action: 'Failed Action',
        };
        await logActivityService.logActivity(options);
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to log activity:', expect.any(Error));
        consoleErrorSpy.mockRestore();
    });
});
