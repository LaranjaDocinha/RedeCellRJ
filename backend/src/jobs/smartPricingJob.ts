import cron from 'node-cron';
import { smartPricingService } from '../services/smartPricingService.js';
import { logger } from '../utils/logger.js';

export const initSmartPricingJob = () => {
  // Roda todos os dias às 03:00 da manhã
  cron.schedule('0 3 * * *', async () => {
    logger.info('Running scheduled Smart Pricing job...');
    try {
      await smartPricingService.runPricingRoutine();
    } catch (error) {
      logger.error('Error running Smart Pricing job:', error);
    }
  });

  logger.info('Smart Pricing job scheduled (03:00 AM daily).');
};
