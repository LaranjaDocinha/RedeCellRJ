import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { emailService } from '../../../src/services/emailService';
import * as customerServiceModule from '../../../src/services/customerService';
import * as customerCommunicationServiceModule from '../../../src/services/customerCommunicationService';

// Mock Fetch API
global.fetch = vi.fn();

// Mocks para os serviços dependentes
vi.mock('../../../src/services/customerService', () => ({
  customerService: {
    getCustomerByEmail: vi.fn(),
  },
}));

vi.mock('../../../src/services/customerCommunicationService', () => ({
  customerCommunicationService: {
    recordCommunication: vi.fn(),
  },
}));

describe('EmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpa todas as chamadas e mocks

    // Resetar mocks específicos
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();
    (
      customerServiceModule.customerService.getCustomerByEmail as ReturnType<typeof vi.fn>
    ).mockReset();
    (
      customerCommunicationServiceModule.customerCommunicationService
        .recordCommunication as ReturnType<typeof vi.fn>
    ).mockReset();

    // Default mocks
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Email sent' }),
    });
    (
      customerServiceModule.customerService.getCustomerByEmail as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restaura tudo
  });

  describe('sendEmail', () => {
    it('should send email and record communication if customer found', async () => {
      const mockCustomer = { id: 1, email: 'test@example.com' };
      (
        customerServiceModule.customerService.getCustomerByEmail as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(mockCustomer);

      await emailService.sendEmail('test@example.com', 'Subject', 'Body');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/send/email'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ to: 'test@example.com', subject: 'Subject', text: 'Body' }),
        }),
      );
      expect(customerServiceModule.customerService.getCustomerByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(
        customerCommunicationServiceModule.customerCommunicationService.recordCommunication,
      ).toHaveBeenCalledWith({
        customer_id: mockCustomer.id,
        channel: 'email',
        direction: 'outbound',
        summary: 'Subject',
      });
    });

    it('should send email but not record communication if customer not found', async () => {
      await emailService.sendEmail('noexist@example.com', 'Subject', 'Body');

      expect(global.fetch).toHaveBeenCalledOnce();
      expect(customerServiceModule.customerService.getCustomerByEmail).toHaveBeenCalledWith(
        'noexist@example.com',
      );
      expect(
        customerCommunicationServiceModule.customerCommunicationService.recordCommunication,
      ).not.toHaveBeenCalled();
    });

    it('should throw error if fetch fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed by microservice' }),
      });

      await expect(emailService.sendEmail('test@example.com', 'Sub', 'Body')).rejects.toThrow(
        'Failed to send email',
      );
    });

    it('should handle generic fetch error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
      await expect(emailService.sendEmail('test@example.com', 'Sub', 'Body')).rejects.toThrow(
        'Failed to send email',
      );
    });
  });
});
