const { query } = require('../db');
const { io } = require('../index'); // Import io

exports.sendMessage = async (to, message) => {
  // Placeholder for sending message via WhatsApp API
  // In a real application, you would use a WhatsApp Business API client here
  console.log(`Sending WhatsApp message to ${to}: ${message}`);
  // Simulate API call
  return { status: 'success', messageId: 'simulated_message_id' };
};

exports.saveIncomingMessage = async (conversationId, senderType, messageContent, externalMessageId) => {
  const result = await query(
    'INSERT INTO whatsapp_messages (conversation_id, sender_type, message_content, direction, external_message_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
    [conversationId, senderType, messageContent, 'inbound', externalMessageId]
  );
  const newMessage = result.rows[0];
  io.emit('new_whatsapp_message', newMessage); // Emit event
  return newMessage;
};

exports.saveOutgoingMessage = async (conversationId, senderType, messageContent, externalMessageId) => {
  const result = await query(
    'INSERT INTO whatsapp_messages (conversation_id, sender_type, message_content, direction, external_message_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
    [conversationId, senderType, messageContent, 'outbound', externalMessageId]
  );
  const newMessage = result.rows[0];
  io.emit('new_whatsapp_message', newMessage); // Emit event
  return newMessage;
};

exports.getConversationsFromDb = async () => {
  const result = await query('SELECT * FROM whatsapp_conversations ORDER BY last_message_timestamp DESC;');
  return result.rows;
};

exports.getMessagesByConversationId = async (conversationId) => {
  const result = await query('SELECT * FROM whatsapp_messages WHERE conversation_id = $1 ORDER BY timestamp ASC;', [conversationId]);
  return result.rows;
};

exports.findOrCreateConversation = async (customerId) => {
  let conversation = await query('SELECT * FROM whatsapp_conversations WHERE customer_id = $1;', [customerId]);

  if (conversation.rows.length === 0) {
    // Create new conversation
    const newConversation = await query('INSERT INTO whatsapp_conversations (customer_id) VALUES ($1) RETURNING *;', [customerId]);
    conversation = newConversation;
  }
  return conversation.rows[0];
};
