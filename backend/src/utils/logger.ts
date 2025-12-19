import pino from 'pino';

// Serializer para erros, para que o stack trace seja incluído nos logs JSON
export const errorSerializer = (err: any) => {
  if (err instanceof Error) {
    return {
      message: err.message,
      name: err.name,
      stack: err.stack,
      // Adicionar outras propriedades do erro se necessário
    };
  }
  return err;
};

// Configuração para pino-pretty em desenvolvimento
const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  },
});

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    // Adicionar informações base para o log
    base: {
      pid: process.pid,
      hostname: process.env.HOSTNAME || 'unknown',
      serviceName: process.env.OTEL_SERVICE_NAME || 'backend-service', // Reutiliza o nome do serviço OTEL
      environment: process.env.NODE_ENV || 'development',
    },
    // Serializadores para formatar objetos específicos no log
    serializers: {
      err: errorSerializer,
      error: errorSerializer,
    },
  },
  // Usar pino-pretty apenas em desenvolvimento
  process.env.NODE_ENV === 'development' ? transport : undefined
);