const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// Route to send a WhatsApp message
router.post('/send', whatsappController.sendWhatsAppMessage);

// Route to handle incoming WhatsApp webhooks
router.post('/webhook', whatsappController.handleWhatsAppWebhook);

// Route to get all WhatsApp conversations
router.get('/conversations', whatsappController.getConversations);

// Route to get messages for a specific conversation
router.get('/conversations/:conversationId/messages', whatsappController.getMessages);

module.exports = router;
