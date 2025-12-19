import { Router } from 'express';
import { publicPortalController } from '../controllers/publicPortalController.js';

const router = Router();

// Rota de entrada (Login do cliente)
router.post('/auth', publicPortalController.authenticate);

// Rotas protegidas por Token (na URL)
router.get('/orders/:token', publicPortalController.getOrderByToken);
router.post('/orders/:token/approval', publicPortalController.updateApproval);

export default router;
