import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { reviewService } from '../services/reviewService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';

const reviewsRouter = Router();

// Zod Schemas
const createReviewSchema = z.object({
  product_id: z.number().int().positive('Product ID must be a positive integer'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5').optional(),
  comment: z.string().trim().optional(),
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

reviewsRouter.use(authMiddleware.authenticate);

// Get all reviews for a product
reviewsRouter.get(
  '/product/:productId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = parseInt(req.params.productId);
      const reviews = await reviewService.getReviewsByProductId(productId);
      res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  }
);

// Get a single review by ID
reviewsRouter.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const review = await reviewService.getReviewById(parseInt(req.params.id));
      if (!review) {
        throw new AppError('Review not found', 404);
      }
      res.status(200).json(review);
    } catch (error) {
      next(error);
    }
  }
);

// Create a new review
reviewsRouter.post(
  '/',
  validate(createReviewSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id; // Get user ID from authenticated request
      const newReview = await reviewService.createReview({ ...req.body, user_id: userId });
      res.status(201).json(newReview);
    } catch (error) {
      next(error);
    }
  }
);

// Update a review by ID (only by the user who created it or admin)
reviewsRouter.put(
  '/:id',
  validate(updateReviewSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const reviewId = parseInt(req.params.id);
      const updatedReview = await reviewService.updateReview(reviewId, userId, req.body);
      if (!updatedReview) {
        throw new AppError('Review not found or not authorized to update', 404);
      }
      res.status(200).json(updatedReview);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a review by ID (only by the user who created it or admin)
reviewsRouter.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const reviewId = parseInt(req.params.id);
      const deleted = await reviewService.deleteReview(reviewId, userId);
      if (!deleted) {
        throw new AppError('Review not found or not authorized to delete', 404);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default reviewsRouter;