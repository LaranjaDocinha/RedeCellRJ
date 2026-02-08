import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  AppError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
} from '../utils/errors.js';
import { sendError } from '../utils/responseHelper.js';

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR] Caught in errorMiddleware:', {
      type: err.constructor.name,
      message: err.message,
      requestId: (req as any).requestId,
      stack: err.stack,
    });
  }

  if (err instanceof ZodError) {
    return sendError(res, 'Validation failed', 'VALIDATION_ERROR', 400, err.errors);
  }

  if (err instanceof ValidationError) {
    return sendError(res, err.message, 'VALIDATION_ERROR', err.statusCode, err.errors);
  }

  if (err instanceof NotFoundError) {
    return sendError(res, err.message, 'NOT_FOUND', err.statusCode);
  }

  if (err instanceof AuthenticationError) {
    return sendError(res, err.message, 'AUTHENTICATION_ERROR', err.statusCode);
  }

  if (err instanceof AuthorizationError) {
    return sendError(res, err.message, 'FORBIDDEN', err.statusCode);
  }

  if (err instanceof AppError) {
    return sendError(res, err.message, 'APP_ERROR', err.statusCode, err.errors);
  }

  // Unexpected errors
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error';
  return sendError(res, message, 'INTERNAL_SERVER_ERROR', 500);
};

export default errorMiddleware;
