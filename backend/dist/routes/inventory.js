import { Router } from 'express';
import { z } from 'zod';
import { inventoryService } from '../services/inventoryService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError } from '../utils/errors.js';
const router = Router();
// Middleware to ensure user is authenticated
router.use(authMiddleware.authenticate);
// Zod Schemas
const adjustStockSchema = z.object({
    variationId: z.number().int().positive('Variation ID must be a positive integer'),
    quantityChange: z
        .number()
        .int()
        .refine((val) => val !== 0, 'Quantity change cannot be zero'),
    reason: z.string().min(1, 'Reason is required'),
    unitCost: z.number().positive('Unit cost must be a positive number').optional(),
});
const receiveDispatchStockSchema = z.object({
    variationId: z.number().int().positive('Variation ID must be a positive integer'),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
    unitCost: z.number().positive('Unit cost must be a positive number').optional(), // Making it optional here but receive will require it
});
const receiveStockSchema = receiveDispatchStockSchema.extend({
    unitCost: z.number().positive('Unit cost must be a positive number'),
});
// Validation Middleware
const validate = (schema) => (req, res, next) => {
    console.log('Running validation middleware');
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
router.get('/low-stock', authMiddleware.authorize('read', 'Inventory'), async (req, res, next) => {
    try {
        const threshold = req.query.threshold
            ? parseInt(req.query.threshold, 10)
            : undefined;
        const lowStockProducts = await inventoryService.getLowStockProducts(threshold);
        res.json(lowStockProducts);
    }
    catch (error) {
        next(error);
    }
});
router.put('/adjust-stock', authMiddleware.authorize('update', 'Inventory'), validate(adjustStockSchema), async (req, res, next) => {
    try {
        const { variationId, quantityChange, reason, unitCost } = req.body;
        const userId = req.user?.id;
        const updatedVariation = await inventoryService.adjustStock(variationId, quantityChange, reason, userId, undefined, unitCost);
        res.json(updatedVariation);
    }
    catch (error) {
        next(error);
    }
});
router.put('/receive-stock', authMiddleware.authorize('update', 'Inventory'), validate(receiveStockSchema), async (req, res, next) => {
    try {
        const { variationId, quantity, unitCost } = req.body;
        const userId = req.user?.id;
        const updatedVariation = await inventoryService.receiveStock(variationId, quantity, unitCost, userId);
        res.json(updatedVariation);
    }
    catch (error) {
        next(error);
    }
});
router.put('/dispatch-stock', authMiddleware.authorize('update', 'Inventory'), validate(receiveDispatchStockSchema), async (req, res, next) => {
    console.log('Received request for /dispatch-stock');
    try {
        console.log('Inside /dispatch-stock try block');
        const { variationId, quantity } = req.body;
        const updatedVariation = await inventoryService.dispatchStock(variationId, quantity);
        res.json(updatedVariation);
    }
    catch (error) {
        next(error);
    }
});
export default router;
