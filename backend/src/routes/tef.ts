import { Router, Request, Response, NextFunction } from 'express';
import * as tefController from '../controllers/tefController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { z } from 'zod';
import { AppError, ValidationError } from '../utils/errors.js';

const tefRouter = Router();

// Validation Middleware
const validate =
  (schema: z.ZodObject<any, any, any>) => (req: Request, res: Response, next: NextFunction) => {
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

// Route to process an incoming TEF transaction (from local TEF client)
tefRouter.post(
  '/transaction',
  authMiddleware.authenticate,
  authMiddleware.authorize('create', 'TefTransaction'), // Assuming 'TefTransaction' subject
  validate(tefController.processTefTransactionSchema),
  tefController.processTefTransaction,
);

// Route to get the status of a TEF transaction
tefRouter.get(
  '/status/:transactionId',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'TefTransaction'), // Assuming 'TefTransaction' subject
  tefController.getTefTransactionStatus,
);

export default tefRouter;
