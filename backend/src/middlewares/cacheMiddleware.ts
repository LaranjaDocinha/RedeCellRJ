import { Request, Response, NextFunction } from 'express';
import redisClient from '../utils/redisClient.js';
import { logger } from '../utils/logger.js'; // Assuming logger is available
import { UserPayload } from '../types/express.js'; // Importar UserPayload

const DEFAULT_CACHE_DURATION_SECONDS = 300; // 5 minutes

export const cacheMiddleware = (durationSeconds: number = DEFAULT_CACHE_DURATION_SECONDS) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Para rotas autenticadas, incluir o userId na cacheKey para caches personalizados
    let cacheKey = req.originalUrl;
    if (req.user && (req.user as UserPayload).id) {
        cacheKey = `${(req.user as UserPayload).id}:${req.originalUrl}`;
    }

    try {
      const cachedResponse = await redisClient.get(cacheKey);

      if (cachedResponse) {
        logger.info(`Cache HIT for ${cacheKey}`);
        return res.send(JSON.parse(cachedResponse));
      }

      logger.info(`Cache MISS for ${cacheKey}`);

      // Monkey patch res.send to intercept the response and cache it
      const originalSend = res.send;
      res.send = (body: any) => {
        redisClient.setEx(cacheKey, durationSeconds, JSON.stringify(body))
          .catch(err => logger.error(`Error setting cache for ${cacheKey}`, err));
        originalSend.call(res, body);
        return res;
      };
      next();
    } catch (error) {
      logger.error('Error in cache middleware:', error);
      next(); // Continue to route even if cache fails
    }
  };
};

export const clearCache = async (cacheKey?: string) => {
  try {
    if (cacheKey) {
      await redisClient.del(cacheKey);
      logger.info(`Cache cleared for key: ${cacheKey}`);
    } else {
      await redisClient.flushAll(); // DANGER: Clears ALL keys in Redis
      logger.warn('ALL Redis cache has been flushed!');
    }
  } catch (error) {
    logger.error('Error clearing cache:', error);
  }
};
