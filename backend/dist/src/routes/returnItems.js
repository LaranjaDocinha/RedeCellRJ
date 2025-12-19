import { Router } from 'express';
import { z } from 'zod';
import { returnService } from '../services/returnService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError } from '../utils/errors.js';
const returnItemsRouter = Router();
// Zod Schema for inspection
const inspectReturnItemSchema = z.object({
    inspection_status: z.enum(['approved', 'rejected'], { message: 'Invalid inspection status' }),
    inspection_notes: z.string().trim().optional(),
});
// Validation Middleware
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ValidationError('Validation failed', error.errors.map((err) => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
returnItemsRouter.use(authMiddleware.authenticate);
returnItemsRouter.use(authMiddleware.authorize('manage', 'Returns')); // Or a more specific permission like 'inspect_returns'
// Inspect a return item
returnItemsRouter.post('/:id/inspect', validate(inspectReturnItemSchema), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { inspection_status, inspection_notes } = req.body;
        const updatedItem = await returnService.inspectReturnItem(parseInt(id), inspection_status, inspection_notes || '');
        res.status(200).json(updatedItem);
    }
    catch (error) {
        next(error);
    }
});
export default returnItemsRouter;
