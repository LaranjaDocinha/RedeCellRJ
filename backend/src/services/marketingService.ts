import { marketingRepository } from '../repositories/marketing.repository.js';
import { whatsappService } from './whatsappService.js';

export const marketingService = {
  async runCampaign(name: string, segment: string, message: string, channel: 'whatsapp' | 'email') {
    const targets = await marketingRepository.getCustomersBySegment(segment);

    if (channel === 'whatsapp') {
      for (const target of targets) {
        // Check if target looks like a phone number
        if (target && target.length > 8) {
          // Basic check
          try {
            // Send directly or queue
            await whatsappService.sendTemplateMessage({
              phone: target,
              templateName: 'marketing_blast', // Assume this template exists
              variables: { message },
            });
          } catch (e) {
            console.error(`Failed to send to ${target}`, e);
          }
        }
      }
    }

    await marketingRepository.logCampaign(name, segment, channel);
    return { sent: targets.length };
  },
};
