import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import errorMiddleware from '../../src/middlewares/errorMiddleware.js';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from '../../src/utils/errors.js';

describe('errorMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;
  let mockNext: NextFunction;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      req: mockRequest,
    };
    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    originalNodeEnv = process.env.NODE_ENV;
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should handle AppError in development environment', () => {
    process.env.NODE_ENV = 'development';
    const error = new AppError('Test AppError', 400, { field: 'error' });

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'fail',
        data: expect.objectContaining({
          field: 'error',
        }),
      }),
    );
  });

  it('should handle generic Error in production environment', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Something went wrong');

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR',
      }),
    );
  });

  it('should handle AuthenticationError', () => {
    const error = new AuthenticationError();
    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'fail',
        data: expect.objectContaining({
          message: 'Authentication failed',
        }),
      }),
    );
  });

  it('should handle AuthorizationError', () => {
    const error = new AuthorizationError();
    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'fail',
        data: expect.objectContaining({
          message: 'You are not authorized to perform this action',
        }),
      }),
    );
  });

  it('should handle NotFoundError', () => {
    const error = new NotFoundError();
    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'fail',
        data: expect.objectContaining({
          message: 'Resource not found',
        }),
      }),
    );
  });

  it('should handle ValidationError', () => {
    const error = new ValidationError('Validation failed', { name: 'required' });
    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'fail',
        data: expect.objectContaining({
          name: 'required',
        }),
      }),
    );
  });
});
