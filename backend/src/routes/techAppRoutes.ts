import { Router } from 'express';
import { techAppController } from '../controllers/techAppController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware.authenticate);

router.get('/orders', techAppController.getOpenOrders);
router.post('/orders/:id/photos', techAppController.addPhoto);
router.get('/checklists', techAppController.getChecklistTemplate);
router.post('/orders/:id/checklist', techAppController.submitChecklist);

export default router;
