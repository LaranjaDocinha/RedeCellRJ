var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import { z } from 'zod';
import { returnService } from '../services/returnService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
const returnsRouter = Router();
// Zod Schemas
const createReturnItemSchema = z.object({
    product_id: z.number().int().positive('Product ID must be a positive integer'),
    variation_id: z.number().int().positive('Variation ID must be a positive integer'),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
});
const createReturnSchema = z.object({
    sale_id: z.number().int().positive('Sale ID must be a positive integer'),
    reason: z.string().trim().optional(),
    items: z.array(createReturnItemSchema).min(1, 'At least one item must be returned'),
});
const updateReturnSchema = z.object({
    reason: z.string().trim().optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'completed'], { message: 'Invalid return status' }).optional(),
    refund_amount: z.number().positive('Refund amount must be a positive number').optional(),
}).partial();
// Validation Middleware
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ValidationError('Validation failed', error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
returnsRouter.use(authMiddleware.authenticate);
returnsRouter.use(authMiddleware.authorize('manage', 'Returns')); // Only users with manage:Returns permission can access these routes
// Get all returns
returnsRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const returns = yield returnService.getAllReturns();
        res.status(200).json(returns);
    }
    catch (error) {
        next(error);
    }
}));
// Get return by ID
returnsRouter.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const returnRecord = yield returnService.getReturnById(parseInt(req.params.id));
        if (!returnRecord) {
            throw new AppError('Return not found', 404);
        }
        res.status(200).json(returnRecord);
    }
    catch (error) {
        next(error);
    }
}));
// Create a new return
returnsRouter.post('/', validate(createReturnSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newReturn = yield returnService.createReturn(req.body);
        res.status(201).json(newReturn);
    }
    catch (error) {
        next(error);
    }
}));
// Update a return by ID
returnsRouter.put('/:id', validate(updateReturnSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedReturn = yield returnService.updateReturn(parseInt(req.params.id), req.body);
        if (!updatedReturn) {
            throw new AppError('Return not found', 404);
        }
        res.status(200).json(updatedReturn);
    }
    catch (error) {
        next(error);
    }
}));
// Delete a return by ID
returnsRouter.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield returnService.deleteReturn(parseInt(req.params.id));
        if (!deleted) {
            throw new AppError('Return not found', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
export default returnsRouter;
