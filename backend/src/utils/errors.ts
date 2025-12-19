export class AppError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name; // Definido diretamente
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError'; // Definido diretamente
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors?: any) {
    super(message, 422, errors);
    this.name = 'ValidationError'; // Definido diretamente
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError'; // Definido diretamente
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'You are not authorized to perform this action') {
    super(message, 403);
    this.name = 'AuthorizationError'; // Definido diretamente
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}
