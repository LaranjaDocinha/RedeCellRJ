import { Queue } from 'bullmq';
import { logger } from '../utils/logger.js';
import redisClient from '../utils/redisClient.js';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
};

export let badgeQueue: Queue | undefined;
export let rfmQueue: Queue | undefined;
export let defaultQueue: Queue | undefined;

export const initQueues = () => {
  if (process.env.NODE_ENV !== 'test') {
    badgeQueue = new Queue('badgeQueue', { connection });
    rfmQueue = new Queue('rfmQueue', { connection });
    defaultQueue = new Queue('defaultQueue', { connection });

    // Optional: Log events for queues in non-test environments
    badgeQueue.on('error', (err) => logger.error(`Badge Queue error: ${err}`));
    rfmQueue.on('error', (err) => logger.error(`RFM Queue error: ${err}`));
    defaultQueue.on('error', (err) => logger.error(`Default Queue error: ${err}`));
  }
};

export const addJob = async (queue: Queue | undefined, name: string, data: any, options?: object) => {
  if (!queue) {
    logger.warn(`Job ${name} not added because queue ${name} is not initialized.`);
    return;
  }
  try {
    await queue.add(name, data, options);
    logger.info(`Job ${name} added to queue ${queue.name}`);
  } catch (error) {
    logger.error(`Error adding job ${name} to queue ${queue.name}:`, error);
  }
};
