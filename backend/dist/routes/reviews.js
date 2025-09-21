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
reviewsRouter.use(authMiddleware.authenticate);
// Get all reviews for a product
reviewsRouter.get('/product/:productId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = parseInt(req.params.productId);
        const reviews = yield reviewService.getReviewsByProductId(productId);
        res.status(200).json(reviews);
    }
    catch (error) {
        next(error);
    }
}));
// Get a single review by ID
reviewsRouter.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const review = yield reviewService.getReviewById(parseInt(req.params.id));
        if (!review) {
            throw new AppError('Review not found', 404);
        }
        res.status(200).json(review);
    }
    catch (error) {
        next(error);
    }
}));
// Create a new review
reviewsRouter.post('/', validate(createReviewSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id; // Get user ID from authenticated request
        const newReview = yield reviewService.createReview(Object.assign(Object.assign({}, req.body), { user_id: userId }));
        res.status(201).json(newReview);
    }
    catch (error) {
        next(error);
    }
}));
// Update a review by ID (only by the user who created it or admin)
reviewsRouter.put('/:id', validate(updateReviewSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const reviewId = parseInt(req.params.id);
        const updatedReview = yield reviewService.updateReview(reviewId, userId, req.body);
        if (!updatedReview) {
            throw new AppError('Review not found or not authorized to update', 404);
        }
        res.status(200).json(updatedReview);
    }
    catch (error) {
        next(error);
    }
}));
// Delete a review by ID (only by the user who created it or admin)
reviewsRouter.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const reviewId = parseInt(req.params.id);
        const deleted = yield reviewService.deleteReview(reviewId, userId);
        if (!deleted) {
            throw new AppError('Review not found or not authorized to delete', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
export default reviewsRouter;
