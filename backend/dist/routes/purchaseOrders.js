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
import { purchaseOrderService } from '../services/purchaseOrderService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
const purchaseOrdersRouter = Router();
// Zod Schemas
const createPurchaseOrderItemSchema = z.object({
    product_id: z.number().int().positive('Product ID must be a positive integer'),
    variation_id: z.number().int().positive('Variation ID must be a positive integer'),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
    unit_price: z.number().positive('Unit price must be a positive number'),
});
const createPurchaseOrderSchema = z.object({
    supplier_id: z.number().int().positive('Supplier ID must be a positive integer'),
    expected_delivery_date: z.string().datetime('Invalid expected delivery date format').optional(),
    items: z.array(createPurchaseOrderItemSchema).min(1, 'A purchase order must have at least one item'),
});
const updatePurchaseOrderSchema = z.object({
    supplier_id: z.number().int().positive('Supplier ID must be a positive integer').optional(),
    expected_delivery_date: z.string().datetime('Invalid expected delivery date format').optional(),
    status: z.enum(['pending', 'ordered', 'received', 'cancelled'], { message: 'Invalid purchase order status' }).optional(),
    items: z.array(createPurchaseOrderItemSchema).optional(),
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
purchaseOrdersRouter.use(authMiddleware.authenticate);
purchaseOrdersRouter.use(authMiddleware.authorize('manage', 'PurchaseOrders')); // New permission for managing purchase orders
// Get all purchase orders
purchaseOrdersRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield purchaseOrderService.getAllPurchaseOrders();
        res.status(200).json(orders);
    }
    catch (error) {
        next(error);
    }
}));
// Get purchase order by ID
purchaseOrdersRouter.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield purchaseOrderService.getPurchaseOrderById(parseInt(req.params.id));
        if (!order) {
            throw new AppError('Purchase order not found', 404);
        }
        res.status(200).json(order);
    }
    catch (error) {
        next(error);
    }
}));
// Create a new purchase order
purchaseOrdersRouter.post('/', validate(createPurchaseOrderSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newOrder = yield purchaseOrderService.createPurchaseOrder(req.body);
        res.status(201).json(newOrder);
    }
    catch (error) {
        next(error);
    }
}));
// Update a purchase order by ID
purchaseOrdersRouter.put('/:id', validate(updatePurchaseOrderSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedOrder = yield purchaseOrderService.updatePurchaseOrder(parseInt(req.params.id), req.body);
        if (!updatedOrder) {
            throw new AppError('Purchase order not found', 404);
        }
        res.status(200).json(updatedOrder);
    }
    catch (error) {
        next(error);
    }
}));
// Delete a purchase order by ID
purchaseOrdersRouter.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield purchaseOrderService.deletePurchaseOrder(parseInt(req.params.id));
        if (!deleted) {
            throw new AppError('Purchase order not found', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
// Receive items for a purchase order (update stock)
purchaseOrdersRouter.post('/:id/receive', authMiddleware.authorize('receive', 'PurchaseOrders'), // New permission for receiving items
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = parseInt(req.params.id);
        const receivedItems = req.body.items; // Array of { variation_id, quantity }
        yield purchaseOrderService.receivePurchaseOrderItems(orderId, receivedItems);
        res.status(200).json({ message: 'Items received and stock updated successfully' });
    }
    catch (error) {
        next(error);
    }
}));
export default purchaseOrdersRouter;
