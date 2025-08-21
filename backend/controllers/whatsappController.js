const whatsappService = require('../services/whatsappService');

exports.sendWhatsAppMessage = async (req, res) => {
  try {
    const { to, message } = req.body;
    // In a real scenario, you would validate 'to' and 'message'
    const result = await whatsappService.sendMessage(to, message);
    // Assuming 'to' is a customer ID for now, in a real scenario, it would be a phone number
    // You'd also need to find or create a conversation based on the 'to' number
    // For now, let's just save the outgoing message
    const conversation = await whatsappService.findOrCreateConversation(to); // Assuming 'to' is customerId for now
    await whatsappService.saveOutgoingMessage(conversation.conversation_id, 'system', message, result.messageId);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

exports.handleWhatsAppWebhook = async (req, res) => {
  try {
    // This is where incoming WhatsApp messages/events would be processed
    // You'd parse the webhook payload and save messages to the database
    console.log('Incoming WhatsApp Webhook:', req.body);

    // --- Placeholder for actual webhook parsing and saving ---
    // Example: Assuming req.body contains { from: 'customer_phone_number', message: 'text_message' }
    const { from, message } = req.body; // This will vary based on the actual webhook structure

    // In a real scenario, you'd map 'from' to a customer_id in your 'customers' table
    // For now, let's assume 'from' is directly usable as a customerId for findOrCreateConversation
    const customerId = from; // Placeholder: You'd need to resolve this to an actual customer_id

    if (customerId && message) {
      const conversation = await whatsappService.findOrCreateConversation(customerId);
      await whatsappService.saveIncomingMessage(conversation.conversation_id, 'customer', message, 'webhook_message_id'); // 'webhook_message_id' would come from the webhook payload
    }
    // --- End Placeholder ---

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Error handling WhatsApp webhook:', error);
    res.status(500).json({ success: false, message: 'Failed to process webhook', error: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await whatsappService.getConversationsFromDb();
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await whatsappService.getMessagesByConversationId(conversationId);
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
};