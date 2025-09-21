import {
  AppError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
} from '../../src/utils/errors';

describe('AppError', () => {
  it('should create an instance of AppError with a message and status code', () => {
    const error = new AppError('Test Error', 500);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test Error');
    expect(error.statusCode).toBe(500);
    expect(error.errors).toBeUndefined();
  });

  it('should create an instance of AppError with a message, status code, and errors object', () => {
    const errors = { field: 'invalid' };
    const error = new AppError('Validation Failed', 400, errors);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Validation Failed');
    expect(error.statusCode).toBe(400);
    expect(error.errors).toEqual(errors);
  });

  it('should have the correct name property', () => {
    const error = new AppError('Test Error', 500);
    expect(error.name).toBe('AppError');
  });
});

describe('NotFoundError', () => {
  it('should create an instance of NotFoundError with default message and status code 404', () => {
    const error = new NotFoundError();
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
  });

  it('should create an instance of NotFoundError with a custom message and status code 404', () => {
    const error = new NotFoundError('User not found');
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.message).toBe('User not found');
    expect(error.statusCode).toBe(404);
  });

  it('should have the correct name property', () => {
    const error = new NotFoundError();
    expect(error.name).toBe('NotFoundError');
  });
});

describe('ValidationError', () => {
  it('should create an instance of ValidationError with default message and status code 422', () => {
    const error = new ValidationError();
    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Validation failed');
    expect(error.statusCode).toBe(422);
    expect(error.errors).toBeUndefined();
  });

  it('should create an instance of ValidationError with a custom message, status code 422, and errors object', () => {
    const errors = { email: 'invalid' };
    const error = new ValidationError('Invalid input', errors);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('Invalid input');
    expect(error.statusCode).toBe(422);
    expect(error.errors).toEqual(errors);
  });

  it('should have the correct name property', () => {
    const error = new ValidationError();
    expect(error.name).toBe('ValidationError');
  });
});

describe('AuthenticationError', () => {
  it('should create an instance of AuthenticationError with default message and status code 401', () => {
    const error = new AuthenticationError();
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Authentication failed');
    expect(error.statusCode).toBe(401);
  });

  it('should create an instance of AuthenticationError with a custom message and status code 401', () => {
    const error = new AuthenticationError('Invalid credentials');
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.message).toBe('Invalid credentials');
    expect(error.statusCode).toBe(401);
  });

  it('should have the correct name property', () => {
    const error = new AuthenticationError();
    expect(error.name).toBe('AuthenticationError');
  });
});

describe('AuthorizationError', () => {
  it('should create an instance of AuthorizationError with default message and status code 403', () => {
    const error = new AuthorizationError();
    expect(error).toBeInstanceOf(AuthorizationError);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('You are not authorized to perform this action');
    expect(error.statusCode).toBe(403);
  });

  it('should create an instance of AuthorizationError with a custom message and status code 403', () => {
    const error = new AuthorizationError('Access denied');
    expect(error).toBeInstanceOf(AuthorizationError);
    expect(error.message).toBe('Access denied');
    expect(error.statusCode).toBe(403);
  });

  it('should have the correct name property', () => {
    const error = new AuthorizationError();
    expect(error.name).toBe('AuthorizationError');
  });
});
