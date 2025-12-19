import { describe, it, expect } from 'vitest';
import * as chatService from '../../../src/services/chatService';

describe('ChatService', () => {
  describe('startChatSession', () => {
    it('should return a simulated chat session', async () => {
      const customerId = 123;
      const result = await chatService.startChatSession(customerId);
      expect(result.success).toBe(true);
      expect(result.sessionId).toMatch(/^chat-/);
      expect(result.message).toContain(`customer ${customerId}`);
    });
  });

  describe('sendMessage', () => {
    it('should return success for sending message', async () => {
      const sessionId = 'chat-session-123';
      const message = 'Hello, support!';
      const result = await chatService.sendMessage(sessionId, message);
      expect(result.success).toBe(true);
      expect(result.message).toContain(`session ${sessionId}`);
    });
  });

  describe('getChatHistory', () => {
    it('should return simulated chat history', async () => {
      const sessionId = 'chat-session-123';
      const result = await chatService.getChatHistory(sessionId);
      expect(result.success).toBe(true);
      expect(result.history).toHaveLength(1);
      expect(result.history[0].sender).toBe('Agent');
    });
  });
});