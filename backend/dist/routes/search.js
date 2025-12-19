import { Router } from 'express';
import * as searchService from '../services/searchService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';
const router = Router();
// Zod Schema for query parameters
const searchQuerySchema = z.object({
    q: z.string().trim().nonempty('Query parameter "q" is required.'),
});
// Validation Middleware for query parameters
const validateQuery = (schema) => (req, res, next) => {
    try {
        schema.parse(req.query);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ValidationError('Validation failed', error.errors.map((err) => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
router.get('/', authMiddleware.authenticate, authMiddleware.authorize('read', 'Search'), validateQuery(searchQuerySchema), async (req, res, next) => {
    try {
        const query = req.query.q;
        const results = await searchService.performSearch(query);
        res.json(results);
    }
    catch (error) {
        next(error);
    }
});
export default router;
