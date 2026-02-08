import pino, { Logger } from 'pino';
import { getLogger as getContextLogger } from './context.js';

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
});

// A simpler way to delegate without full Proxy recursion risk
const delegate = (method: keyof Logger) => {
  return (...args: any[]) => {
    const contextLogger = getContextLogger();
    // Use context logger if available and it's not our base logger to avoid loops
    if (contextLogger && typeof contextLogger[method] === 'function') {
      return (contextLogger[method] as any)(...args);
    }
    return (pinoLogger[method] as any)(...args);
  };
};

export const logger = {
  ...pinoLogger, // Keep properties
  info: delegate('info'),
  error: delegate('error'),
  warn: delegate('warn'),
  debug: delegate('debug'),
  fatal: delegate('fatal'),
  trace: delegate('trace'),
  child: (bindings: pino.Bindings) => {
    const contextLogger = getContextLogger();
    if (contextLogger) return contextLogger.child(bindings);
    return pinoLogger.child(bindings);
  },
} as unknown as Logger;

export const errorSerializer = pino.stdSerializers.err;
