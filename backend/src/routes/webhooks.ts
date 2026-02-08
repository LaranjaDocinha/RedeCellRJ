import { Router } from 'express';
import * as webhookController from '../controllers/webhookController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { serviceOrderService } from '../services/serviceOrderService.js';

const router = Router();

// Public Webhook for WhatsApp Bot
router.post('/whatsapp/bot', async (req, res) => {
  const { message } = req.body; // Mocked payload structure

  if (!message) return res.status(400).send('No message provided');

  // Simple intent recognition
  if (message.toLowerCase().startsWith('os')) {
    const osId = parseInt(message.split(' ')[1]);
    if (!isNaN(osId)) {
      const order = await serviceOrderService.getServiceOrderById(osId);
      if (order) {
        return res.json({
          reply: `Olá! A Ordem de Serviço #${order.id} está com status: *${order.status}*. \nEquipamento: ${order.product_description}`,
        });
      } else {
        return res.json({ reply: 'Desculpe, não encontrei essa OS.' });
      }
    }
  }

  res.json({ reply: 'Olá! Digite "OS [número]" para consultar o status.' });
});

router.use(authMiddleware.authenticate);

router.post('/', authMiddleware.authorize('manage', 'Webhooks'), webhookController.createWebhook);
router.get('/', authMiddleware.authorize('view', 'Webhooks'), webhookController.getWebhooks);
router.put(
  '/:id/status',
  authMiddleware.authorize('manage', 'Webhooks'),
  webhookController.updateWebhookStatus,
);
router.delete(
  '/:id',
  authMiddleware.authorize('manage', 'Webhooks'),
  webhookController.deleteWebhook,
);

// Dummy endpoint to simulate a webhook trigger
router.post(
  '/trigger-simulate',
  authMiddleware.authorize('manage', 'Webhooks'),
  webhookController.simulateWebhookTrigger,
);

export default router;
