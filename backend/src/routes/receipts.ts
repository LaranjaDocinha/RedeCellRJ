import { Router, Request, Response, NextFunction } from 'express';
import {
  getSaleReceipt,
  generateSaleFiscalNote,
  sendDocumentByEmail,
} from '../controllers/receiptController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { z } from 'zod';
import { AppError } from '../utils/errors.js';

const receiptsRouter = Router();

// Zod Schema for email sending request
const sendEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject cannot be empty'),
  htmlContent: z.string().min(1, 'HTML content cannot be empty'),
  textContent: z.string().min(1, 'Text content cannot be empty'),
});

// Validation Middleware
const validate =
  (schema: z.ZodObject<any, any, any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(
          new AppError(
            'Validation failed',
            400,
            error.errors.map((err) => ({ path: err.path.join('.'), message: err.message })),
          ),
        );
      }
      next(error);
    }
  };

// Route to get a sale receipt
receiptsRouter.get(
  '/:saleId/receipt',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Sale'), // Assuming 'read' permission for Sale
  getSaleReceipt,
);

// Route to generate a fiscal note for a sale
receiptsRouter.post(
  '/:saleId/fiscal-note',
  authMiddleware.authenticate,
  authMiddleware.authorize('create', 'FiscalNote'), // Assuming 'create' permission for FiscalNote
  generateSaleFiscalNote,
);

// Route to send a document (receipt/fiscal note) by email
receiptsRouter.post(
  '/send-email',
  authMiddleware.authenticate,
  authMiddleware.authorize('create', 'Email'), // Assuming 'create' permission for Email
  validate(sendEmailSchema),
  sendDocumentByEmail,
);

export default receiptsRouter;
