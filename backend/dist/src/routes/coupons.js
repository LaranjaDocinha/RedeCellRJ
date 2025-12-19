import { Router } from 'express';
import { z } from 'zod';
import { couponService } from '../services/couponService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
const couponsRouter = Router();
// Zod Schemas
const createCouponSchema = z
    .object({
    code: z.string().trim().nonempty('Coupon code is required'),
    type: z.enum(['percentage', 'fixed_amount'], {
        message: 'Coupon type must be percentage or fixed_amount',
    }),
    value: z.number().positive('Coupon value must be a positive number'),
    start_date: z.string().datetime('Invalid start date format'),
    end_date: z.string().datetime('Invalid end date format').optional(),
    min_purchase_amount: z
        .number()
        .positive('Minimum purchase amount must be a positive number')
        .optional(),
    max_uses: z.number().int().positive('Max uses must be a positive integer').optional(),
    is_active: z.boolean().optional(),
})
    .refine((data) => {
    if (data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
        throw new AppError('End date cannot be before start date', 400);
    }
    return true;
});
const updateCouponSchema = z
    .object({
    code: z.string().trim().nonempty('Coupon code cannot be empty').optional(),
    type: z
        .enum(['percentage', 'fixed_amount'], {
        message: 'Coupon type must be percentage or fixed_amount',
    })
        .optional(),
    value: z.number().positive('Coupon value must be a positive number').optional(),
    start_date: z.string().datetime('Invalid start date format').optional(),
    end_date: z.string().datetime('Invalid end date format').optional(),
    min_purchase_amount: z
        .number()
        .positive('Minimum purchase amount must be a positive number')
        .optional(),
    max_uses: z.number().int().positive('Max uses must be a positive integer').optional(),
    is_active: z.boolean().optional(),
})
    .partial()
    .refine((data) => {
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
            return next(new ValidationError('Validation failed', error.errors.map((err) => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
couponsRouter.use(authMiddleware.authenticate);
couponsRouter.use(authMiddleware.authorize('manage', 'Coupon')); // Only users with manage:Coupon permission can access these routes
// Get all coupons
couponsRouter.get('/', async (req, res, next) => {
    try {
        const coupons = await couponService.getAllCoupons();
        res.status(200).json(coupons);
    }
    catch (error) {
        next(error);
    }
});
// Get coupon by code
couponsRouter.get('/:code', async (req, res, next) => {
    try {
        const coupon = await couponService.getCouponByCode(req.params.code);
        if (!coupon) {
            throw new AppError('Coupon not found', 404);
        }
        res.status(200).json(coupon);
    }
    catch (error) {
        next(error);
    }
});
// Create a new coupon
couponsRouter.post('/', validate(createCouponSchema), async (req, res, next) => {
    try {
        const newCoupon = await couponService.createCoupon(req.body);
        res.status(201).json(newCoupon);
    }
    catch (error) {
        next(error);
    }
});
// Update a coupon by code
couponsRouter.put('/:code', validate(updateCouponSchema), async (req, res, next) => {
    try {
        const updatedCoupon = await couponService.updateCoupon(req.params.code, req.body);
        if (!updatedCoupon) {
            throw new AppError('Coupon not found', 404);
        }
        res.status(200).json(updatedCoupon);
    }
    catch (error) {
        next(error);
    }
});
// Delete a coupon by code
couponsRouter.delete('/:code', async (req, res, next) => {
    try {
        const deleted = await couponService.deleteCouponByCode(req.params.code);
        if (!deleted) {
            throw new AppError('Coupon not found', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// Add a validation schema for apply coupon
const applyCouponSchema = z.object({
    code: z.string().trim().nonempty('Coupon code is required'),
    currentAmount: z.number().positive('Current amount must be a positive number'),
});
// Apply coupon to a given amount
couponsRouter.post('/apply', authMiddleware.authorize('apply', 'Coupon'), // Assuming a permission 'apply:Coupon'
validate(applyCouponSchema), async (req, res, next) => {
    try {
        const { code, currentAmount } = req.body;
        const finalAmount = await couponService.applyCoupon(code, currentAmount);
        res.status(200).json({ finalAmount });
    }
    catch (error) {
        next(error);
    }
});
export default couponsRouter;
