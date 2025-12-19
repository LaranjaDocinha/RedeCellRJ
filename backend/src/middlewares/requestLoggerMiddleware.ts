import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js'; // Importar o logger aprimorado
// UserPayload já é injetado em req.user e autenticado pelo authMiddleware
// Para evitar problemas de tipagem sem um .d.ts, faremos um cast para 'any' ou extenderemos a interface Request globalmente.
// Por simplicidade aqui, faremos o cast.

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  
  // Criar um child logger com o contexto da requisição
  const requestSpecificLogger = logger.child({
    requestId: requestId,
    // Adicionar userId ao logger child se o usuário estiver autenticado
    userId: (req as any).user ? (req as any).user.id : undefined,
    userEmail: (req as any).user ? (req as any).user.email : undefined,
  });

  // Anexar o logger child e o requestId à requisição
  // Para que outros middlewares e handlers possam acessá-lo.
  // Em um projeto real, a extensão da interface Request globalmente seria preferível.
  Object.assign(req, { logger: requestSpecificLogger, requestId: requestId });


  // Log da requisição recebida
  (req as any).logger.info({
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  }, 'Request received');

  // Log da requisição finalizada
  res.on('finish', () => {
    (req as any).logger.info({
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: res.get('X-Response-Time') ? parseInt(res.get('X-Response-Time') as string) : undefined,
    }, 'Request completed');
  });

  next();
};
