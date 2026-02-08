import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatService } from '../../../src/services/chatService.js';
import pool from '../../../src/db/index.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
  },
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

describe('ChatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveMessage', () => {
    it('should save a message successfully', async () => {
      const mockMsg = { id: 1, content: 'Hi' };
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [mockMsg] } as any);

      const result = await chatService.saveMessage({ senderId: 'u1', content: 'Hi' });

      expect(result).toEqual(mockMsg);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO chat_messages'), expect.any(Array));
    });

    it('should throw error and log it if query fails', async () => {
      vi.mocked(pool.query).mockRejectedValueOnce(new Error('Fail'));
      await expect(chatService.saveMessage({ senderId: 'u1', content: 'Hi' })).rejects.toThrow('Fail');
    });
  });

  describe('getMessages', () => {
    it('should fetch private messages between two users', async () => {
      const mockMessages = [{ id: 1, content: 'A' }, { id: 2, content: 'B' }];
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [...mockMessages].reverse() } as any);

      const result = await chatService.getMessages('u1', 'u2');

      expect(result).toEqual(mockMessages);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('receiver_id = $2'), expect.arrayContaining(['u1', 'u2']));
    });

    it('should fetch public messages if no contactId', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);
      await chatService.getMessages('u1');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('receiver_id IS NULL'), expect.any(Array));
    });
  });

  describe('markAsRead', () => {
    it('should update messages status', async () => {
      await chatService.markAsRead([1, 2]);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE chat_messages SET is_read = TRUE'), [[1, 2]]);
    });
  });

  describe('Simulated Methods', () => {
    it('should return a simulated chat session', async () => {
      const result = await chatService.startChatSession(123);
      expect(result.success).toBe(true);
      expect(result.sessionId).toMatch(/^chat-/);
    });

    it('should return success for sending message', async () => {
      const result = await chatService.sendMessage('s1', 'msg');
      expect(result.success).toBe(true);
    });

    it('should return simulated chat history', async () => {
      const result = await chatService.getChatHistory('s1');
      expect(result.success).toBe(true);
      expect(result.history).toHaveLength(1);
    });
  });
});
