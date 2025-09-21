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
import { saleService } from '../services/saleService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
const salesRouter = Router();
// Zod Schemas
const saleItemSchema = z.object({
    product_id: z.number().int().positive('Product ID must be a positive integer'),
    variation_id: z.number().int().positive('Variation ID must be a positive integer'),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
});
const createSaleSchema = z.object({
    items: z.array(saleItemSchema).min(1, 'Items array cannot be empty'),
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
salesRouter.post('/', authMiddleware.authenticate, authMiddleware.authorize('create', 'Sale'), validate(createSaleSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { items } = req.body;
        const userId = req.user ? req.user.id : null; // Get user ID from authenticated request
        const newSale = yield saleService.createSale(userId, items);
        res.status(201).json(newSale);
    }
    catch (error) {
        next(error);
    }
}));
salesRouter.get('/', authMiddleware.authenticate, authMiddleware.authorize('read', 'Sale'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sales = yield saleService.getAllSales();
        res.status(200).json(sales);
    }
    catch (error) {
        next(error);
    }
}));
salesRouter.get('/:id', authMiddleware.authenticate, authMiddleware.authorize('read', 'Sale'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sale = yield saleService.getSaleById(parseInt(req.params.id));
        if (!sale) {
            throw new AppError('Sale not found', 404);
        }
        res.status(200).json(sale);
    }
    catch (error) {
        next(error);
    }
}));
export { salesRouter };
