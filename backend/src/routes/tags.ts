import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { tagService } from '../services/tagService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

import { ValidationError, AppError } from '../utils/errors.js';

const tagsRouter = Router();

// Zod Schemas
const createTagSchema = z.object({
  name: z.string().trim().min(1, 'Tag name is required'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .optional(),
});

const updateTagSchema = z
  .object({
    name: z.string().trim().min(1, 'Tag name cannot be empty').optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
      .optional(),
  })
  .partial();

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

tagsRouter.use(authMiddleware.authenticate);

// Get all tags
tagsRouter.get(
  '/',
  authMiddleware.authorize('read', 'Tag'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tags = await tagService.getAllTags();
      res.status(200).json(tags);
    } catch (error) {
      next(error);
    }
  },
);

// Get tag by ID
tagsRouter.get(
  '/:id',
  authMiddleware.authorize('read', 'Tag'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tag = await tagService.getTagById(parseInt(req.params.id));
      if (!tag) {
        throw new AppError('Tag not found', 404);
      }
      res.status(200).json(tag);
    } catch (error) {
      next(error);
    }
  },
);

// Create a new tag
tagsRouter.post(
  '/',
  authMiddleware.authorize('create', 'Tag'),
  validate(createTagSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newTag = await tagService.createTag(req.body);
      res.status(201).json(newTag);
    } catch (error) {
      next(error);
    }
  },
);

// Update a tag by ID
tagsRouter.put(
  '/:id',
  authMiddleware.authorize('update', 'Tag'),
  validate(updateTagSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedTag = await tagService.updateTag(parseInt(req.params.id), req.body);
      if (!updatedTag) {
        throw new AppError('Tag not found', 404);
      }
      res.status(200).json(updatedTag);
    } catch (error) {
      next(error);
    }
  },
);

// Delete a tag by ID
tagsRouter.delete(
  '/:id',
  authMiddleware.authorize('delete', 'Tag'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await tagService.deleteTag(parseInt(req.params.id));
      if (!deleted) {
        throw new AppError('Tag not found', 404);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export default tagsRouter;
