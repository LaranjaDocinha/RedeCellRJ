import { Router } from 'express';
import { z } from 'zod';
import { branchService } from '../services/branchService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
const branchesRouter = Router();
// Zod Schemas
const createBranchSchema = z.object({
    name: z.string().trim().nonempty('Branch name is required'),
    address: z.string().trim().nonempty('Address is required'),
    phone: z.string().trim().optional(),
});
const updateBranchSchema = z
    .object({
    name: z.string().trim().nonempty('Branch name cannot be empty').optional(),
    address: z.string().trim().nonempty('Address cannot be empty').optional(),
    phone: z.string().trim().optional(),
})
    .partial();
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
branchesRouter.use(authMiddleware.authenticate);
// Get all branches
branchesRouter.get('/', authMiddleware.authorize('read', 'Branch'), async (req, res, next) => {
    try {
        const branches = await branchService.getAllBranches();
        res.status(200).json(branches);
    }
    catch (error) {
        next(error);
    }
});
// Get branch by ID
branchesRouter.get('/:id', authMiddleware.authorize('read', 'Branch'), async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new AppError('Invalid branch ID', 400);
        }
        const branch = await branchService.getBranchById(id);
        if (!branch) {
            throw new AppError('Branch not found', 404);
        }
        res.status(200).json(branch);
    }
    catch (error) {
        next(error);
    }
});
// Create a new branch
branchesRouter.post('/', authMiddleware.authorize('create', 'Branch'), validate(createBranchSchema), async (req, res, next) => {
    try {
        const newBranch = await branchService.createBranch(req.body);
        res.status(201).json(newBranch);
    }
    catch (error) {
        next(error);
    }
});
// Update a branch by ID
branchesRouter.put('/:id', authMiddleware.authorize('update', 'Branch'), validate(updateBranchSchema), async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new AppError('Invalid branch ID', 400);
        }
        const updatedBranch = await branchService.updateBranch(id, req.body);
        if (!updatedBranch) {
            throw new AppError('Branch not found', 404);
        }
        res.status(200).json(updatedBranch);
    }
    catch (error) {
        next(error);
    }
});
// Delete a branch by ID
branchesRouter.delete('/:id', authMiddleware.authorize('delete', 'Branch'), async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new AppError('Invalid branch ID', 400);
        }
        const deleted = await branchService.deleteBranch(id);
        if (!deleted) {
            throw new AppError('Branch not found', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
export default branchesRouter;
