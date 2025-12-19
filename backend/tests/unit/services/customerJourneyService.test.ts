import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { customerJourneyService } from '../../../src/services/customerJourneyService';
import * as dbModule from '../../../src/db/index';
import { emailService } from '../../../src/services/emailService';
import { pushNotificationService } from '../../../src/services/pushNotificationService';

// Hoisted mocks
const { mockClientQuery, mockClientConnect, mockGetPool, mockDefaultQuery } = vi.hoisted(() => {
  const query = vi.fn();
  const connect = vi.fn();
  const getPool = vi.fn(() => ({
    query: query,
    connect: connect,
    end: vi.fn(),
  }));
  const defaultQuery = vi.fn();
  return {
    mockClientQuery: query,
    mockClientConnect: connect,
    mockGetPool: getPool,
    mockDefaultQuery: defaultQuery,
  };
});

vi.mock('../../../src/db/index', async (importActual) => {
  const actual = await importActual<typeof dbModule>();
  return {
    ...actual,
    getPool: mockGetPool,
    default: {
      query: mockDefaultQuery,
      connect: mockClientConnect,
      getPool: mockGetPool,
    },
  };
});

// Mock services
vi.mock('../../../src/services/emailService', () => ({
  emailService: {
    sendEmail: vi.fn(() => Promise.resolve(undefined)), // Mock para resolver por padrão
  },
}));

vi.mock('../../../src/services/pushNotificationService', () => ({
  pushNotificationService: {
    sendNotificationToUser: vi.fn(() => Promise.resolve(undefined)), // Mock para resolver por padrão
  },
}));

describe('CustomerJourneyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDefaultQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    // Reset dos mocks dos serviços externos
    (emailService.sendEmail as any).mockClear();
    (pushNotificationService.sendNotificationToUser as any).mockClear();

    // Mock console to avoid clutter
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllJourneys', () => {
    it('should return all journeys', async () => {
      const journeys = [{ id: 1, name: 'Welcome' }];
      mockDefaultQuery.mockResolvedValueOnce({ rows: journeys, rowCount: journeys.length });

      const result = await customerJourneyService.getAllJourneys();

      expect(mockDefaultQuery).toHaveBeenCalledWith('SELECT * FROM customer_journeys ORDER BY name ASC');
      expect(result).toEqual(journeys);
    });
  });

  describe('createJourney', () => {
    it('should create a journey', async () => {
      const payload: any = { name: 'Welcome', trigger_segment: 'new', action_type: 'email', template_id: '1', delay_days: 1, is_active: true };
      const created = { id: 1, ...payload };
      mockDefaultQuery.mockResolvedValueOnce({ rows: [created], rowCount: 1 });

      const result = await customerJourneyService.createJourney(payload);

      expect(mockDefaultQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO customer_journeys'),
        expect.arrayContaining(['Welcome', 'new', 'email', '1', 1, true])
      );
      expect(result).toEqual(created);
    });
  });

  describe('processCustomerJourneys', () => {
    it('should schedule actions for eligible customers', async () => {
      const activeJourney = { id: 1, name: 'Welcome', trigger_segment: 'new', action_type: 'email', template_id: 'tpl1', delay_days: 1 };
      const customer = { id: 'cust1', name: 'John', email: 'john@example.com', phone: '12345' };

      mockDefaultQuery
        .mockResolvedValueOnce({ rows: [activeJourney], rowCount: 1 }) // 1. getActiveJourneys
        .mockResolvedValueOnce({ rows: [customer], rowCount: 1 }) // 2. customersToProcess
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // 3. insert customer_journey_actions
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // 4. pending actions (empty after scheduling)

      await customerJourneyService.processCustomerJourneys();

      expect(mockDefaultQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO customer_journey_actions'),
        expect.arrayContaining(['cust1', 1, 'email', 'tpl1', 'pending'])
      );
    });

    it('should execute pending email actions', async () => {
      const pendingAction = {
        id: 10,
        customer_id: 'cust1',
        action_type: 'email',
        template_id: 'tpl1',
        email: 'john@example.com',
        name: 'John'
      };

      mockDefaultQuery
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // 1. getActiveJourneys (dummy to bypass early return)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // 2. customersToProcess (empty to skip scheduling)
        .mockResolvedValueOnce({ rows: [pendingAction], rowCount: 1 }) // 3. pending actions query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // 4. UPDATE customer_journey_actions

      await customerJourneyService.processCustomerJourneys();

      expect(emailService.sendEmail).toHaveBeenCalledWith('john@example.com', expect.any(String), expect.any(String));
      expect(mockDefaultQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE customer_journey_actions SET status = $1'),
        ['sent', 10]
      );
    });

    it('should handle errors during execution', async () => {
      const pendingAction = {
        id: 10,
        customer_id: 'cust1',
        action_type: 'email',
        template_id: 'tpl1',
        email: 'john@example.com',
        name: 'John'
      };

      mockDefaultQuery
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // 1. getActiveJourneys
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // 2. customersToProcess
        .mockResolvedValueOnce({ rows: [pendingAction], rowCount: 1 }) // 3. pending actions
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // 4. UPDATE customer_journey_actions (fail status)

      (emailService.sendEmail as any).mockRejectedValueOnce(new Error('Send failed'));

      await customerJourneyService.processCustomerJourneys();

      expect(mockDefaultQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE customer_journey_actions SET status = $1'),
        ['failed', 10]
      );
    });

    it('should handle whatsapp actions (simulated)', async () => {
      const pendingAction = {
        id: 11,
        customer_id: 'cust2',
        action_type: 'whatsapp_message',
        template_id: 'Hello WhatsApp',
        phone: '123456789',
        name: 'Jane'
      };

      mockDefaultQuery
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // getActiveJourneys
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // customersToProcess
        .mockResolvedValueOnce({ rows: [pendingAction], rowCount: 1 }) // pending actions
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // UPDATE action status

      await customerJourneyService.processCustomerJourneys();
      
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Sending WhatsApp to 123456789: Hello WhatsApp'));
    });

    it('should handle push notification actions', async () => {
      const pendingAction = {
        id: 12,
        customer_id: 'cust3',
        action_type: 'push_notification',
        template_id: 'Push Template',
        name: 'Bob'
      };

      mockDefaultQuery
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // getActiveJourneys
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // customersToProcess
        .mockResolvedValueOnce({ rows: [pendingAction], rowCount: 1 }) // pending actions
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // UPDATE action status

      await customerJourneyService.processCustomerJourneys();

      expect(pushNotificationService.sendNotificationToUser).toHaveBeenCalledWith(
        'cust3',
        expect.stringContaining('Jornada: Push Template'),
        expect.stringContaining('Olá Bob, Push Template')
      );
    });
  });
});

