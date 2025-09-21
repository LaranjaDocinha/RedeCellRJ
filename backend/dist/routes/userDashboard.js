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
import * as userDashboardService from '../services/userDashboardService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';
const router = Router();
// Middleware to ensure user is authenticated and has a user ID
router.use(authMiddleware.authenticate);
// Zod Schema for user dashboard settings
const updateSettingsSchema = z.object({
    theme: z.string().optional(),
    language: z.string().optional(),
    notifications: z.boolean().optional(),
    // Add other settings fields as they are defined in the user dashboard settings
}).partial(); // .partial() makes all fields optional, allowing for partial updates
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
router.get('/settings', authMiddleware.authorize('read', 'UserDashboard'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id; // Assuming user ID is attached by authMiddleware
        const settings = yield userDashboardService.getSettings(userId);
        res.json(settings);
    }
    catch (error) {
        next(error);
    }
}));
router.put('/settings', authMiddleware.authorize('update', 'UserDashboard'), validate(updateSettingsSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const newSettings = req.body;
        const updatedSettings = yield userDashboardService.updateSettings(userId, newSettings);
        res.json(updatedSettings);
    }
    catch (error) {
        next(error);
    }
}));
export default router;
