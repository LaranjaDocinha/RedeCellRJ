import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { productKitService } from '../services/productKitService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';

const productKitsRouter = Router();

// Zod Schemas
const createProductKitItemSchema = z.object({
  product_id: z.number().int().positive('Product ID must be a positive integer'),
  variation_id: z.number().int().positive('Variation ID must be a positive integer'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

const createProductKitSchema = z.object({
  name: z.string().trim().nonempty('Kit name is required'),
  description: z.string().trim().optional(),
  price: z.number().positive('Kit price must be a positive number'),
  is_active: z.boolean().optional(),
  items: z.array(createProductKitItemSchema).min(1, 'A kit must have at least one item'),
});

const updateProductKitSchema = z.object({
  name: z.string().trim().nonempty('Kit name cannot be empty').optional(),
  description: z.string().trim().optional(),
  price: z.number().positive('Kit price must be a positive number').optional(),
  is_active: z.boolean().optional(),
  items: z.array(createProductKitItemSchema).optional(),
}).partial();

// Validation Middleware
const validate = (schema: z.ZodObject<any, any, any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError('Validation failed', error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
    }
    next(error);
  }
};

productKitsRouter.use(authMiddleware.authenticate);
productKitsRouter.use(authMiddleware.authorize('manage', 'ProductKits')); // New permission for managing product kits

// Get all product kits
productKitsRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kits = await productKitService.getAllProductKits();
      res.status(200).json(kits);
    } catch (error) {
      next(error);
    }
  }
);

// Get product kit by ID
productKitsRouter.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kit = await productKitService.getProductKitById(parseInt(req.params.id));
      if (!kit) {
        throw new AppError('Product kit not found', 404);
      }
      res.status(200).json(kit);
    } catch (error) {
      next(error);
    }
  }
);

// Create a new product kit
productKitsRouter.post(
  '/',
  validate(createProductKitSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newKit = await productKitService.createProductKit(req.body);
      res.status(201).json(newKit);
    } catch (error) {
      next(error);
    }
  }
);

// Update a product kit by ID
productKitsRouter.put(
  '/:id',
  validate(updateProductKitSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedKit = await productKitService.updateProductKit(parseInt(req.params.id), req.body);
      if (!updatedKit) {
        throw new AppError('Product kit not found', 404);
      }
      res.status(200).json(updatedKit);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a product kit by ID
productKitsRouter.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await productKitService.deleteProductKit(parseInt(req.params.id));
      if (!deleted) {
        throw new AppError('Product kit not found', 404);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default productKitsRouter;