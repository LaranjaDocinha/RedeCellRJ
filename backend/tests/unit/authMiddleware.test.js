import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMiddleware } from '../../src/middlewares/authMiddleware.js';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '../../src/utils/errors.js';
// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
    default: {
        verify: vi.fn(),
    },
}));
describe('authMiddleware', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    beforeEach(() => {
        mockRequest = {
            headers: {}, // Initialize headers
        };
        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
        };
        mockNext = vi.fn();
        vi.clearAllMocks();
    });
    describe('authenticate', () => {
        it('should return 401 if no token is provided', () => {
            authMiddleware.authenticate(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(new AuthenticationError('No token provided'));
        });
        it('should return 401 if token is invalid', () => {
            mockRequest.headers = { authorization: 'Bearer invalidtoken' };
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            authMiddleware.authenticate(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(new AuthenticationError('Invalid or expired token'));
        });
        it('should call next and set req.user if token is valid', () => {
            const mockUser = { id: 1, email: 'test@example.com', role: 'admin' };
            mockRequest.headers = { authorization: 'Bearer validtoken' };
            jwt.verify.mockReturnValue(mockUser);
            authMiddleware.authenticate(mockRequest, mockResponse, mockNext);
            expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
            expect(mockRequest.user).toEqual(mockUser);
            expect(mockNext).toHaveBeenCalledWith();
            expect(mockNext).toHaveBeenCalledTimes(1);
        });
        it('should call next even if token is valid but user info is missing', () => {
            const mockUser = { id: 1, email: 'test@example.com' }; // Missing role
            mockRequest.headers = { authorization: 'Bearer validtoken' };
            jwt.verify.mockReturnValue(mockUser);
            authMiddleware.authenticate(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith();
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockRequest.user).toEqual(mockUser);
        });
    });
    describe('authorize', () => {
        it('should call next if user has the required permission', () => {
            mockRequest.user = { permissions: [{ action: 'manage', subject: 'all' }] };
            const authorizeAction = authMiddleware.authorize('manage', 'all');
            authorizeAction(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith();
            expect(mockNext).toHaveBeenCalledTimes(1);
        });
        it('should return 403 if user does not have the required permission', () => {
            mockRequest.user = { permissions: [{ action: 'read', subject: 'posts' }] };
            const authorizeAction = authMiddleware.authorize('manage', 'all');
            authorizeAction(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(new AuthorizationError('You do not have permission to manage all'));
        });
        it('should return 401 if no user is in the request (not authenticated)', () => {
            const authorizeAction = authMiddleware.authorize('manage', 'all');
            authorizeAction(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(new AuthenticationError('User not authenticated'));
        });
    });
});
