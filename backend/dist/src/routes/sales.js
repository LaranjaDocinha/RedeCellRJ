import { Router } from 'express';
import { z } from 'zod';
import { saleService } from '../services/saleService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { AppError } from '../utils/errors.js';
import { getSalesHistoryController, getSaleDetailsController, } from '../controllers/salesHistoryController.js';
import { validate } from '../middlewares/validationMiddleware.js';
const salesRouter = Router();
// Zod Schemas
const saleItemSchema = z
    .object({
    product_id: z.number().int().positive('Product ID must be a positive integer').optional(), // Tornar opcional para kits
    variation_id: z.number().int().positive('Variation ID must be a positive integer').optional(), // Tornar opcional para kits
    quantity: z.number().int().positive('Quantity must be a positive integer'),
    unit_price: z.number().positive('Unit price must be a positive number'),
    kit_id: z.number().int().positive('Kit ID must be a positive integer').optional(), // Adicionar kit_id
})
    .refine((item) => (item.product_id && item.variation_id) || item.kit_id, {
    message: 'Either product_id/variation_id or kit_id must be provided',
});
const paymentSchema = z.object({
    method: z.string().min(1, 'Payment method is required'),
    amount: z.number().positive('Amount must be a positive number'),
    transactionId: z.string().optional(),
    status: z.enum(['pending', 'completed', 'failed']).optional().default('completed'),
});
const createSaleSchema = z.object({
    items: z.array(saleItemSchema).min(1, 'Items array cannot be empty'),
    payment_type: z.enum(['cash', 'installment', 'credit_sale', 'mixed', 'pix'], {
        errorMap: () => ({ message: 'Payment type must be "cash", "installment", "credit_sale", "mixed" or "pix"' }),
    }),
    payments: z.array(paymentSchema).min(1, 'At least one payment is required'),
    total_installments: z
        .number()
        .int()
        .positive('Total installments must be a positive integer')
        .optional(),
    interest_rate: z.number().min(0, 'Interest rate cannot be negative').optional(),
    customerId: z.string().uuid().nullable().optional(),
    branchId: z.number().int().positive().optional(),
});
salesRouter.post('/', authMiddleware.authenticate, authMiddleware.authorize('create', 'Sale'), validate(createSaleSchema), async (req, res, next) => {
    try {
        const { items, payment_type, payments, total_installments, interest_rate } = req.body;
        const userId = req.user ? req.user.id : null; // Get user ID from authenticated request
        const newSale = await saleService.createSale({
            userId,
            items,
            payment_type,
            payments,
            total_installments,
            interest_rate,
            // customerId and branchId are not yet handled by this route's validation
            // but the service layer can accept them.
            customerId: req.body.customerId,
            branchId: req.body.branchId,
        });
        res.status(201).json(newSale);
    }
    catch (error) {
        next(error);
    }
});
salesRouter.get('/', authMiddleware.authenticate, authMiddleware.authorize('read', 'Sale'), async (req, res, next) => {
    console.log('Accessing GET /sales route.');
    try {
        const sales = await saleService.getAllSales();
        res.status(200).json(sales);
    }
    catch (error) {
        next(error);
    }
});
salesRouter.get('/:id', authMiddleware.authenticate, authMiddleware.authorize('read', 'Sale'), async (req, res, next) => {
    try {
        const sale = await saleService.getSaleById(parseInt(req.params.id));
        if (!sale) {
            throw new AppError('Sale not found', 404);
        }
        res.status(200).json(sale);
    }
    catch (error) {
        next(error);
    }
});
salesRouter.get('/history', authMiddleware.authenticate, authMiddleware.authorize('read', 'Sale'), getSalesHistoryController);
salesRouter.get('/history/:saleId', authMiddleware.authenticate, authMiddleware.authorize('read', 'Sale'), getSaleDetailsController);
export default salesRouter;
