import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pixService } from '../../../src/services/pixService.js';

describe('PixService Resilience (Circuit Breaker)', () => {
  it('should expose breaker status correctly', async () => {
    const status = (pixService as any).getBreakerStatus();

    expect(status).toHaveProperty('name', 'Pix-Generation');
    expect(status).toHaveProperty('opened');
    expect(status).toHaveProperty('stats');
  });

  it('should generate PIX through the circuit breaker', async () => {
    // Aumentar o timeout pois a geração dummy tem um delay de 100ms
    const result = await pixService.generatePix(150.5, 'Teste Teste');

    expect(result.copyAndPaste).toContain('150.50');
    expect(result.qrCode).toContain('data:image/png;base64');

    const status = (pixService as any).getBreakerStatus();
    expect(status.stats.successes).toBeGreaterThan(0);
  });
});
