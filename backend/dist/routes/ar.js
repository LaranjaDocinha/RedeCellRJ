import { Router } from 'express';
import * as arController from '../controllers/arController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.use(authMiddleware.authenticate);
router.get('/compatible-products/:deviceId', authMiddleware.authorize('view', 'AR'), arController.getCompatibleProducts);
router.post('/log-interaction', authMiddleware.authorize('manage', 'AR'), arController.logARInteraction);
export default router;
