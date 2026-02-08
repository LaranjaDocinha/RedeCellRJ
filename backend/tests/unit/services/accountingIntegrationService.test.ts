import { describe, it, expect, vi } from 'vitest';
import * as accountingIntegrationService from '../../../src/services/accountingIntegrationService.js';

describe('accountingIntegrationService', () => {
  it('syncSales should return simulated success', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await accountingIntegrationService.syncSales([{ id: 1, amount: 100 }]);

    expect(result).toEqual({
      success: true,
      message: 'Sales data sent to accounting software (simulated).',
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      'Simulating sales synchronization with accounting software:',
      [{ id: 1, amount: 100 }],
    );
    consoleSpy.mockRestore();
  });

  it('syncExpenses should return simulated success', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await accountingIntegrationService.syncExpenses([{ id: 1, amount: 50 }]);

    expect(result).toEqual({
      success: true,
      message: 'Expenses data sent to accounting software (simulated).',
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      'Simulating expenses synchronization with accounting software:',
      [{ id: 1, amount: 50 }],
    );
    consoleSpy.mockRestore();
  });

  it('getIntegrationStatus should return simulated status', async () => {
    const result = await accountingIntegrationService.getIntegrationStatus();

    expect(result.status).toBe('Connected');
    expect(result.software).toBe('QuickBooks (Simulated)');
    expect(result.lastSync).toBeDefined();
  });
});
