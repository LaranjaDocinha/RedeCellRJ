import { AppError } from '../utils/errors.js';
const errorMiddleware = (err, req, res, next) => {
    if (err instanceof AppError) {
        const appError = err; // Explicitly cast to AppError
        // Log the error unless in a test environment
        if (process.env.NODE_ENV !== 'test') {
            console.error(`AppError: ${appError.statusCode} - ${appError.message}`, appError.errors ? JSON.stringify(appError.errors) : '');
        }
        return res.status(appError.statusCode).json(Object.assign({ status: 'error', message: appError.message }, (appError.errors && { errors: appError.errors })));
    }
    // Log the full error for unexpected errors, unless in a test environment
    if (process.env.NODE_ENV !== 'test') {
        console.error('Internal Server Error:', err);
    }
    // In a development environment, send detailed error information
    if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({
            status: 'error',
            message: err.message,
            stack: err.stack,
        });
    }
    // In a production environment, send a generic message
    return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
    });
};
export default errorMiddleware;
