import CircuitBreaker from 'opossum';
import { logger } from './logger.js';

const options = {
  timeout: 5000, // Se a função demorar mais de 5s, considera falha
  errorThresholdPercentage: 50, // Abre o circuito se 50% das requisições falharem
  resetTimeout: 30000, // Tenta fechar o circuito após 30s
};

/**
 * Cria um Circuit Breaker para uma função assíncrona.
 * @param action Função a ser protegida
 * @param name Nome para logs
 */
export function createCircuitBreaker<T, Args extends any[]>(
  action: (...args: Args) => Promise<T>,
  name: string,
) {
  const breaker = new CircuitBreaker(action, options);

  breaker.on('open', () => logger.warn(`Circuit Breaker [${name}] OPEN`));
  breaker.on('halfOpen', () => logger.info(`Circuit Breaker [${name}] HALF_OPEN`));
  breaker.on('close', () => logger.info(`Circuit Breaker [${name}] CLOSED`));
  breaker.on('fallback', () => logger.warn(`Circuit Breaker [${name}] FALLBACK executed`));

  return breaker;
}
