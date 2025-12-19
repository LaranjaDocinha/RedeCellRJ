import { Router } from 'express';
import { z } from 'zod';
import { partSupplierService } from '../services/partSupplierService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
const partSuppliersRouter = Router({ mergeParams: true });
// Zod Schemas
const partSupplierSchema = z.object({
    supplier_id: z.number().int().positive(),
    cost: z.number().positive(),
    lead_time_days: z.number().int().positive().optional(),
    supplier_part_number: z.string().trim().optional(),
});
const updatePartSupplierSchema = partSupplierSchema.partial().omit({ supplier_id: true });
// Validation Middleware
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ValidationError('Validation failed', error.errors.map((err) => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
partSuppliersRouter.use(authMiddleware.authenticate);
partSuppliersRouter.use(authMiddleware.authorize('manage', 'Parts'));
// Get all suppliers for a part
partSuppliersRouter.get('/', async (req, res, next) => {
    try {
        const { partId } = req.params;
        const suppliers = await partSupplierService.getSuppliersForPart(parseInt(partId));
        res.status(200).json(suppliers);
    }
    catch (error) {
        next(error);
    }
});
// Add a supplier to a part
partSuppliersRouter.post('/', validate(partSupplierSchema), async (req, res, next) => {
    try {
        const { partId } = req.params;
        const newAssociation = await partSupplierService.addSupplierToPart({
            ...req.body,
            part_id: parseInt(partId),
        });
        res.status(201).json(newAssociation);
    }
    catch (error) {
        next(error);
    }
});
// Update a supplier for a part
partSuppliersRouter.put('/:supplierId', validate(updatePartSupplierSchema), async (req, res, next) => {
    try {
        const { partId, supplierId } = req.params;
        const updatedAssociation = await partSupplierService.updateSupplierForPart(parseInt(partId), parseInt(supplierId), req.body);
        if (!updatedAssociation) {
            throw new AppError('Association not found', 404);
        }
        res.status(200).json(updatedAssociation);
    }
    catch (error) {
        next(error);
    }
});
// Remove a supplier from a part
partSuppliersRouter.delete('/:supplierId', async (req, res, next) => {
    try {
        const { partId, supplierId } = req.params;
        const deleted = await partSupplierService.removeSupplierFromPart(parseInt(partId), parseInt(supplierId));
        if (!deleted) {
            throw new AppError('Association not found', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
export default partSuppliersRouter;
