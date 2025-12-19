import { describe, it, expect, vi } from 'vitest';
import { NodeSDK } from '@opentelemetry/sdk-node';

// Mock everything before import
vi.mock('@opentelemetry/sdk-node');
vi.mock('@opentelemetry/exporter-trace-otlp-http');
vi.mock('@opentelemetry/resources');
vi.mock('@opentelemetry/instrumentation-express');
vi.mock('@opentelemetry/instrumentation-pg');
vi.mock('@opentelemetry/sdk-trace-node');

describe('Telemetry Lib', () => {
  it('should initialize SDK', async () => {
    // Import to trigger side effects
    await import('../../../src/lib/telemetry.js');
    
    expect(NodeSDK).toHaveBeenCalled();
  });
});
