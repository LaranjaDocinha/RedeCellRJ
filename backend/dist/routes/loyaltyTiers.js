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
import { loyaltyService } from '../services/loyaltyService.js'; // Reusing loyaltyService for tier management
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
const loyaltyTiersRouter = Router();
// Zod Schemas
const createLoyaltyTierSchema = z.object({
    name: z.string().trim().nonempty('Tier name is required'),
    min_points: z.number().int().min(0, 'Minimum points must be a non-negative integer'),
    description: z.string().trim().optional(),
    benefits: z.record(z.any()).optional(), // Flexible JSONB for benefits
});
const updateLoyaltyTierSchema = z.object({
    name: z.string().trim().nonempty('Tier name cannot be empty').optional(),
    min_points: z.number().int().min(0, 'Minimum points must be a non-negative integer').optional(),
    description: z.string().trim().optional(),
    benefits: z.record(z.any()).optional(),
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
loyaltyTiersRouter.use(authMiddleware.authenticate);
loyaltyTiersRouter.use(authMiddleware.authorize('manage', 'LoyaltyTiers')); // New permission for managing tiers
// Get all loyalty tiers
loyaltyTiersRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tiers = yield loyaltyService.getAllLoyaltyTiers();
        res.status(200).json(tiers);
    }
    catch (error) {
        next(error);
    }
}));
// Get loyalty tier by ID
loyaltyTiersRouter.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tier = yield loyaltyService.getLoyaltyTierById(parseInt(req.params.id));
        if (!tier) {
            throw new AppError('Loyalty tier not found', 404);
        }
        res.status(200).json(tier);
    }
    catch (error) {
        next(error);
    }
}));
// Create a new loyalty tier
loyaltyTiersRouter.post('/', validate(createLoyaltyTierSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newTier = yield loyaltyService.createLoyaltyTier(req.body);
        res.status(201).json(newTier);
    }
    catch (error) {
        next(error);
    }
}));
// Update a loyalty tier by ID
loyaltyTiersRouter.put('/:id', validate(updateLoyaltyTierSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedTier = yield loyaltyService.updateLoyaltyTier(parseInt(req.params.id), req.body);
        if (!updatedTier) {
            throw new AppError('Loyalty tier not found', 404);
        }
        res.status(200).json(updatedTier);
    }
    catch (error) {
        next(error);
    }
}));
// Delete a loyalty tier by ID
loyaltyTiersRouter.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield loyaltyService.deleteLoyaltyTier(parseInt(req.params.id));
        if (!deleted) {
            throw new AppError('Loyalty tier not found', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
export default loyaltyTiersRouter;
