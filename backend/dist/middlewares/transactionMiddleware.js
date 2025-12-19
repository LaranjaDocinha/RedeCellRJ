// import { getCurrentTestClient } from '../../tests/testContext.js';
/**
 * This middleware is intended for use in the test environment only.
 * It retrieves the current transactional client from the test context
 * and attaches it to the Express request object for use in route handlers.
 */
export const transactionMiddleware = (req, res, next) => {
    // if (process.env.NODE_ENV === 'test') {
    //   // Attach the db client from the context to the request object
    //   (req as any).db = getCurrentTestClient();
    // }
    next();
};
