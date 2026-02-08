import { describe, it, expect, vi, beforeEach } from 'vitest';
import { marketingService } from '../../../src/services/marketingService.js';
import { marketingRepository } from '../../../src/repositories/marketing.repository.js';
import { whatsappService } from '../../../src/services/whatsappService.js';

vi.mock('../../../src/repositories/marketing.repository.js', () => ({
  marketingRepository: {
    getCustomersBySegment: vi.fn(),
    logCampaign: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../../src/services/whatsappService.js', () => ({
  whatsappService: {
    sendTemplateMessage: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('MarketingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('runCampaign', () => {
    it('should send whatsapp messages to customers in segment', async () => {
      vi.mocked(marketingRepository.getCustomersBySegment).mockResolvedValue(['5511999998888', '5511999997777']);

      const result = await marketingService.runCampaign('Test', 'VIP', 'Hello', 'whatsapp');

      expect(result.sent).toBe(2);
      expect(whatsappService.sendTemplateMessage).toHaveBeenCalledTimes(2);
      expect(marketingRepository.logCampaign).toHaveBeenCalledWith('Test', 'VIP', 'whatsapp');
    });

    it('should skip invalid phone numbers', async () => {
      vi.mocked(marketingRepository.getCustomersBySegment).mockResolvedValue(['123', '5511999998888']);

      const result = await marketingService.runCampaign('Test', 'VIP', 'Hello', 'whatsapp');

      expect(result.sent).toBe(2);
      expect(whatsappService.sendTemplateMessage).toHaveBeenCalledTimes(1);
    });
  });
});
