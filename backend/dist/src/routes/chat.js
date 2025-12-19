import { Router } from 'express';
import * as chatController from '../controllers/chatController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.use(authMiddleware.authenticate);
router.post('/start-session', authMiddleware.authorize('manage', 'ChatSupport'), chatController.startSession);
router.post('/send-message', authMiddleware.authorize('manage', 'ChatSupport'), chatController.sendMessage);
router.get('/history', authMiddleware.authorize('view', 'ChatSupport'), chatController.getHistory);
export default router;
