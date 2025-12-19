import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { BatchSpanProcessor, } from '@opentelemetry/sdk-trace-node';
const serviceName = process.env.OTEL_SERVICE_NAME || 'backend-service';
const collectorEndpoint = process.env.OTEL_COLLECTOR_ENDPOINT || 'http://localhost:4318/v1/traces';
const traceExporter = new OTLPTraceExporter({
    url: collectorEndpoint,
});
const spanProcessor = new BatchSpanProcessor(traceExporter);
const sdk = new NodeSDK({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    spanProcessor: spanProcessor,
    instrumentations: [new ExpressInstrumentation(), new PgInstrumentation()],
});
// Optionally, add a console exporter for debugging
// if (process.env.NODE_ENV !== 'production') {
//   sdk.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
// }
sdk.start();
console.log('OpenTelemetry initialized');
process.on('SIGTERM', () => {
    sdk
        .shutdown()
        .then(() => console.log('OpenTelemetry shut down successfully.'))
        .catch((error) => console.log('Error shutting down OpenTelemetry', error))
        .finally(() => process.exit(0));
});
