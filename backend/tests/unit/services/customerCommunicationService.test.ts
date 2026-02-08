import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { customerCommunicationService } from '../../../src/services/customerCommunicationService';
import * as dbModule from '../../../src/db/index';

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

describe('CustomerCommunicationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDefaultQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('recordCommunication', () => {
    it('should record a communication', async () => {
      const payload: any = {
        customer_id: 1,
        user_id: 2,
        channel: 'email',
        direction: 'outbound',
        summary: 'Sent invoice',
      };
      const createdComm = { id: 10, ...payload };
      mockDefaultQuery.mockResolvedValueOnce({ rows: [createdComm] });

      const result = await customerCommunicationService.recordCommunication(payload);

      expect(mockDefaultQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO customer_communications'),
        [
          payload.customer_id,
          payload.user_id,
          payload.channel,
          payload.direction,
          payload.summary,
          undefined,
          undefined,
        ],
      );
      expect(result).toEqual(createdComm);
    });
  });

  describe('getCommunicationsForCustomer', () => {
    it('should return communications for a customer', async () => {
      const comms = [{ id: 10, customer_id: 1 }];
      mockDefaultQuery.mockResolvedValueOnce({ rows: comms });

      const result = await customerCommunicationService.getCommunicationsForCustomer(1);

      expect(mockDefaultQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM customer_communications'),
        [1],
      );
      expect(result).toEqual(comms);
    });
  });
});
