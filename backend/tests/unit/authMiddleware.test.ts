import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../src/middlewares/authMiddleware.js';
import jwt from 'jsonwebtoken';
import { userRepository } from '../../src/repositories/user.repository.js';

vi.mock('jsonwebtoken');
vi.mock('../../src/repositories/user.repository.js', () => ({
  userRepository: {
    findById: vi.fn(),
  },
}));

describe('authMiddleware', () => {
  let mockRequest: any;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      get: vi.fn(),
      ip: '127.0.0.1',
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should return 401 if no token is provided', async () => {
      await authMiddleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, message: 'No token provided' }),
      );
    });

    it('should call next and set req.user if token is valid', async () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'admin', permissions: [] };
      mockRequest.headers.authorization = 'Bearer validtoken';
      vi.mocked(jwt.verify).mockReturnValue(mockUser as any);
      vi.mocked(userRepository.findById).mockResolvedValue({ id: '1' } as any);

      await authMiddleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should return 401 if user does not exist in DB', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      mockRequest.headers.authorization = 'Bearer validtoken';
      vi.mocked(jwt.verify).mockReturnValue(mockUser as any);
      vi.mocked(userRepository.findById).mockResolvedValue(null);

      await authMiddleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = vi.mocked(mockNext).mock.calls[0][0] as any;
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('Usuário inexistente');
    });
  });

  describe('authorize', () => {
    it('should call next if user has the required permission', () => {
      mockRequest.user = { permissions: [{ action: 'read', subject: 'posts' }] };
      const middleware = authMiddleware.authorize('read', 'posts');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should return 403 if user does not have the required permission', () => {
      mockRequest.user = {
        email: 'test@test.com',
        permissions: [{ action: 'read', subject: 'posts' }],
      };
      const middleware = authMiddleware.authorize('manage', 'all');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });
  });
});
