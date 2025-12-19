import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as webhookService from '../../../src/services/webhookService.js';
import axios from 'axios';

const mockQuery = vi.fn();
vi.mock('../../../src/db/index.js', () => ({
  getPool: vi.fn(() => ({
    query: mockQuery,
  })),
}));

vi.mock('axios');

describe('WebhookService', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    vi.mocked(axios.post).mockReset();
  });

  describe('createWebhook', () => {
    it('should create a webhook', async () => {
      const mockWebhook = { id: 1, event_type: 'sale.created', callback_url: 'http://cb.com' };
      mockQuery.mockResolvedValueOnce({ rows: [mockWebhook] });

      const result = await webhookService.createWebhook('sale.created', 'http://cb.com', 'secret');
      expect(result).toEqual(mockWebhook);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO webhooks'),
        ['sale.created', 'http://cb.com', 'secret']
      );
    });
  });

  describe('updateWebhookStatus', () => {
    it('should update webhook status', async () => {
      const mockWebhook = { id: 1, is_active: false };
      mockQuery.mockResolvedValueOnce({ rows: [mockWebhook] });

      const result = await webhookService.updateWebhookStatus(1, false);
      expect(result).toEqual(mockWebhook);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE webhooks SET is_active = $1 WHERE id = $2'),
        [false, 1]
      );
    });
  });

  describe('deleteWebhook', () => {
    it('should delete a webhook', async () => {
      const mockWebhook = { id: 1 };
      mockQuery.mockResolvedValueOnce({ rows: [mockWebhook] });

      const result = await webhookService.deleteWebhook(1);
      expect(result).toEqual(mockWebhook);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM webhooks'),
        [1]
      );
    });
  });

  describe('getWebhooks', () => {
    it('should return all webhooks', async () => {
      const mockWebhooks = [{ id: 1 }, { id: 2 }];
      mockQuery.mockResolvedValueOnce({ rows: mockWebhooks });

      const result = await webhookService.getWebhooks();
      expect(result).toEqual(mockWebhooks);
    });
  });

  describe('triggerWebhook', () => {
    it('should trigger webhooks for event type', async () => {
      const mockWebhooks = [
        { id: 1, callback_url: 'http://url1.com', secret: 's1' },
        { id: 2, callback_url: 'http://url2.com', secret: null },
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockWebhooks });
      vi.mocked(axios.post).mockResolvedValue({ status: 200 });

      const payload = { data: 'test' };
      await webhookService.triggerWebhook('sale.created', payload);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM webhooks WHERE event_type = $1 AND is_active = TRUE'),
        ['sale.created']
      );
      expect(axios.post).toHaveBeenCalledTimes(2);
      expect(axios.post).toHaveBeenNthCalledWith(1, 
        'http://url1.com', 
        payload,
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Webhook-Signature': expect.any(String)
          })
        })
      );
      expect(axios.post).toHaveBeenNthCalledWith(2, 
        'http://url2.com', 
        payload,
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Webhook-Signature': ''
          })
        })
      );
    });

    it('should handle axios error gracefully', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ callback_url: 'http://fail.com' }] });
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'));

      await expect(webhookService.triggerWebhook('sale.created', {})).resolves.toBeUndefined();
    });
  });
});
