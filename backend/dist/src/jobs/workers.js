import { Worker } from 'bullmq';
import { checkAndAwardBadges } from '../services/badgeService.js';
import { rfmService } from '../services/rfmService.js';
import { customerJourneyService } from '../services/customerJourneyService.js'; // Added import
import { loyaltyService } from '../services/loyaltyService.js'; // Added import
import { marketplaceSyncService } from '../services/marketplaceSyncService.js'; // Added import
import { erpService } from '../services/erpService.js'; // Added import
import { logger } from '../utils/logger.js'; // Assuming logger is available
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
};
// Worker for badge awarding
export const badgeWorker = new Worker('badgeQueue', async (job) => {
    logger.info(`Processing badge job ${job.id}: ${job.name}`);
    if (job.name === 'awardBadges') {
        await checkAndAwardBadges();
    }
}, { connection });
badgeWorker.on('completed', (job) => {
    logger.info(`Badge job ${job.id} completed.`);
});
badgeWorker.on('failed', (job, err) => {
    logger.error(`Badge job ${job?.id} failed with error: ${err.message}`);
});
// Worker for RFM calculation
export const rfmWorker = new Worker('rfmQueue', async (job) => {
    logger.info(`Processing RFM job ${job.id}: ${job.name}`);
    if (job.name === 'calculateRfm') {
        await rfmService.calculateRfmScores();
    }
}, { connection });
rfmWorker.on('completed', (job) => {
    logger.info(`RFM job ${job.id} completed.`);
});
rfmWorker.on('failed', (job, err) => {
    logger.error(`RFM job ${job?.id} failed with error: ${err.message}`);
});
// Worker for other background jobs (e.g., customer journeys)
export const defaultWorker = new Worker('defaultQueue', async (job) => {
    logger.info(`Processing default job ${job.id}: ${job.name}`);
    if (job.name === 'processCustomerJourneys') {
        await customerJourneyService.processCustomerJourneys();
    }
    else if (job.name === 'updateCustomerTiers') {
        await loyaltyService.updateAllCustomerTiers();
    }
    else if (job.name === 'syncMarketplaceOrders') {
        await marketplaceSyncService.syncOrdersFromMarketplace(job.data.integrationId);
    }
    else if (job.name === 'exportErpData') {
        await erpService.exportSalesToERP(new Date(job.data.startDate), new Date(job.data.endDate));
        await erpService.exportExpensesToERP(new Date(job.data.startDate), new Date(job.data.endDate));
    }
}, { connection });
defaultWorker.on('completed', (job) => {
    logger.info(`Default job ${job.id} completed.`);
});
defaultWorker.on('failed', (job, err) => {
    logger.error(`Default job ${job?.id} failed with error: ${err.message}`);
});
// Start a separate worker for each queue
// In production, these might run in separate processes/containers
export const initWorkers = () => {
    logger.info('BullMQ Workers initialized.');
};
