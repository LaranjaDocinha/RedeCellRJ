import { Router, Request, Response, NextFunction } from 'express';
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
  items: z
    .array(createPurchaseOrderItemSchema)
    .min(1, 'A purchase order must have at least one item'),
});

const updatePurchaseOrderSchema = z
  .object({
    supplier_id: z.number().int().positive('Supplier ID must be a positive integer').optional(),
    expected_delivery_date: z.string().datetime('Invalid expected delivery date format').optional(),
    status: z
      .enum(['pending', 'ordered', 'received', 'cancelled'], {
        message: 'Invalid purchase order status',
      })
      .optional(),
    items: z.array(createPurchaseOrderItemSchema).optional(),
  })
  .partial();

// Validation Middleware
const validate =
  (schema: z.ZodObject<any, any, any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(
          new ValidationError(
            'Validation failed',
            error.errors.map((err) => ({ path: err.path.join('.'), message: err.message })),
          ),
        );
      }
      next(error);
    }
  };

purchaseOrdersRouter.use(authMiddleware.authenticate);
purchaseOrdersRouter.use(authMiddleware.authorize('manage', 'PurchaseOrders')); // New permission for managing purchase orders

// Get all purchase orders
purchaseOrdersRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await purchaseOrderService.getAllPurchaseOrders();
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
});

// Get purchase order by ID
purchaseOrdersRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await purchaseOrderService.getPurchaseOrderById(parseInt(req.params.id));
    if (!order) {
      throw new AppError('Purchase order not found', 404);
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
});

// Create a new purchase order
purchaseOrdersRouter.post(
  '/',
  validate(createPurchaseOrderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newOrder = await purchaseOrderService.createPurchaseOrder(req.body);
      res.status(201).json(newOrder);
    } catch (error) {
      next(error);
    }
  },
);

// Update a purchase order by ID
purchaseOrdersRouter.put(
  '/:id',
  validate(updatePurchaseOrderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedOrder = await purchaseOrderService.updatePurchaseOrder(
        parseInt(req.params.id),
        req.body,
      );
      if (!updatedOrder) {
        throw new AppError('Purchase order not found', 404);
      }
      res.status(200).json(updatedOrder);
    } catch (error) {
      next(error);
    }
  },
);

// Delete a purchase order by ID
purchaseOrdersRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await purchaseOrderService.deletePurchaseOrder(parseInt(req.params.id));
    if (!deleted) {
      throw new AppError('Purchase order not found', 404);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Receive items for a purchase order (update stock)
purchaseOrdersRouter.post(
  '/:id/receive',
  authMiddleware.authorize('receive', 'PurchaseOrders'), // New permission for receiving items
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderId = parseInt(req.params.id);
      const receivedItems = req.body.items; // Array of { variation_id, quantity }
      await purchaseOrderService.receivePurchaseOrderItems(orderId, receivedItems);
      res.status(200).json({ message: 'Items received and stock updated successfully' });
    } catch (error) {
      next(error);
    }
  },
);

export default purchaseOrdersRouter;
