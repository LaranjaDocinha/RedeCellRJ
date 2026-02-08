import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { inventoryService } from '../services/inventoryService.js';
import { aiInventoryService } from '../services/aiInventoryService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

import { ValidationError } from '../utils/errors.js';

import { inventoryAnalyticsController } from '../controllers/inventoryAnalyticsController.js';
import { ResponseHelper } from '../utils/responseHelper.js';

const router = Router();

// Middleware to ensure user is authenticated
router.use(authMiddleware.authenticate);

// Zod Schemas
const adjustStockSchema = z.object({
  quantityChange: z
    .number()
    .int()
    .refine((val) => val !== 0, 'Quantity change cannot be zero'),
  reason: z.string().min(1, 'Reason is required'),
  unitCost: z.number().positive('Unit cost must be a positive number').optional(),
  branchId: z.number().int().positive('Branch ID is required').optional(), // Added branchId
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
const validate =
  (schema: z.ZodObject<any, any, any> | z.ZodEffects<any, any, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    console.log('Running validation middleware');
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

router.get(
  '/',
  authMiddleware.authorize('read', 'Inventory'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branchId = req.user?.branch_id || 1;
      const inventory = await inventoryService.getAllInventory(branchId);
      ResponseHelper.success(res, inventory);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/low-stock',
  authMiddleware.authorize('read', 'Inventory'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const threshold = req.query.threshold
        ? parseInt(req.query.threshold as string, 10)
        : undefined;
      const lowStockProducts = await inventoryService.getLowStockProducts(threshold);
      ResponseHelper.success(res, lowStockProducts);
    } catch (error) {
      next(error);
    }
  },
);

// Nova rota para sugestões de pedidos de compra (Inteligente)
router.get(
  '/purchase-suggestions',
  authMiddleware.authorize('read', 'Inventory'),
  inventoryAnalyticsController.getPurchaseSuggestions,
);

// Nova rota para Análise Curva ABC
router.get(
  '/abc-analysis',
  authMiddleware.authorize('read', 'Inventory'),
  inventoryAnalyticsController.getABCAnalysis,
);

router.get(
  ['/ai-suggestions', '/ai-insights'],
  authMiddleware.authorize('read', 'Inventory'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const suggestions = await aiInventoryService.getSmartPurchaseSuggestions();
      ResponseHelper.success(res, suggestions);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  '/adjust-stock',
  authMiddleware.authorize('update', 'Inventory'),
  validate(adjustStockSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { variationId, quantityChange, reason, unitCost, branchId } = req.body;
      const userId = req.user?.id;
      const updatedVariation = await inventoryService.adjustStock(
        variationId,
        quantityChange,
        reason,
        userId,
        undefined,
        unitCost,
        branchId || req.user?.branch_id,
      );
      ResponseHelper.success(res, updatedVariation);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  '/:variationId/adjust',
  authMiddleware.authorize('update', 'Inventory'),
  validate(adjustStockSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const variationId = parseInt(req.params.variationId, 10); // Extract from params
      const { quantityChange, reason, unitCost, branchId } = req.body; // branchId added
      const userId = req.user?.id;
      const updatedVariation = await inventoryService.adjustStock(
        variationId,
        quantityChange,
        reason,
        userId,
        undefined, // dbClient
        unitCost,
        branchId || req.user?.branch_id, // Pass branchId
      );
      ResponseHelper.success(res, updatedVariation);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  '/receive-stock',
  authMiddleware.authorize('update', 'Inventory'),
  validate(receiveStockSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { variationId, quantity, unitCost } = req.body;
      const userId = req.user?.id;
      const updatedVariation = await inventoryService.receiveStock(
        variationId,
        quantity,
        unitCost,
        userId,
      );
      ResponseHelper.success(res, updatedVariation);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  '/dispatch-stock',
  authMiddleware.authorize('update', 'Inventory'),
  validate(receiveDispatchStockSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('Received request for /dispatch-stock');
    try {
      console.log('Inside /dispatch-stock try block');
      const { variationId, quantity } = req.body;
      const updatedVariation = await inventoryService.dispatchStock(variationId, quantity);
      ResponseHelper.success(res, updatedVariation);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/discrepancies',
  authMiddleware.authorize('read', 'Inventory'), // Or a more specific permission
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branchId = parseInt(req.query.branchId as string, 10) || 1; // Default to branch 1
      const discrepancies = await inventoryService.getInventoryDiscrepancies(branchId);
      ResponseHelper.success(res, discrepancies);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
