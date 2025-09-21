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
import { branchService } from '../services/branchService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
const branchesRouter = Router();
// Zod Schemas
const createBranchSchema = z.object({
    name: z.string().trim().nonempty('Branch name is required'),
    address: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.string().email('Invalid email format').optional(),
});
const updateBranchSchema = z.object({
    name: z.string().trim().nonempty('Branch name cannot be empty').optional(),
    address: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.string().email('Invalid email format').optional(),
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
branchesRouter.use(authMiddleware.authenticate);
branchesRouter.use(authMiddleware.authorize('manage', 'Branches')); // New permission for managing branches
// Get all branches
branchesRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const branches = yield branchService.getAllBranches();
        res.status(200).json(branches);
    }
    catch (error) {
        next(error);
    }
}));
// Get branch by ID
branchesRouter.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const branch = yield branchService.getBranchById(parseInt(req.params.id));
        if (!branch) {
            throw new AppError('Branch not found', 404);
        }
        res.status(200).json(branch);
    }
    catch (error) {
        next(error);
    }
}));
// Create a new branch
branchesRouter.post('/', validate(createBranchSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newBranch = yield branchService.createBranch(req.body);
        res.status(201).json(newBranch);
    }
    catch (error) {
        next(error);
    }
}));
// Update a branch by ID
branchesRouter.put('/:id', validate(updateBranchSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedBranch = yield branchService.updateBranch(parseInt(req.params.id), req.body);
        if (!updatedBranch) {
            throw new AppError('Branch not found', 404);
        }
        res.status(200).json(updatedBranch);
    }
    catch (error) {
        next(error);
    }
}));
// Delete a branch by ID
branchesRouter.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield branchService.deleteBranch(parseInt(req.params.id));
        if (!deleted) {
            throw new AppError('Branch not found', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
export default branchesRouter;
