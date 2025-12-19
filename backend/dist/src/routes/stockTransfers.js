import { Router } from 'express';
import * as stockTransferController from '../controllers/stockTransferController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js'; // Assumindo que validate é um middleware genérico
import { createStockTransferSchema, updateStockTransferSchema, } from '../controllers/stockTransferController.js'; // TODO: Mover schemas para um arquivo comum
const router = Router();
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('manage', 'StockTransfer')); // Permissão geral para gerenciar transferências de estoque
// Rotas para Transferências de Estoque
router.post('/', validate(createStockTransferSchema), stockTransferController.createStockTransfer);
router.get('/', stockTransferController.getAllStockTransfers);
router.get('/:id', stockTransferController.getStockTransferById);
router.put('/:id', validate(updateStockTransferSchema), stockTransferController.updateStockTransfer);
router.delete('/:id', stockTransferController.deleteStockTransfer);
export default router;
