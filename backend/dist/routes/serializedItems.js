import { Router } from 'express';
import * as serializedItemController from '../controllers/serializedItemController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js'; // Assumindo que validate é um middleware genérico
import { createSerializedItemSchema, updateSerializedItemSchema, } from '../controllers/serializedItemController.js'; // TODO: Mover schemas para um arquivo comum
const router = Router();
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('manage', 'SerializedItem')); // Permissão geral para gerenciar itens serializados
// Rotas para Itens Serializados
router.post('/', validate(createSerializedItemSchema), serializedItemController.createSerializedItem);
router.get('/', serializedItemController.getAllSerializedItems);
router.get('/:id', serializedItemController.getSerializedItemById);
router.get('/serial/:serialNumber', serializedItemController.getSerializedItemBySerialNumber);
router.get('/variation/:productVariationId', serializedItemController.getSerializedItemsByVariationId);
router.put('/:id', validate(updateSerializedItemSchema), serializedItemController.updateSerializedItem);
router.delete('/:id', serializedItemController.deleteSerializedItem);
export default router;
