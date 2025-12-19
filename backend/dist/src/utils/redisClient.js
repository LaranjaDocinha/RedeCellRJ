import { createClient } from 'redis';
import { logger } from '../utils/logger.js'; // Assuming logger is available
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.on('connect', () => logger.info('Connected to Redis!'));
redisClient.on('error', (err) => logger.error('Redis Client Error', err));
// Connect to Redis when the module is imported
(async () => {
    try {
        await redisClient.connect();
    }
    catch (err) {
        logger.error('Could not connect to Redis on startup', err);
    }
})();
export default redisClient;
