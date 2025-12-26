import { Queue } from 'bullmq';
import { logger } from '../utils/logger.js';
import IORedis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Obrigatório para BullMQ
  retryStrategy(times: number) {
    if (times > 3) {
      logger.warn('Redis connection failed too many times. Disabling queues for this session.');
      return null; // Stop retrying
    }
    return Math.min(times * 50, 2000);
  },
};

export let badgeQueue: Queue | undefined;
export let rfmQueue: Queue | undefined;
export let defaultQueue: Queue | undefined;

let isRedisAvailable = false;

// Check connection before creating queues
const checkRedisConnection = async (): Promise<boolean> => {
  const client = new IORedis(redisConfig);
  return new Promise((resolve) => {
    client.on('connect', () => {
      logger.info('Redis (BullMQ) connected successfully.');
      client.disconnect();
      resolve(true);
    });
    client.on('error', (err) => {
      logger.warn(`Redis (BullMQ) connection check failed: ${err.message}`);
      client.disconnect();
      resolve(false);
    });
  });
};

export const initQueues = async () => {
  if (process.env.NODE_ENV !== 'test') {
    // Primeiro verifica se o Redis está vivo para evitar loop infinito de reconexão do BullMQ
    isRedisAvailable = await checkRedisConnection();

    if (!isRedisAvailable) {
      logger.warn('Skipping queue initialization because Redis is not available.');
      return;
    }

    // Se chegou aqui, podemos tentar instanciar as filas com segurança
    try {
        // Criar uma conexão compartilhada ou deixar cada fila criar a sua (com a config segura)
        // BullMQ gerencia conexões internamente, mas precisamos garantir que ele não tente reconectar pra sempre se cair depois
        
        badgeQueue = new Queue('badgeQueue', { connection: redisConfig });
        rfmQueue = new Queue('rfmQueue', { connection: redisConfig });
        defaultQueue = new Queue('defaultQueue', { connection: redisConfig });

        // Optional: Log events for queues in non-test environments
        badgeQueue.on('error', (err) => logger.error(`Badge Queue error: ${err}`));
        rfmQueue.on('error', (err) => logger.error(`RFM Queue error: ${err}`));
        defaultQueue.on('error', (err) => logger.error(`Default Queue error: ${err}`));

        logger.info('Queues initialized successfully.');
    } catch (error) {
        logger.error('Failed to initialize queues despite successful check:', error);
        badgeQueue = undefined;
        rfmQueue = undefined;
        defaultQueue = undefined;
    }
  }
};

export const addJob = async (queue: Queue | undefined, name: string, data: any, options?: object) => {
  if (!queue) {
    // Silencia o warning se sabemos que o Redis está off
    if (isRedisAvailable) {
        logger.warn(`Job ${name} not added because queue ${name} is not initialized.`);
    }
    return;
  }
  try {
    await queue.add(name, data, options);
    logger.info(`Job ${name} added to queue ${queue.name}`);
  } catch (error) {
    logger.error(`Error adding job ${name} to queue ${queue.name}:`, error);
  }
};