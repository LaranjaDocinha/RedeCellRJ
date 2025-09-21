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
import { auditService } from '../services/auditService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError } from '../utils/errors.js';
const auditRouter = Router();
// Zod Schema for query parameters
const getAuditLogsSchema = z.object({
    limit: z.string().regex(/^\d+$/, 'Limit must be a number string').transform(Number).optional(),
    offset: z.string().regex(/^\d+$/, 'Offset must be a number string').transform(Number).optional(),
});
// Validation Middleware for query parameters
const validateQuery = (schema) => (req, res, next) => {
    try {
        schema.parse(req.query);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ValidationError('Validation failed', error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
auditRouter.use(authMiddleware.authenticate);
auditRouter.use(authMiddleware.authorize('read', 'AuditLog')); // Only users with read:AuditLog permission can access these routes
// Get audit logs
auditRouter.get('/', validateQuery(getAuditLogsSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, offset } = req.query;
        const logs = yield auditService.getAuditLogs(Number(limit), Number(offset));
        res.status(200).json(logs);
    }
    catch (error) {
        next(error);
    }
}));
export default auditRouter;
