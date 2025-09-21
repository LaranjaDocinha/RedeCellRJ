import { Router, Request, Response, NextFunction } from 'express';
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
const validate = (schema: z.ZodObject<any, any, any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError('Validation failed', error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
    }
    next(error);
  }
};

branchesRouter.use(authMiddleware.authenticate);
branchesRouter.use(authMiddleware.authorize('manage', 'Branches')); // New permission for managing branches

// Get all branches
branchesRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branches = await branchService.getAllBranches();
      res.status(200).json(branches);
    } catch (error) {
      next(error);
    }
  }
);

// Get branch by ID
branchesRouter.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branch = await branchService.getBranchById(parseInt(req.params.id));
      if (!branch) {
        throw new AppError('Branch not found', 404);
      }
      res.status(200).json(branch);
    } catch (error) {
      next(error);
    }
  }
);

// Create a new branch
branchesRouter.post(
  '/',
  validate(createBranchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newBranch = await branchService.createBranch(req.body);
      res.status(201).json(newBranch);
    } catch (error) {
      next(error);
    }
  }
);

// Update a branch by ID
branchesRouter.put(
  '/:id',
  validate(updateBranchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedBranch = await branchService.updateBranch(parseInt(req.params.id), req.body);
      if (!updatedBranch) {
        throw new AppError('Branch not found', 404);
      }
      res.status(200).json(updatedBranch);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a branch by ID
branchesRouter.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await branchService.deleteBranch(parseInt(req.params.id));
      if (!deleted) {
        throw new AppError('Branch not found', 404);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default branchesRouter;