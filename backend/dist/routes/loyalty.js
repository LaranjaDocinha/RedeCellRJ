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
import { loyaltyService } from '../services/loyaltyService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError } from '../utils/errors.js';
const router = Router();
router.use(authMiddleware.authenticate);
// Zod Schemas
const pointsSchema = z.object({
    points: z.number().int().positive('Points must be a positive integer'),
    reason: z.string().nonempty('Reason is required'),
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
router.get('/points', authMiddleware.authorize('read', 'Loyalty'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const points = yield loyaltyService.getLoyaltyPoints(userId);
        res.json({ loyalty_points: points });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/add-points', authMiddleware.authorize('create', 'Loyalty'), validate(pointsSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, points, reason } = req.body; // Admin/Manager can add points to any user
        const newPoints = yield loyaltyService.addLoyaltyPoints(userId, points, reason);
        res.status(200).json({ loyalty_points: newPoints });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/redeem-points', authMiddleware.authorize('update', 'Loyalty'), validate(pointsSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id; // User redeems their own points
        const { points, reason } = req.body;
        const newPoints = yield loyaltyService.redeemLoyaltyPoints(userId, points, reason);
        res.status(200).json({ loyalty_points: newPoints });
    }
    catch (error) {
        next(error);
    }
}));
router.get('/transactions', authMiddleware.authorize('read', 'Loyalty'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const transactions = yield loyaltyService.getLoyaltyTransactions(userId);
        res.json(transactions);
    }
    catch (error) {
        next(error);
    }
}));
export default router;
