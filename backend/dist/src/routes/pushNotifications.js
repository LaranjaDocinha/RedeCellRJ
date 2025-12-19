import { Router } from 'express';
import { pushNotificationController } from '../controllers/pushNotificationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.get('/public-key', pushNotificationController.getPublicKey);
router.use(authMiddleware.authenticate); // All subsequent routes require authentication
router.post('/subscribe', pushNotificationController.subscribe);
router.post('/unsubscribe', pushNotificationController.unsubscribe);
// Test route for sending a notification to the current user
router.post('/send-test', pushNotificationController.sendNotification);
// Admin route for broadcast notifications
router.post('/broadcast', authMiddleware.authorize('create', 'Notification'), pushNotificationController.sendBroadcastNotification);
export default router;
