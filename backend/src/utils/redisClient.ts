import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 2000, // Desiste após 2 segundos se o Redis não responder
    reconnectStrategy: (retries) => {
      if (retries > 0) {
        logger.warn('Redis offline: Desativando cache para esta sessão.');
        return false; // Para de tentar reconectar
      }
      return 1000;
    }
  }
});

redisClient.on('connect', () => logger.info('Connected to Redis!'));
redisClient.on('error', (err) => {
  // Apenas loga o erro, não deixa crashar a aplicação
  if (err.code === 'ECONNREFUSED') {
    logger.warn('Redis não disponível. Continuando sem suporte a cache/filas.');
  } else {
    logger.error('Redis Client Error', err);
  }
});

if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      await redisClient.connect();
    } catch (err) {
      // Falha silenciosa no startup
      logger.warn('Aviso: Backend rodando sem Redis.');
    }
  })();
}

export default redisClient;