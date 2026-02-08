import { AsyncLocalStorage } from 'async_hooks';
import { Logger } from 'pino';

export interface RequestContext {
  requestId: string;
  logger: Logger;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

export const context = new AsyncLocalStorage<RequestContext>();

export const getContext = (): RequestContext | undefined => {
  return context.getStore();
};

export const getLogger = (): Logger | undefined => {
  return context.getStore()?.logger;
};
