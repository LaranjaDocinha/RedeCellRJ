import { Router } from 'express';
import { rmaController } from '../controllers/rmaController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.post('/', authMiddleware.authorize('create', 'Inventory'), rmaController.create);
router.get(
  '/:id/borderou',
  authMiddleware.authorize('read', 'Inventory'),
  rmaController.downloadBorderou,
);

export default router;
