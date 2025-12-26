import { Worker } from 'bullmq';
import { checkAndAwardBadges } from '../services/badgeService.js';
import { rfmService } from '../services/rfmService.js';
import { customerJourneyService } from '../services/customerJourneyService.js';
import { loyaltyService } from '../services/loyaltyService.js';
import { marketplaceSyncService } from '../services/marketplaceSyncService.js';
import { erpService } from '../services/erpService.js';
import { logger } from '../utils/logger.js';
import IORedis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  retryStrategy(times: number) {
    if (times > 3) {
      logger.warn('Redis (Worker) connection failed too many times. Disabling workers for this session.');
      return null;
    }
    return Math.min(times * 50, 2000);
  },
};

// Export workers as let so they can be initialized optionally
export let badgeWorker: Worker | undefined;
export let rfmWorker: Worker | undefined;
export let defaultWorker: Worker | undefined;

const checkRedisConnection = async (): Promise<boolean> => {
  const client = new IORedis(redisConfig);
  return new Promise((resolve) => {
    client.on('connect', () => {
      client.disconnect();
      resolve(true);
    });
    client.on('error', (err) => {
      client.disconnect();
      resolve(false);
    });
  });
};

export const initWorkers = async () => {
  if (process.env.NODE_ENV === 'test') {
    logger.info('Workers initialization skipped in test environment.');
    return;
  }

  const isRedisAvailable = await checkRedisConnection();
  if (!isRedisAvailable) {
    logger.warn('Skipping worker initialization because Redis is not available.');
    return;
  }

  try {
    // Worker for badge awarding
    badgeWorker = new Worker('badgeQueue', async (job) => {
      logger.info(`Processing badge job ${job.id}: ${job.name}`);
      if (job.name === 'awardBadges') {
        await checkAndAwardBadges();
      }
    }, { connection: redisConfig });

    badgeWorker.on('completed', (job) => {
      logger.info(`Badge job ${job.id} completed.`);
    });

    badgeWorker.on('failed', (job, err) => {
      logger.error(`Badge job ${job?.id} failed with error: ${err.message}`);
    });

    // Worker for RFM calculation
    rfmWorker = new Worker('rfmQueue', async (job) => {
      logger.info(`Processing RFM job ${job.id}: ${job.name}`);
      if (job.name === 'calculateRfm') {
        await rfmService.calculateRfmScores();
      }
    }, { connection: redisConfig });

    rfmWorker.on('completed', (job) => {
      logger.info(`RFM job ${job.id} completed.`);
    });

    rfmWorker.on('failed', (job, err) => {
      logger.error(`RFM job ${job?.id} failed with error: ${err.message}`);
    });

    // Worker for other background jobs
    defaultWorker = new Worker('defaultQueue', async (job) => {
      logger.info(`Processing default job ${job.id}: ${job.name}`);
      if (job.name === 'processCustomerJourneys') {
        await customerJourneyService.processCustomerJourneys();
      } else if (job.name === 'updateCustomerTiers') {
        await loyaltyService.updateAllCustomerTiers();
      } else if (job.name === 'syncMarketplaceOrders') {
        await marketplaceSyncService.syncOrdersFromMarketplace(job.data.integrationId);
      } else if (job.name === 'exportErpData') {
        await erpService.exportSalesToERP(new Date(job.data.startDate), new Date(job.data.endDate));
        await erpService.exportExpensesToERP(new Date(job.data.startDate), new Date(job.data.endDate));
      }
    }, { connection: redisConfig });

    defaultWorker.on('completed', (job) => {
      logger.info(`Default job ${job.id} completed.`);
    });

    defaultWorker.on('failed', (job, err) => {
      logger.error(`Default job ${job?.id} failed with error: ${err.message}`);
    });

    logger.info('BullMQ Workers initialized.');

  } catch (error) {
     logger.error('Failed to initialize workers:', error);
     badgeWorker = undefined;
     rfmWorker = undefined;
     defaultWorker = undefined;
  }
};
