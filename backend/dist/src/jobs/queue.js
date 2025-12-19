import { Queue } from 'bullmq';
import { logger } from '../utils/logger.js'; // Assuming logger is available
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
};
// Queue for awarding badges
export const badgeQueue = new Queue('badgeQueue', { connection });
// Queue for calculating RFM scores
export const rfmQueue = new Queue('rfmQueue', { connection });
// Queue for other background jobs
export const defaultQueue = new Queue('defaultQueue', { connection });
// Add jobs to queues - these will be processed by workers
export const addJob = async (queue, name, data, options) => {
    try {
        await queue.add(name, data, options);
        logger.info(`Job ${name} added to queue ${queue.name}`);
    }
    catch (error) {
        logger.error(`Error adding job ${name} to queue ${queue.name}:`, error);
    }
};
