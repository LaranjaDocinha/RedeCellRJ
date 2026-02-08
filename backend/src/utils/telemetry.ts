import { NodeSDK } from '@opentelemetry/sdk-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const serviceName = process.env.OTEL_SERVICE_NAME || 'redev-backend';

// Configure the Jaeger Exporter to send traces to the collector via HTTP
const exporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  }),
  traceExporter: exporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      // The fs instrumentation is very noisy, so we disable it.
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

export const initTelemetry = () => {
  // Initialize the SDK and start tracing
  sdk.start();
  console.log('OpenTelemetry tracing initialized for service:', serviceName);
};

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
