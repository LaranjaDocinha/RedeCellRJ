import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger.js';

/**
 * Middleware de Engenharia do Caos.
 * Útil para testar a resiliência do frontend e timeouts.
 * Ativado apenas se ENABLE_CHAOS=true no .env
 */
const chaosMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.ENABLE_CHAOS !== 'true') {
    return next();
  }

  // 10% de chance de erro
  if (Math.random() < 0.1) {
    logger.warn('[CHAOS] Simulando erro 500 aleatório');
    return res.status(500).json({
      status: 'error',
      message: 'Chaos Monkey: Falha simulada do servidor.',
    });
  }

  // 20% de chance de latência alta (1s - 5s)
  if (Math.random() < 0.2) {
    const delay = Math.floor(Math.random() * 4000) + 1000;
    logger.warn(`[CHAOS] Injetando latência de ${delay}ms`);
    setTimeout(next, delay);
    return;
  }

  next();
};

export default chaosMiddleware;