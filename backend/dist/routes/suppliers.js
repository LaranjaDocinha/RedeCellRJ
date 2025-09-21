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
import { supplierService } from '../services/supplierService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
const suppliersRouter = Router();
// Zod Schemas
const createSupplierSchema = z.object({
    name: z.string().trim().nonempty('Supplier name is required'),
    contact_person: z.string().trim().optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
});
const updateSupplierSchema = z.object({
    name: z.string().trim().nonempty('Supplier name cannot be empty').optional(),
    contact_person: z.string().trim().optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
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
suppliersRouter.use(authMiddleware.authenticate);
// Get all suppliers
suppliersRouter.get('/', authMiddleware.authorize('read', 'Supplier'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const suppliers = yield supplierService.getAllSuppliers();
        res.status(200).json(suppliers);
    }
    catch (error) {
        next(error);
    }
}));
// Get supplier by ID
suppliersRouter.get('/:id', authMiddleware.authorize('read', 'Supplier'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const supplier = yield supplierService.getSupplierById(parseInt(req.params.id));
        if (!supplier) {
            throw new AppError('Supplier not found', 404);
        }
        res.status(200).json(supplier);
    }
    catch (error) {
        next(error);
    }
}));
// Create a new supplier
suppliersRouter.post('/', authMiddleware.authorize('create', 'Supplier'), validate(createSupplierSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newSupplier = yield supplierService.createSupplier(req.body);
        res.status(201).json(newSupplier);
    }
    catch (error) {
        next(error);
    }
}));
// Update a supplier by ID
suppliersRouter.put('/:id', authMiddleware.authorize('update', 'Supplier'), validate(updateSupplierSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedSupplier = yield supplierService.updateSupplier(parseInt(req.params.id), req.body);
        if (!updatedSupplier) {
            throw new AppError('Supplier not found', 404);
        }
        res.status(200).json(updatedSupplier);
    }
    catch (error) {
        next(error);
    }
}));
// Delete a supplier by ID
suppliersRouter.delete('/:id', authMiddleware.authorize('delete', 'Supplier'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield supplierService.deleteSupplier(parseInt(req.params.id));
        if (!deleted) {
            throw new AppError('Supplier not found', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
export default suppliersRouter;
