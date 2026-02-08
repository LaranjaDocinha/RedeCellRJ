import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/utils/auditLogger.js', () => ({
  auditLogger: {
    logUpdate: vi.fn().mockResolvedValue(undefined),
    logCreate: vi.fn().mockResolvedValue(undefined),
    logDelete: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../../src/middlewares/cacheMiddleware.js', () => ({
  invalidateCache: vi.fn().mockResolvedValue(undefined),
}));

import { serviceOrderService } from '../../../src/services/serviceOrderService.js';
import { serviceOrderRepository } from '../../../src/repositories/serviceOrder.repository.js';
import { partRepository } from '../../../src/repositories/part.repository.js';
import * as purchaseAutomationService from '../../../src/services/purchaseAutomationService.js';
import { permissionService } from '../../../src/services/permissionService.js';
import { invalidateCache } from '../../../src/middlewares/cacheMiddleware.js';
import { auditLogger } from '../../../src/utils/auditLogger.js';

// Mocks
const mocks = vi.hoisted(() => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };
  const mockPool = {
    connect: vi.fn().mockResolvedValue(mockClient),
    query: vi.fn(),
  };
  return { mockClient, mockPool };
});

vi.mock('../../../src/db/index.js', () => ({
  default: mocks.mockPool,
  getPool: () => mocks.mockPool,
}));

vi.mock('../../../src/repositories/serviceOrder.repository.js', () => ({
  serviceOrderRepository: {
    create: vi.fn(),
    addStatusHistory: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    getItems: vi.fn(),
    getAttachments: vi.fn(),
    addItem: vi.fn(),
    update: vi.fn(),
    findByIdForUpdate: vi.fn(),
    updateStatus: vi.fn(),
    findTechnicianLoad: vi.fn(),
    findTechniciansBySkill: vi.fn(),
    addComment: vi.fn(),
    getComments: vi.fn(),
    addAttachment: vi.fn(),
    updateChecklist: vi.fn(),
  },
}));

vi.mock('../../../src/repositories/part.repository.js', () => ({
  partRepository: {
    checkStock: vi.fn(),
    updateStock: vi.fn(),
  },
}));

vi.mock('../../../src/services/purchaseAutomationService.js', () => ({
  checkAndRequestPartsForServiceOrder: vi.fn(),
}));

vi.mock('../../../src/services/permissionService.js', () => ({
  permissionService: {
    checkUserPermission: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('../../../src/services/activityFeedService.js', () => ({
  createActivity: vi.fn(),
}));

vi.mock('../../../src/events/appEvents.js', () => ({
  default: {
    emit: vi.fn(),
  },
}));

describe('ServiceOrderService', () => {
  const mockOrder = {
    id: 1,
    status: 'Aguardando Avaliação',
    user_id: 'tech1',
    branch_id: 1,
    product_description: 'Test Product',
    public_token: 'token123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('createServiceOrder', () => {
    it('should create a service order successfully', async () => {
      mocks.mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ branch_id: 1 }] }); // User Query

      vi.mocked(serviceOrderRepository.create).mockResolvedValue(mockOrder as any);

      const result = await serviceOrderService.createServiceOrder({ user_id: 'tech1' });

      expect(result.id).toBe(1);
      expect(mocks.mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(serviceOrderRepository.create).toHaveBeenCalled();
      expect(serviceOrderRepository.addStatusHistory).toHaveBeenCalled();
      expect(mocks.mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should rollback on error', async () => {
      mocks.mockClient.query.mockResolvedValueOnce({}); // BEGIN
      vi.mocked(serviceOrderRepository.create).mockRejectedValue(new Error('DB Error'));

      await expect(serviceOrderService.createServiceOrder({ user_id: 'tech1' })).rejects.toThrow();
      expect(mocks.mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('getAllServiceOrders', () => {
    it('should return all orders from repository', async () => {
      vi.mocked(serviceOrderRepository.findAll).mockResolvedValue([mockOrder] as any);
      const result = await serviceOrderService.getAllServiceOrders({});
      expect(result).toEqual([mockOrder]);
    });
  });

  describe('getServiceOrderById', () => {
    it('should return order with items and attachments', async () => {
      vi.mocked(serviceOrderRepository.findById).mockResolvedValue(mockOrder as any);
      vi.mocked(serviceOrderRepository.getItems).mockResolvedValue([{ id: 101 }] as any);
      vi.mocked(serviceOrderRepository.getAttachments).mockResolvedValue([{ id: 201 }] as any);

      const result = await serviceOrderService.getServiceOrderById(1);

      expect(result?.id).toBe(1);
      expect(result?.items).toHaveLength(1);
      expect(result?.attachments).toHaveLength(1);
    });

    it('should return null if order not found', async () => {
      vi.mocked(serviceOrderRepository.findById).mockResolvedValue(null);
      const result = await serviceOrderService.getServiceOrderById(999);
      expect(result).toBeNull();
    });
  });

  describe('addOrderItem', () => {
    it('should add item and check stock', async () => {
      vi.mocked(partRepository.checkStock).mockResolvedValue(10);
      vi.mocked(serviceOrderRepository.addItem).mockResolvedValue({ id: 101 } as any);

      await serviceOrderService.addOrderItem(1, { part_id: 10, quantity: 2, unit_price: 50 });

      expect(serviceOrderRepository.addItem).toHaveBeenCalled();
      expect(purchaseAutomationService.checkAndRequestPartsForServiceOrder).not.toHaveBeenCalled();
    });

    it('should trigger purchase automation if stock low', async () => {
      vi.mocked(partRepository.checkStock).mockResolvedValue(1);
      await serviceOrderService.addOrderItem(1, { part_id: 10, quantity: 5, unit_price: 50 });
      expect(purchaseAutomationService.checkAndRequestPartsForServiceOrder).toHaveBeenCalledWith(1);
    });
  });

  describe('updateServiceOrder', () => {
    it('should update order report or budget', async () => {
      vi.mocked(serviceOrderRepository.update).mockResolvedValue(mockOrder as any);
      await serviceOrderService.updateServiceOrder(1, { budget_value: 150 });
      expect(serviceOrderRepository.update).toHaveBeenCalledWith(1, { budget_value: 150 });
    });
  });

  describe('updateServiceOrderStatusFromKanban', () => {
    it('should update status and invalidate cache', async () => {
      vi.mocked(serviceOrderRepository.findByIdForUpdate).mockResolvedValue(mockOrder as any);
      vi.mocked(serviceOrderRepository.updateStatus).mockResolvedValue(mockOrder as any);

      await serviceOrderService.updateServiceOrderStatusFromKanban(1, 'Em Reparo', 'user1');

      expect(serviceOrderRepository.updateStatus).toHaveBeenCalledWith(1, 'Em Reparo', mocks.mockClient);
      expect(invalidateCache).toHaveBeenCalledWith(expect.stringContaining(mockOrder.public_token));
    });
  });

  describe('changeOrderStatus', () => {
    it('should require QA permission to finalize', async () => {
      vi.mocked(serviceOrderRepository.findByIdForUpdate).mockResolvedValue({
        ...mockOrder,
        status: 'Aguardando QA',
      } as any);
      vi.mocked(permissionService.checkUserPermission).mockResolvedValue(false);

      await expect(
        serviceOrderService.changeOrderStatus(1, 'Finalizado', 'user1'),
      ).rejects.toThrow('User does not have permission');
    });

    it('should update stock and create activity on finalization', async () => {
      vi.mocked(permissionService.checkUserPermission).mockResolvedValue(true);
      vi.mocked(serviceOrderRepository.findByIdForUpdate).mockResolvedValue({
        ...mockOrder,
        status: 'Aguardando QA',
      } as any);
      vi.mocked(serviceOrderRepository.updateStatus).mockResolvedValue({
        ...mockOrder,
        status: 'Finalizado',
      } as any);
      mocks.mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ part_id: 10, quantity: 1 }] }); // SELECT items

      await serviceOrderService.changeOrderStatus(1, 'Finalizado', 'user1');

      expect(partRepository.updateStock).toHaveBeenCalledWith(10, -1, mocks.mockClient);
      expect(auditLogger.logUpdate).toHaveBeenCalled();
    });
  });

  describe('updateEntryChecklist', () => {
    it('should update checklist in repository', async () => {
      await serviceOrderService.updateEntryChecklist(1, { screen: 'ok' });
      expect(serviceOrderRepository.updateChecklist).toHaveBeenCalledWith(
        1,
        { screen: 'ok' },
        mocks.mockClient,
      );
    });
  });

  describe('suggestTechnician', () => {
    it('should return technicians based on skills if order has tags', async () => {
      vi.mocked(serviceOrderRepository.findById).mockResolvedValue({
        ...mockOrder,
        tags: ['iPhone', 'Screen'],
      } as any);
      const mockTechs = [{ id: 'tech1', load: 2 }];
      vi.mocked(serviceOrderRepository.findTechniciansBySkill).mockResolvedValue(mockTechs);

      const result = await serviceOrderService.suggestTechnician(1);

      expect(result).toEqual(mockTechs);
      expect(serviceOrderRepository.findTechniciansBySkill).toHaveBeenCalledWith(['iPhone', 'Screen']);
    });

    it('should return technician load if no tags', async () => {
      vi.mocked(serviceOrderRepository.findById).mockResolvedValue(mockOrder as any);
      vi.mocked(serviceOrderRepository.findTechnicianLoad).mockResolvedValue([]);
      await serviceOrderService.suggestTechnician(1);
      expect(serviceOrderRepository.findTechnicianLoad).toHaveBeenCalled();
    });
  });

  describe('Comments and Attachments', () => {
    it('should add comment', async () => {
      await serviceOrderService.addComment(1, 'user1', 'Test comment');
      expect(serviceOrderRepository.addComment).toHaveBeenCalled();
    });

    it('should get comments', async () => {
      await serviceOrderService.getComments(1);
      expect(serviceOrderRepository.getComments).toHaveBeenCalledWith(1);
    });

    it('should add attachment', async () => {
      await serviceOrderService.addServiceOrderAttachment(1, 'path', 'image', 'desc', 'user1');
      expect(serviceOrderRepository.addAttachment).toHaveBeenCalled();
    });
  });
});
