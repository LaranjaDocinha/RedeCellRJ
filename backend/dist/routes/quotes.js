import { Router } from 'express';
import * as quoteController from '../controllers/quoteController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js'; // Assumindo que validate é um middleware genérico
import { createQuoteSchema, updateQuoteSchema } from '../controllers/quoteController.js'; // TODO: Mover schemas para um arquivo comum
const router = Router();
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('manage', 'Quote')); // Permissão geral para gerenciar orçamentos
// Rotas para Orçamentos
router.post('/', validate(createQuoteSchema), quoteController.createQuote);
router.get('/', quoteController.getAllQuotes);
router.get('/:id', quoteController.getQuoteById);
router.put('/:id', validate(updateQuoteSchema), quoteController.updateQuote);
router.delete('/:id', quoteController.deleteQuote);
export default router;
