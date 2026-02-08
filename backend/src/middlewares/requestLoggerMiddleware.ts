import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
import { context } from '../utils/context.js';
import { context as otelContext, trace } from '@opentelemetry/api';

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  const startTime = process.hrtime();

  // Obter Trace ID do OpenTelemetry para correlação
  const activeSpan = trace.getSpan(otelContext.active());
  const traceId = activeSpan?.spanContext().traceId;

  // Criar um child logger com o contexto da requisição
  const requestSpecificLogger = logger.child({
    requestId: requestId,
    traceId: traceId,
  });

  // Anexar o logger child e o requestId à requisição (legacy support)
  Object.assign(req, { logger: requestSpecificLogger, requestId: requestId });

  // Log da requisição recebida
  requestSpecificLogger.info(
    {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
    'Request received',
  );

  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const responseTimeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

    requestSpecificLogger.info(
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTimeMs}ms`,
      },
      'Request completed',
    );
  });

  // Run next() inside the AsyncLocalStorage context
  context.run(
    {
      requestId,
      logger: requestSpecificLogger,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
    () => {
      next();
    },
  );
};
