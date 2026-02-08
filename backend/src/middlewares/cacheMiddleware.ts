import { Request, Response, NextFunction } from 'express';
import redisClient from '../utils/redisClient.js';
import { logger } from '../utils/logger.js';

type CacheOptions = {
  duration?: number; // Duration in seconds. Default: 60
  keyPrefix?: string; // Prefix for cache keys. Default: 'cache'
};

/**
 * Middleware de Cache usando Redis.
 * Armazena a resposta GET no Redis e a serve se disponível.
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const duration = options.duration || 60;
  const prefix = options.keyPrefix || 'cache';

  return async (req: Request, res: Response, next: NextFunction) => {
    // Apenas cacheia requisições GET
    if (req.method !== 'GET') {
      return next();
    }

    // Se o Redis não estiver conectado, passa direto
    if (!redisClient.isOpen) {
      return next();
    }

    const key = `${prefix}:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redisClient.get(key);

      if (cachedResponse) {
        // Cache Hit
        logger.debug(`[Cache] HIT for ${key}`);
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cachedResponse));
      }

      // Cache Miss - Intercepta o res.json para salvar no cache
      logger.debug(`[Cache] MISS for ${key}`);
      res.setHeader('X-Cache', 'MISS');

      const originalJson = res.json;

      res.json = (body: any): Response => {
        // Restaura a função original
        res.json = originalJson;

        // Salva no Redis de forma assíncrona (não bloqueia a resposta)
        if (res.statusCode === 200) {
          redisClient
            .setEx(key, duration, JSON.stringify(body))
            .catch((err) => logger.error(`[Cache] Set Error: ${err.message}`));
        }

        // Envia a resposta
        return res.json(body);
      };

      next();
    } catch (error) {
      logger.error(`[Cache] Middleware Error: ${error}`);
      next(); // Em caso de erro, segue sem cache
    }
  };
};

/**
 * Utilitário para invalidar cache por padrão (ex: 'cache:/api/v1/portal/orders/*')
 */
export const invalidateCache = async (pattern: string) => {
  if (!redisClient.isOpen) return;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`[Cache] Invalidated ${keys.length} keys for pattern ${pattern}`);
    }
  } catch (error) {
    logger.error(`[Cache] Invalidation Error: ${error}`);
  }
};
