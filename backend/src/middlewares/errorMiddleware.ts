import { Request, Response, NextFunction } from 'express';
import {
  AppError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
} from '../utils/errors.js';

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  // Log a todos os erros, exceto em teste
  // Adicionar log detalhado do erro para depuração
  if (process.env.NODE_ENV !== 'test') {
    console.error('Erro no errorMiddleware:', err);
    console.error('Tipo do erro:', err.constructor.name);
    console.error('Mensagem do erro:', err.message);
    if (err instanceof AppError && err.errors) {
      console.error('Erros detalhados (AppError):', err.errors);
    }
    if (err.stack) {
      console.error('Stack trace:', err.stack);
    }
  }

  // Tratamento específico para cada tipo de erro conhecido
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errors: err.errors,
    });
  }
  
  if (err instanceof NotFoundError || err instanceof AuthenticationError || err instanceof AuthorizationError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }
  
  // Tratamento genérico para AppError (caso outras subclasses existam)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errors: err.errors,
    });
  }

  // Tratamento para erros inesperados
  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      status: 'error',
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};

export default errorMiddleware;

