import { Request, Response, NextFunction } from 'express';
// @ts-ignore
import onHeadersLib from 'on-headers';

const onHeaders = (onHeadersLib as any).default || onHeadersLib;

/**
 * Middleware para Server-Timing API.
 * Permite visualizar métricas de performance do backend (DB, Cache, CPU) diretamente no Chrome DevTools via Network Tab.
 */
export const performanceTracer = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();
  
  // Estrutura para acumular métricas
  const metrics: Map<string, number> = new Map();

  // Função helper para registrar métricas durante o processamento da request
  (req as any).recordMetric = (name: string, durationMs: number) => {
    metrics.set(name, durationMs);
  };

  // Gancho para injetar o header antes de enviar a resposta
  onHeaders(res, () => {
    const diff = process.hrtime(start);
    const totalDuration = (diff[0] * 1e3 + diff[1] * 1e-6);
    
    metrics.set('total', totalDuration);

    // Formata para o padrão W3C: "db=50.2;dur=50.2, total=60.1;dur=60.1"
    const headerValue = Array.from(metrics.entries())
      .map(([name, dur]) => `${name};dur=${dur.toFixed(2)}`)
      .join(', ');

    res.setHeader('Server-Timing', headerValue);
  });
  
  next();
};
