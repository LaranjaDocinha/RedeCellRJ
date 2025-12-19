import { AppError, ValidationError, NotFoundError, AuthenticationError, AuthorizationError, } from '../utils/errors.js';
const errorMiddleware = (err, req, res, next) => {
    // Log a todos os erros, exceto em teste
    if (process.env.NODE_ENV !== 'test') {
        console.error(err);
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
