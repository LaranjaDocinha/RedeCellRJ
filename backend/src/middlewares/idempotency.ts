import { Request, Response, NextFunction } from 'express';
import redisClient from '../utils/redisClient.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware de Idempotência.
 * Garante que requisições com a mesma chave (header 'Idempotency-Key') não sejam processadas duas vezes.
 * Ideal para operações financeiras e de criação de recursos (POST/PATCH).
 */
export const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Apenas para métodos que alteram estado
  if (!['POST', 'PATCH', 'PUT'].includes(req.method)) {
    return next();
  }

  const key = req.headers['idempotency-key'] as string;

  if (!key) {
    // Em um sistema estrito, poderíamos rejeitar sem a chave.
    // Aqui, vamos permitir, mas logar um aviso para encorajar o frontend a enviar.
    return next();
  }

  const redisKey = `idempotency:${key}`;

  try {
    const cachedResponse = await redisClient.get(redisKey);

    if (cachedResponse) {
      logger.info(`[Idempotency] Serving cached response for key: ${key}`);
      const { status, body, headers } = JSON.parse(cachedResponse);
      
      // Reconstrói a resposta original
      res.set(headers);
      res.set('X-Idempotency-Hit', 'true');
      return res.status(status).json(body);
    }

    // Hook para capturar a resposta antes de ser enviada
    const originalSend = res.json;

    res.json = (body: any): Response => {
      // Restaura a função para evitar loop ou erros futuros
      res.json = originalSend;

      // Salva no Redis (Expira em 24h)
      if (res.statusCode >= 200 && res.statusCode < 400) {
        const responseToCache = {
          status: res.statusCode,
          body,
          headers: res.getHeaders() // Salva headers importantes (ETag, etc)
        };
        
        redisClient.setEx(redisKey, 86400, JSON.stringify(responseToCache))
          .catch(err => logger.error(`[Idempotency] Failed to cache: ${err}`));
      }

      return res.json(body);
    };

    next();
  } catch (error) {
    logger.error(`[Idempotency] Error: ${error}`);
    // Em caso de erro no Redis, prossegue (Fail open) para não travar o negócio
    next();
  }
};