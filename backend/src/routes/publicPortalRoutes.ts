import { Router } from 'express';
import { publicPortalController } from '../controllers/publicPortalController.js';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js';

const router = Router();

// Rota de entrada (Login do cliente)
router.post('/auth', publicPortalController.authenticate);

// Rotas protegidas por Token (na URL)
// Cache por 60 segundos para evitar sobrecarga em dias de alto fluxo
router.get(
  '/orders/:token',
  cacheMiddleware({ duration: 60, keyPrefix: 'portal-order' }),
  publicPortalController.getOrderByToken,
);
router.post('/orders/:token/approval', publicPortalController.updateApproval);

export default router;
