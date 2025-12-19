import { Router } from 'express';
import { requestDataDeletion, requestDataExport } from '../controllers/gdprController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { z } from 'zod';
import { AppError } from '../utils/errors.js';
const router = Router();
// Zod Schema for data deletion request
const dataDeletionSchema = z.object({
    entityType: z.enum(['user', 'customer'], {
        errorMap: () => ({ message: 'Entity type must be "user" or "customer"' }),
    }),
    entityId: z.string().uuid('Invalid entity ID format'),
});
// Zod Schema for data export request
const dataExportSchema = z.object({
    entityType: z.enum(['user', 'customer'], {
        errorMap: () => ({ message: 'Entity type must be "user" or "customer"' }),
    }),
    entityId: z.string().uuid('Invalid entity ID format'),
});
// Validation Middleware
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body); // Validate request body
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new AppError('Validation failed', 400, error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
// Route to request data deletion (anonymization)
router.post('/delete-request', authMiddleware.authenticate, authMiddleware.authorize('delete', 'PersonalData'), // Assuming a generic permission for personal data deletion
validate(dataDeletionSchema), requestDataDeletion);
// Route to request data export
router.post(
// Using POST for export as it might involve sensitive data in the body or complex queries
'/export-request', authMiddleware.authenticate, authMiddleware.authorize('read', 'PersonalData'), // Assuming a generic permission for personal data access
validate(dataExportSchema), requestDataExport);
export default router;
