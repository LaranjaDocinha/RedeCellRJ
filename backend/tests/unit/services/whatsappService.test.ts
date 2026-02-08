import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPool, mockQuery, mockConnect, mockClient } = vi.hoisted(() => {
  const mQuery = vi.fn();
  const mRelease = vi.fn();
  const mClient = { query: mQuery, release: mRelease };
  const mConnect = vi.fn().mockResolvedValue(mClient);
  const mPool = { query: mQuery, connect: mConnect };
  return { mockPool: mPool, mockQuery: mQuery, mockConnect: mConnect, mockClient: mClient };
});

vi.mock('../../../src/db/index.js', () => ({
  default: mockPool,
  getPool: () => mockPool,
  query: mockQuery,
  connect: mockConnect,
  _mockQuery: mockQuery,
  _mockConnect: mockConnect,
  _mockClient: mockClient,
  _mockPool: mockPool,
}));

const mockClientInstance = {
  on: vi.fn().mockReturnThis(),
  initialize: vi.fn().mockResolvedValue(undefined),
  sendMessage: vi.fn().mockResolvedValue(undefined),
};

vi.mock('whatsapp-web.js', () => {
  const mockClient = vi.fn(() => mockClientInstance);
  return {
    default: { Client: mockClient, LocalAuth: vi.fn() },
    Client: mockClient,
    LocalAuth: vi.fn(),
  };
});

vi.mock('qrcode-terminal', () => ({
  default: { generate: vi.fn() },
  generate: vi.fn(),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../../../src/jobs/queue.js', () => ({
  addJob: vi.fn(),
  whatsappQueue: { name: 'whatsapp' },
}));

import { WhatsappService } from '../../../src/services/whatsappService.js';
import { AppError } from '../../../src/utils/errors.js';
import { addJob, whatsappQueue } from '../../../src/jobs/queue.js';

describe('WhatsappService', () => {
  let service: WhatsappService;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });

    service = new WhatsappService();
    // Simulate breaker behavior for tests
    (service as any).breaker = {
      fire: vi
        .fn()
        .mockImplementation((...args: any[]) => (service as any).deliverMessage(...args)),
      fallback: vi.fn(),
      opened: false,
      halfOpen: false,
      closed: true,
      stats: {},
    };
  });

  describe('initWhatsappClient', () => {
    it('should initialize client and set up listeners', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      await service.initWhatsappClient();
      expect(mockClientInstance.initialize).toHaveBeenCalled();

      const readyCb = mockClientInstance.on.mock.calls.find((c) => c[0] === 'ready')[1];
      readyCb();
      expect((service as any).isReady).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('queueTemplateMessage', () => {
    it('should add a job to the whatsapp queue', async () => {
      const options = { phone: '123', templateName: 'test', variables: {} };
      await service.queueTemplateMessage(options);
      expect(addJob).toHaveBeenCalledWith(whatsappQueue, 'sendTemplate', options);
    });
  });

  describe('sendTemplateMessage', () => {
    it('should send message using template and replace variables', async () => {
      (service as any).isReady = true;
      (service as any).client = mockClientInstance;
      mockClient.query.mockResolvedValueOnce({ 
        rows: [{ content: 'Hello {{name}}!' }], 
        rowCount: 1 
      });

      await service.sendTemplateMessage({
        customerId: 1,
        phone: '123456789',
        templateName: 'welcome',
        variables: { name: 'John' },
      });

      expect(mockClientInstance.sendMessage).toHaveBeenCalledWith(expect.any(String), 'Hello John!');
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO whatsapp_logs'), expect.any(Array));
    });

    it('should use fallback content if template not found', async () => {
      (service as any).isReady = true;
      (service as any).client = mockClientInstance;
      mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await service.sendTemplateMessage({
        phone: '123',
        templateName: 'missing',
        variables: {},
      });

      expect(mockClientInstance.sendMessage).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('[FALLBACK]'));
    });

    it('should log failure if sending fails', async () => {
      (service as any).isReady = true;
      (service as any).client = mockClientInstance;
      mockClient.query.mockResolvedValueOnce({ rows: [{ content: 'Hi' }], rowCount: 1 });
      mockClientInstance.sendMessage.mockRejectedValueOnce(new Error('Send failed'));

      await service.sendTemplateMessage({
        phone: '123',
        templateName: 'test',
        variables: {},
      });

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("status, error_message"),
        expect.arrayContaining(['Send failed'])
      );
    });
  });

  describe('deliverMessage', () => {
    it('should format phone correctly and send', async () => {
      (service as any).isReady = true;
      (service as any).client = mockClientInstance;

      await (service as any).deliverMessage('11999998888', 'Hi');
      expect(mockClientInstance.sendMessage).toHaveBeenCalledWith('5511999998888@c.us', 'Hi');
    });

    it('should not format if already has 55', async () => {
      (service as any).isReady = true;
      (service as any).client = mockClientInstance;

      await (service as any).deliverMessage('5511999998888', 'Hi');
      expect(mockClientInstance.sendMessage).toHaveBeenCalledWith('5511999998888@c.us', 'Hi');
    });

    it('should throw AppError if client not ready', async () => {
      (service as any).isReady = false;
      await expect((service as any).deliverMessage('123', 'msg')).rejects.toThrow(AppError);
    });
  });

  describe('upsertTemplate', () => {
    it('should insert or update template', async () => {
      await service.upsertTemplate('test', 'content');
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO whatsapp_templates'), ['test', 'content']);
    });
  });

  describe('getLogsByCustomer', () => {
    it('should return logs from db', async () => {
      const mockLogs = [{ id: 1, content: 'hi' }];
      mockQuery.mockResolvedValueOnce({ rows: mockLogs });
      const result = await service.getLogsByCustomer(1);
      expect(result).toEqual(mockLogs);
    });
  });

  describe('getBreakerStatus', () => {
    it('should return breaker status object', () => {
      const status = service.getBreakerStatus();
      expect(status).toHaveProperty('name');
      expect(status).toHaveProperty('opened');
    });
  });
});
