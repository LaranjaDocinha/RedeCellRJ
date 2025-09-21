import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMiddleware } from '../../src/middlewares/authMiddleware.js';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

describe('authMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
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
      authMiddleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      mockRequest.headers = { authorization: 'Bearer invalidtoken' };
      (jwt.verify as vi.Mock).mockImplementation(() => { throw new Error('Invalid token'); });

      authMiddleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next and set req.user if token is valid', () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'admin' };
      mockRequest.headers = { authorization: 'Bearer validtoken' };
      (jwt.verify as vi.Mock).mockReturnValue(mockUser);

      authMiddleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 if token is valid but user info is missing', () => {
      const mockUser = { id: 1, email: 'test@example.com' }; // Missing role
      mockRequest.headers = { authorization: 'Bearer validtoken' };
      (jwt.verify as vi.Mock).mockReturnValue(mockUser);

      authMiddleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized: User information missing' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should call next if user has the required role', () => {
      mockRequest.user = { id: 1, email: 'test@example.com', role: 'admin' };
      const authorizeAdmin = authMiddleware.authorize(['admin']);

      authorizeAdmin(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have the required role', () => {
      mockRequest.user = { id: 1, email: 'test@example.com', role: 'user' };
      const authorizeAdmin = authMiddleware.authorize(['admin']);

      authorizeAdmin(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Forbidden: Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if no user is in the request (not authenticated)', () => {
      const authorizeAdmin = authMiddleware.authorize(['admin']);

      authorizeAdmin(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized: User not authenticated' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
