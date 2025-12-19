import { Router } from 'express';
import * as cycleCountController from '../controllers/cycleCountController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js'; // Assumindo que validate é um middleware genérico
import { createCycleCountSchema, updateCycleCountSchema, } from '../controllers/cycleCountController.js'; // TODO: Mover schemas para um arquivo comum
const router = Router();
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('manage', 'CycleCount')); // Permissão geral para gerenciar contagens cíclicas
// Rotas para Contagens Cíclicas
router.post('/', validate(createCycleCountSchema), cycleCountController.createCycleCount);
router.get('/', cycleCountController.getAllCycleCounts);
router.get('/:id', cycleCountController.getCycleCountById);
router.put('/:id', validate(updateCycleCountSchema), cycleCountController.updateCycleCount);
router.delete('/:id', cycleCountController.deleteCycleCount);
export default router;
