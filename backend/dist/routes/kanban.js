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
router.get('/', authMiddleware.authenticate, authMiddleware.authorize('read', 'KanbanTask'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const board = yield kanbanService.getBoard();
        res.json(board);
    }
    catch (error) {
        next(error);
    }
}));
router.put('/cards/move', authMiddleware.authenticate, authMiddleware.authorize('update', 'KanbanTask'), validate(moveCardSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cardId, newColumnId, newPosition } = req.body;
        yield kanbanService.moveCard({ cardId, newColumnId, newPosition });
        res.status(200).send({ message: 'Card moved successfully' });
    }
    catch (error) {
        next(error);
    }
}));
router.put('/columns/move', authMiddleware.authenticate, authMiddleware.authorize('update', 'KanbanTask'), // Assuming same permission for now
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { columnId, newPosition } = req.body;
        yield kanbanService.moveColumn({ columnId, newPosition });
        res.status(200).send({ message: 'Column moved successfully' });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/cards', authMiddleware.authenticate, authMiddleware.authorize('create', 'KanbanTask'), validate(createCardSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { columnId, title, description } = req.body;
        const newCard = yield kanbanService.createCard({ columnId, title, description });
        res.status(201).json(newCard);
    }
    catch (error) {
        next(error);
    }
}));
const updateCardSchema = z.object({
    title: z.string().trim().nonempty('Card title is required').optional(),
    description: z.string().trim().optional(),
    due_date: z.string().datetime('Invalid due date format').nullable().optional(),
    assignee_id: z.number().int().positive('Assignee ID must be a positive integer').nullable().optional(),
}).partial();
router.put('/cards/:id', authMiddleware.authenticate, authMiddleware.authorize('update', 'KanbanTask'), validate(updateCardSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cardId = parseInt(req.params.id, 10);
        const updatedCard = yield kanbanService.updateCard(Object.assign({ cardId }, req.body));
        if (!updatedCard) {
            throw new AppError('Card not found', 404);
        }
        res.status(200).json(updatedCard);
    }
    catch (error) {
        next(error);
    }
}));
router.delete('/cards/:id', authMiddleware.authenticate, authMiddleware.authorize('delete', 'KanbanTask'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cardId = parseInt(req.params.id, 10);
        const result = yield kanbanService.deleteCard(cardId);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}));
// TODO: Adicionar rotas para criar, atualizar e deletar cards
export default router;
