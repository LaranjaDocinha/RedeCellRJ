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
import { inventoryService } from '../services/inventoryService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError } from '../utils/errors.js';
const router = Router();
// Middleware to ensure user is authenticated
router.use(authMiddleware.authenticate);
// Zod Schemas
const adjustStockSchema = z.object({
    variationId: z.number().int().positive('Variation ID must be a positive integer'),
    quantityChange: z.number().int('Quantity change must be an integer').refine(val => val !== 0, 'Quantity change cannot be zero'),
});
const receiveDispatchStockSchema = z.object({
    variationId: z.number().int().positive('Variation ID must be a positive integer'),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
});
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
router.get('/low-stock', authMiddleware.authorize('read', 'Inventory'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const threshold = req.query.threshold ? parseInt(req.query.threshold, 10) : undefined;
        const lowStockProducts = yield inventoryService.getLowStockProducts(threshold);
        res.json(lowStockProducts);
    }
    catch (error) {
        next(error);
    }
}));
router.put('/adjust-stock', authMiddleware.authorize('update', 'Inventory'), validate(adjustStockSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { variationId, quantityChange } = req.body;
        const updatedVariation = yield inventoryService.adjustStock(variationId, quantityChange);
        res.json(updatedVariation);
    }
    catch (error) {
        next(error);
    }
}));
router.put('/receive-stock', authMiddleware.authorize('update', 'Inventory'), validate(receiveDispatchStockSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { variationId, quantity } = req.body;
        const updatedVariation = yield inventoryService.receiveStock(variationId, quantity);
        res.json(updatedVariation);
    }
    catch (error) {
        next(error);
    }
}));
router.put('/dispatch-stock', authMiddleware.authorize('update', 'Inventory'), validate(receiveDispatchStockSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { variationId, quantity } = req.body;
        const updatedVariation = yield inventoryService.dispatchStock(variationId, quantity);
        res.json(updatedVariation);
    }
    catch (error) {
        next(error);
    }
}));
export default router;
