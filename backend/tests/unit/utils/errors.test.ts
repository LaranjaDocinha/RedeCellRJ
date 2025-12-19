// backend/tests/unit/utils/errors.test.ts
import { describe, it, expect } from 'vitest';
import { AppError, NotFoundError, ValidationError, AuthenticationError, AuthorizationError } from '../../../src/utils/errors.js';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an instance of AppError with correct properties', () => {
      const message = 'Something went wrong';
      const statusCode = 500;
      const errors = { detail: 'Internal server error' };
      const error = new AppError(message, statusCode, errors);

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
      expect(error.errors).toBe(errors);
      expect(error.name).toBe('AppError');
    });

    it('should create an instance without optional errors', () => {
      const message = 'Another error';
      const statusCode = 400;
      const error = new AppError(message, statusCode);

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
      expect(error.errors).toBeUndefined();
      expect(error.name).toBe('AppError');
    });
  });

  describe('NotFoundError', () => {
    it('should create an instance of NotFoundError with default properties', () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(NotFoundError);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
      expect(error.errors).toBeUndefined();
    });

    it('should create an instance of NotFoundError with a custom message', () => {
      const customMessage = 'User not found';
      const error = new NotFoundError(customMessage);

      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe(customMessage);
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('ValidationError', () => {
    it('should create an instance of ValidationError with default properties', () => {
      const error = new ValidationError();

      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(422);
      expect(error.name).toBe('ValidationError');
      expect(error.errors).toBeUndefined();
    });

    it('should create an instance of ValidationError with custom message and errors', () => {
      const customMessage = 'Invalid input';
      const validationErrors = [{ field: 'email', message: 'Invalid format' }];
      const error = new ValidationError(customMessage, validationErrors);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe(customMessage);
      expect(error.statusCode).toBe(422);
      expect(error.name).toBe('ValidationError');
      expect(error.errors).toBe(validationErrors);
    });
  });

  describe('AuthenticationError', () => {
    it('should create an instance of AuthenticationError with default properties', () => {
      const error = new AuthenticationError();

      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Authentication failed');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
      expect(error.errors).toBeUndefined();
    });

    it('should create an instance of AuthenticationError with a custom message', () => {
      const customMessage = 'Token expired';
      const error = new AuthenticationError(customMessage);

      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toBe(customMessage);
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });
  });

  describe('AuthorizationError', () => {
    it('should create an instance of AuthorizationError with default properties', () => {
      const error = new AuthorizationError();

      expect(error).toBeInstanceOf(AuthorizationError);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('You are not authorized to perform this action');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
      expect(error.errors).toBeUndefined();
    });

    it('should create an instance of AuthorizationError with a custom message', () => {
      const customMessage = 'Admin access required';
      const error = new AuthorizationError(customMessage);

      expect(error).toBeInstanceOf(AuthorizationError);
      expect(error.message).toBe(customMessage);
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });
  });
});