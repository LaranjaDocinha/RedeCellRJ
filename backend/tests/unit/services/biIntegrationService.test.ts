import { describe, it, expect } from 'vitest';
import * as biService from '../../../src/services/biIntegrationService';

describe('BIIntegrationService', () => {
  describe('generateSecureViewCredentials', () => {
    it('should return credentials', async () => {
      const result = await biService.generateSecureViewCredentials('PowerBI');
      expect(result.success).toBe(true);
      expect(result.credentials).toBeDefined();
    });
  });

  describe('getAvailableReports', () => {
    it('should return reports', async () => {
      const result = await biService.getAvailableReports();
      expect(result.success).toBe(true);
      expect(result.reports.length).toBeGreaterThan(0);
    });
  });

  describe('getBiIntegrationStatus', () => {
    it('should return status', async () => {
      const result = await biService.getBiIntegrationStatus();
      expect(result.status).toBe('Active');
    });
  });
});
