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
import { discountService } from '../services/discountService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
const discountsRouter = Router();
// Zod Schemas
const createDiscountSchema = z.object({
    name: z.string().trim().nonempty('Discount name is required'),
    type: z.enum(['percentage', 'fixed_amount'], { message: 'Discount type must be percentage or fixed_amount' }),
    value: z.number().positive('Discount value must be a positive number'),
    start_date: z.string().datetime('Invalid start date format'),
    end_date: z.string().datetime('Invalid end date format').optional(),
    min_purchase_amount: z.number().positive('Minimum purchase amount must be a positive number').optional(),
    max_uses: z.number().int().positive('Max uses must be a positive integer').optional(),
    is_active: z.boolean().optional(),
}).refine(data => {
    if (data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
        throw new AppError('End date cannot be before start date', 400);
    }
    return true;
});
const updateDiscountSchema = z.object({
    name: z.string().trim().nonempty('Discount name cannot be empty').optional(),
    type: z.enum(['percentage', 'fixed_amount'], { message: 'Discount type must be percentage or fixed_amount' }).optional(),
    value: z.number().positive('Discount value must be a positive number').optional(),
    start_date: z.string().datetime('Invalid start date format').optional(),
    end_date: z.string().datetime('Invalid end date format').optional(),
    min_purchase_amount: z.number().positive('Minimum purchase amount must be a positive number').optional(),
    max_uses: z.number().int().positive('Max uses must be a positive integer').optional(),
    is_active: z.boolean().optional(),
}).partial().refine(data => {
    if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
        throw new AppError('End date cannot be before start date', 400);
    }
    return true;
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
discountsRouter.use(authMiddleware.authenticate);
discountsRouter.use(authMiddleware.authorize('manage', 'Discounts')); // Only users with manage:Discounts permission can access these routes
// Get all discounts
discountsRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discounts = yield discountService.getAllDiscounts();
        res.status(200).json(discounts);
    }
    catch (error) {
        next(error);
    }
}));
// Get discount by ID
discountsRouter.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discount = yield discountService.getDiscountById(parseInt(req.params.id));
        if (!discount) {
            throw new AppError('Discount not found', 404);
        }
        res.status(200).json(discount);
    }
    catch (error) {
        next(error);
    }
}));
// Create a new discount
discountsRouter.post('/', validate(createDiscountSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newDiscount = yield discountService.createDiscount(req.body);
        res.status(201).json(newDiscount);
    }
    catch (error) {
        next(error);
    }
}));
// Update a discount by ID
discountsRouter.put('/:id', validate(updateDiscountSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedDiscount = yield discountService.updateDiscount(parseInt(req.params.id), req.body);
        if (!updatedDiscount) {
            throw new AppError('Discount not found', 404);
        }
        res.status(200).json(updatedDiscount);
    }
    catch (error) {
        next(error);
    }
}));
// Delete a discount by ID
discountsRouter.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield discountService.deleteDiscount(parseInt(req.params.id));
        if (!deleted) {
            throw new AppError('Discount not found', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
export default discountsRouter;
