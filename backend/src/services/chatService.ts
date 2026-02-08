import pool from '../db/index.js';
import { logger } from '../utils/logger.js';

export const chatService = {
  async saveMessage({
    senderId,
    receiverId,
    content,
    type = 'text',
    fileUrl,
  }: {
    senderId: string;
    receiverId?: string;
    content: string;
    type?: string;
    fileUrl?: string;
  }) {
    try {
      const { rows } = await pool.query(
        'INSERT INTO chat_messages (sender_id, receiver_id, content, type, file_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [senderId, receiverId || null, content, type, fileUrl],
      );
      return rows[0];
    } catch (error) {
      logger.error('Error saving chat message', error);
      throw error;
    }
  },

  async getMessages(userId: string, contactId?: string, limit = 50, offset = 0) {
    try {
      let query = '';
      let params = [];

      if (contactId) {
        // Chat privado
        query = `
          SELECT m.*, u.name as sender_name 
          FROM chat_messages m
          JOIN users u ON m.sender_id = u.id
          WHERE (sender_id = $1 AND receiver_id = $2) 
             OR (sender_id = $2 AND receiver_id = $1)
          ORDER BY m.created_at DESC
          LIMIT $3 OFFSET $4
        `;
        params = [userId, contactId, limit, offset];
      } else {
        // Chat Geral (Público)
        query = `
          SELECT m.*, u.name as sender_name 
          FROM chat_messages m
          JOIN users u ON m.sender_id = u.id
          WHERE m.receiver_id IS NULL
          ORDER BY m.created_at DESC
          LIMIT $1 OFFSET $2
        `;
        params = [limit, offset];
      }

      const { rows } = await pool.query(query, params);
      return rows.reverse();
    } catch (error) {
      logger.error('Error fetching chat messages', error);
      throw error;
    }
  },

  async markAsRead(messageIds: number[]) {
    await pool.query('UPDATE chat_messages SET is_read = TRUE WHERE id = ANY($1)', [messageIds]);
  },

  // Simulated methods for testing/compatibility
  async startChatSession(_customerId: number) {
    return { success: true, sessionId: `chat-${_customerId}-${Date.now()}` };
  },

  async sendMessage(_sessionId: string, _message: string) {
    return { success: true, message: `Message sent to session ${_sessionId}` };
  },

  async getChatHistory(_sessionId: string) {
    return { success: true, history: [{ role: 'system', content: 'Chat session started' }] };
  },
};
