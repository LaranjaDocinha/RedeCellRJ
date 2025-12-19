import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import errorMiddleware from '../../src/middlewares/errorMiddleware.js';
import { AppError, AuthenticationError, AuthorizationError, NotFoundError, ValidationError, } from '../../src/utils/errors.js';
describe('errorMiddleware', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    let consoleErrorSpy;
    let originalNodeEnv;
    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
        };
        mockNext = vi.fn();
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        originalNodeEnv = process.env.NODE_ENV;
        vi.clearAllMocks();
    });
    afterEach(() => {
        consoleErrorSpy.mockRestore();
        process.env.NODE_ENV = originalNodeEnv; // Restore original NODE_ENV
    });
    // --- AppError Test Cases ---
    it('should handle AppError in development environment', () => {
        process.env.NODE_ENV = 'development';
        const error = new AppError('Test AppError', 400, { field: 'error' });
        errorMiddleware(error, mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Test AppError',
            errors: { field: 'error' },
        });
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(`AppError: 400 - Test AppError`, JSON.stringify({ field: 'error' }));
        expect(mockNext).not.toHaveBeenCalled();
    });
    it('should handle AppError in production environment', () => {
        process.env.NODE_ENV = 'production';
        const error = new AppError('Test AppError', 400);
        errorMiddleware(error, mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Test AppError',
        });
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(`AppError: 400 - Test AppError`, '');
        expect(mockNext).not.toHaveBeenCalled();
    });
    it('should handle AppError in test environment (no console.error)', () => {
        process.env.NODE_ENV = 'test';
        const error = new AppError('Test AppError', 400);
        errorMiddleware(error, mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Test AppError',
        });
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(mockNext).not.toHaveBeenCalled();
    });
    // --- Generic Error Test Cases ---
    it('should handle generic Error in development environment', () => {
        process.env.NODE_ENV = 'development';
        const error = new Error('Something went wrong');
        error.stack = 'Error Stack Trace';
        errorMiddleware(error, mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Something went wrong',
            stack: 'Error Stack Trace',
        });
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Internal Server Error:', error);
        expect(mockNext).not.toHaveBeenCalled();
    });
    it('should handle generic Error in production environment', () => {
        process.env.NODE_ENV = 'production';
        const error = new Error('Something went wrong');
        errorMiddleware(error, mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Internal Server Error',
        });
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Internal Server Error:', error);
        expect(mockNext).not.toHaveBeenCalled();
    });
    it('should handle generic Error in test environment (no console.error)', () => {
        process.env.NODE_ENV = 'test';
        const error = new Error('Something went wrong');
        errorMiddleware(error, mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Internal Server Error',
        });
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(mockNext).not.toHaveBeenCalled();
    });
    // --- Specific AppError subclasses test cases (brief examples) ---
    it('should handle AuthenticationError', () => {
        process.env.NODE_ENV = 'development';
        const error = new AuthenticationError();
        errorMiddleware(error, mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Authentication failed',
        });
    });
    it('should handle AuthorizationError', () => {
        process.env.NODE_ENV = 'development';
        const error = new AuthorizationError();
        errorMiddleware(error, mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'You are not authorized to perform this action',
        });
    });
    it('should handle NotFoundError', () => {
        process.env.NODE_ENV = 'development';
        const error = new NotFoundError();
        errorMiddleware(error, mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Resource not found',
        });
    });
    it('should handle ValidationError', () => {
        process.env.NODE_ENV = 'development';
        const error = new ValidationError('Validation failed', { name: 'required' });
        errorMiddleware(error, mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(422);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Validation failed',
            errors: { name: 'required' },
        });
    });
});
