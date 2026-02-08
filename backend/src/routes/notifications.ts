import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.get('/', notificationController.listByUser);
router.patch('/:id/read', notificationController.markAsRead);
router.post('/read-all', notificationController.markAllAsRead);

export default router;
