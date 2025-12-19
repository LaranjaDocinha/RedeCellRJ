import { Router } from 'express';
import { searchService } from '../services/searchService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';
const router = Router();
// Zod Schema for query parameters
const searchQuerySchema = z.object({
    q: z.string().trim().nonempty('Query parameter "q" is required.'),
    entityType: z.enum(['products', 'customers', 'all']).optional(), // Adicionado entityType
});
// Zod Schema for suggestions query parameters (pode ser o mesmo ou mais flexível)
const suggestionsQuerySchema = z.object({
    q: z.string().trim().nonempty('Query parameter "q" is required.'),
    entityType: z.enum(['products', 'customers', 'all']).optional(), // Adicionado entityType
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
router.get('/', authMiddleware.authenticate, authMiddleware.authorize('read', 'Search'), // Assumindo que a autorização 'Search' é suficiente
validateQuery(searchQuerySchema), async (req, res, next) => {
    try {
        const { q, entityType } = req.query; // Extrair entityType
        const results = await searchService.performSearch(q, entityType);
        res.json(results);
    }
    catch (error) {
        next(error);
    }
});
// Nova rota para auto-sugestões
router.get('/suggestions', authMiddleware.authenticate, authMiddleware.authorize('read', 'Search'), // Mesma autorização para sugestões
validateQuery(suggestionsQuerySchema), async (req, res, next) => {
    try {
        const { q, entityType } = req.query; // Extrair entityType
        const suggestions = await searchService.getSuggestions(q, entityType);
        res.json(suggestions);
    }
    catch (error) {
        next(error);
    }
});
export default router;
