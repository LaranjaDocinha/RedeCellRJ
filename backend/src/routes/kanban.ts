import { Router, Request, Response, NextFunction } from 'express';
import * as kanbanService from '../services/kanbanService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

import { z } from 'zod';
import { ValidationError, AppError } from '../utils/errors.js';

const router = Router();

// Zod Schemas
const createCardSchema = z.object({
  columnId: z.number().int().positive('Column ID must be a positive integer'),
  title: z.string().trim().nonempty('Card title is required'),
  description: z.string().trim().optional(),
});

const moveCardSchema = z.object({
  cardId: z.number().int().positive('Card ID must be a positive integer'),
  newColumnId: z.number().int().positive('New Column ID must be a positive integer'),
  newPosition: z.number().int().min(0, 'New position must be a non-negative integer'),
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

router.get(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'KanbanTask'),
  async (req, res, next) => {
    try {
      const board = await kanbanService.getBoard();
      res.json(board);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  '/cards/move',
  authMiddleware.authenticate,
  authMiddleware.authorize('update', 'KanbanTask'),
  validate(moveCardSchema),
  async (req, res, next) => {
    try {
      const { cardId, newColumnId, newPosition } = req.body;
      await kanbanService.moveCard({ cardId, newColumnId, newPosition });
      res.status(200).send({ message: 'Card moved successfully' });
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  '/columns/move',
  authMiddleware.authenticate,
  authMiddleware.authorize('update', 'KanbanTask'), // Assuming same permission for now
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { columnId, newPosition } = req.body;
      await kanbanService.moveColumn({ columnId, newPosition });
      res.status(200).send({ message: 'Column moved successfully' });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/cards',
  authMiddleware.authenticate,
  authMiddleware.authorize('create', 'KanbanTask'),
  validate(createCardSchema),
  async (req, res, next) => {
    try {
      const { columnId, title, description } = req.body;
      const newCard = await kanbanService.createCard({ columnId, title, description });
      res.status(201).json(newCard);
    } catch (error) {
      next(error);
    }
  },
);

const updateCardSchema = z
  .object({
    title: z.string().trim().nonempty('Card title is required').optional(),
    description: z.string().trim().optional(),
    due_date: z.string().datetime('Invalid due date format').nullable().optional(),
    assignee_id: z
      .number()
      .int()
      .positive('Assignee ID must be a positive integer')
      .nullable()
      .optional(),
  })
  .partial();

router.put(
  '/cards/:id',
  authMiddleware.authenticate,
  authMiddleware.authorize('update', 'KanbanTask'),
  validate(updateCardSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cardId = parseInt(req.params.id, 10);
      const updatedCard = await kanbanService.updateCard({ cardId, ...req.body });
      if (!updatedCard) {
        throw new AppError('Card not found', 404);
      }
      res.status(200).json(updatedCard);
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/cards/:id',
  authMiddleware.authenticate,
  authMiddleware.authorize('delete', 'KanbanTask'),
  async (req, res, next) => {
    try {
      const cardId = parseInt(req.params.id, 10);
      const result = await kanbanService.deleteCard(cardId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// TODO: Adicionar rotas para criar, atualizar e deletar cards

export default router;
