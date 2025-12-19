import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.use(authMiddleware.authenticate);
router.post('/send', authMiddleware.authorize('manage', 'Notifications'), notificationController.sendNotification);
router.post('/subscribe', authMiddleware.authorize('manage', 'Notifications'), notificationController.subscribe);
export default router;
