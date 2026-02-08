import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { userService } from '../services/userService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';
import { userRepository } from '../repositories/user.repository.js'; // Direct import for quick fix

const usersRouter = Router();

// Zod Schemas
const createUserSchema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().email('Invalid email format').nonempty('Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .nonempty('Password is required'),
  role: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().nonempty('Name cannot be empty').optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  role: z.string().optional(),
});

const updateThemeSchema = z.object({
  theme: z.enum(['light', 'dark']),
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
          new ValidationError(
            'Validation failed',
            error.errors.map((err) => ({ path: err.path.join('.'), message: err.message })),
          ),
        );
      }
      next(error);
    }
  };

// Endpoint para atualizar o tema do próprio usuário
usersRouter.patch(
  '/me/theme',
  authMiddleware.authenticate,
  validate(updateThemeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { theme } = req.body;

      const updatedUser = await userRepository.update(userId, { theme_preference: theme });
      res.status(200).json({ theme: updatedUser.theme_preference });
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.get(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'User'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.get(
  '/:id',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'User'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.getUserById(req.params.id); // Fixed: removed parseInt as ID is UUID
      if (!user) {
        throw new AppError('User not found', 404);
      }
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.post(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorize('create', 'User'),
  validate(createUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newUser = await userService.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.put(
  '/:id',
  authMiddleware.authenticate,
  authMiddleware.authorize('update', 'User'),
  validate(updateUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedUser = await userService.updateUser(req.params.id, req.body); // Fixed: removed parseInt
      if (!updatedUser) {
        throw new AppError('User not found', 404);
      }
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.delete(
  '/:id',
  authMiddleware.authenticate,
  authMiddleware.authorize('delete', 'User'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await userService.deleteUser(req.params.id); // Fixed: removed parseInt
      if (!deleted) {
        throw new AppError('User not found', 404);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export { usersRouter };
