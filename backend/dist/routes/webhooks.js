import { Router } from 'express';
import * as webhookController from '../controllers/webhookController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.use(authMiddleware.authenticate);
router.post('/', authMiddleware.authorize('manage', 'Webhooks'), webhookController.createWebhook);
router.get('/', authMiddleware.authorize('view', 'Webhooks'), webhookController.getWebhooks);
router.put('/:id/status', authMiddleware.authorize('manage', 'Webhooks'), webhookController.updateWebhookStatus);
router.delete('/:id', authMiddleware.authorize('manage', 'Webhooks'), webhookController.deleteWebhook);
// Dummy endpoint to simulate a webhook trigger
router.post('/trigger-simulate', authMiddleware.authorize('manage', 'Webhooks'), webhookController.simulateWebhookTrigger);
export default router;
