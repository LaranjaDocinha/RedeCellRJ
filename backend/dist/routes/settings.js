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
import { settingsService } from '../services/settingsService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
const settingsRouter = Router();
// Zod Schemas
const createSettingSchema = z.object({
    key: z.string().trim().nonempty('Setting key is required'),
    value: z.string().nonempty('Setting value is required'),
    description: z.string().trim().optional(),
});
const updateSettingSchema = z.object({
    value: z.string().nonempty('Setting value is required').optional(),
    description: z.string().trim().optional(),
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
settingsRouter.use(authMiddleware.authenticate);
settingsRouter.use(authMiddleware.authorize('manage', 'Settings')); // Only users with manage:Settings permission can access these routes
// Get all settings
settingsRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield settingsService.getAllSettings();
        res.status(200).json(settings);
    }
    catch (error) {
        next(error);
    }
}));
// Get setting by key
settingsRouter.get('/:key', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const setting = yield settingsService.getSettingByKey(req.params.key);
        if (!setting) {
            throw new AppError('Setting not found', 404);
        }
        res.status(200).json(setting);
    }
    catch (error) {
        next(error);
    }
}));
// Create a new setting
settingsRouter.post('/', validate(createSettingSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newSetting = yield settingsService.createSetting(req.body);
        res.status(201).json(newSetting);
    }
    catch (error) {
        next(error);
    }
}));
// Update a setting by key
settingsRouter.put('/:key', validate(updateSettingSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedSetting = yield settingsService.updateSetting(req.params.key, req.body);
        if (!updatedSetting) {
            throw new AppError('Setting not found', 404);
        }
        res.status(200).json(updatedSetting);
    }
    catch (error) {
        next(error);
    }
}));
// Delete a setting by key
settingsRouter.delete('/:key', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield settingsService.deleteSetting(req.params.key);
        if (!deleted) {
            throw new AppError('Setting not found', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
export default settingsRouter;
