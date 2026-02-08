import redisClient from './redisClient';
import { logger } from './logger';

export const cacheService = {
  /**
   * Envolve uma função com lógica de cache.
   * @param key Chave base do cache
   * @param ttl Tempo de vida em segundos
   * @param fn Função original
   */
  async wrap<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
    if (!redisClient.isOpen) {
      return fn();
    }

    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }

      const result = await fn();
      await redisClient.set(key, JSON.stringify(result), { EX: ttl });
      return result;
    } catch (error) {
      logger.error({ error, key }, 'Cache wrap error');
      return fn(); // Fallback para a função original em caso de erro no Redis
    }
  },

  async invalidate(pattern: string) {
    if (!redisClient.isOpen) return;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  },
};
