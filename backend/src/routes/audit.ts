import { Router, Request, Response, NextFunction } from 'express';
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
const validateQuery = (schema: z.ZodObject<any, any, any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError('Validation failed', error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
    }
    next(error);
  }
};

auditRouter.use(authMiddleware.authenticate);
auditRouter.use(authMiddleware.authorize('read', 'AuditLog')); // Only users with read:AuditLog permission can access these routes

// Get audit logs
auditRouter.get(
  '/',
  validateQuery(getAuditLogsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = req.query;
      const logs = await auditService.getAuditLogs(Number(limit), Number(offset));
      res.status(200).json(logs);
    } catch (error) {
      next(error);
    }
  }
);

export default auditRouter;