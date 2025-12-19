import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as dbModule from '../../../src/db/index'; // Importa o módulo real para tipagem
import { ServiceOrder } from '../../../src/types/serviceOrder';

// Hoisted mocks para o banco de dados
const { mockQueryGlobal, mockConnectGlobal, mockClientQuery, mockClientRelease } = vi.hoisted(() => {
  const queryGlobal = vi.fn(); // Mock para a função 'query' exportada
  const connectGlobal = vi.fn(); // Mock para a função 'connect' exportada
  const clientQuery = vi.fn();
  const clientRelease = vi.fn();
  const clientConnectInstance = vi.fn(() => ({
    query: clientQuery,
    release: clientRelease,
  }));
  return {
    mockQueryGlobal: queryGlobal,
    mockConnectGlobal: connectGlobal,
    mockClientQuery: clientQuery,
    mockClientRelease: clientRelease,
    mockClientConnect: clientConnectInstance, // Usar o nome 'mockClientConnect' para consistência
  };
});

// Mock do módulo de banco de dados
vi.mock('../../../src/db/index', async (importActual) => {
  const actual = await importActual<typeof dbModule>();
  return {
    ...actual,
    query: mockQueryGlobal,    // MOCKAR O EXPORT NOMEADO 'query'
    connect: mockConnectGlobal,  // MOCKAR O EXPORT NOMEADO 'connect'
    // Garantir que outros exports não estejam causando conflitos ou sendo usados
    default: undefined,
    getPool: undefined,
  };
});

// Mocks para serviços externos
vi.mock('../../../src/services/purchaseAutomationService.js', () => ({
  checkAndRequestPartsForServiceOrder: vi.fn(),
}));
vi.mock('../../../src/services/permissionService.js', () => ({
  permissionService: {
    checkUserPermission: vi.fn(),
  },
}));
vi.mock('../../../src/services/activityFeedService.js', () => ({
  createActivity: vi.fn(),
}));

// Importar o serviço APÓS os mocks
import * as serviceOrderService from '../../../src/services/serviceOrderService.js';

describe('ServiceOrderService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockQueryGlobal.mockResolvedValue({ rows: [], rowCount: 0 }); // Default para query nomeado
    mockConnectGlobal.mockResolvedValue({ query: mockClientQuery, release: mockClientRelease }); // Default para connect nomeado
    mockClientQuery.mockResolvedValue({ rows: [], rowCount: 0 }); // Default para client.query
    mockClientRelease.mockClear();

    // Mocks para serviços externos
    vi.mocked(
      (await import('../../../src/services/purchaseAutomationService.js'))
        .checkAndRequestPartsForServiceOrder,
    ).mockClear();
    vi.mocked(
      (await import('../../../src/services/permissionService.js')).permissionService
        .checkUserPermission,
    ).mockClear();
    vi.mocked(
      (await import('../../../src/services/activityFeedService.js')).createActivity,
    ).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createServiceOrder', () => {
    const orderData = {
      customer_id: 1,
      user_id: 'user123',
      product_description: 'iPhone X Screen Repair',
      imei: '123456789012345',
      entry_checklist: ['screen cracked', 'no power'],
      issue_description: 'Screen broken, not turning on',
    };

    it('should create a service order successfully', async () => {
      mockConnectGlobal.mockResolvedValueOnce({ // mock connect()
        query: mockClientQuery,
        release: mockClientRelease
      });
      mockClientQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, ...orderData, status: 'Aguardando Avaliação' }], rowCount: 1 }) // INSERT service_orders
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT service_order_status_history
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT
      
      const newOrder = await serviceOrderService.createServiceOrder(orderData);

      expect(newOrder).toBeDefined();
      expect(newOrder.id).toBe(1);
      expect(newOrder.status).toBe('Aguardando Avaliação');
      expect(mockClientQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockClientQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO service_orders'),
        expect.any(Array),
      );
      expect(mockClientQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO service_order_status_history'),
        expect.any(Array),
      );
      expect(mockClientQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should rollback transaction if service order creation fails', async () => {
      mockConnectGlobal.mockResolvedValueOnce({ // mock connect()
        query: mockClientQuery,
        release: mockClientRelease
      });
      mockClientQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockRejectedValueOnce(new Error('DB Error')) // INSERT service_orders fails
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ROLLBACK
      
      await expect(serviceOrderService.createServiceOrder(orderData)).rejects.toThrow(
        'DB Error',
      );
      expect(mockClientQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockClientQuery).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('getAllServiceOrders', () => {
    const mockOrders = [
      { id: 1, product_description: 'Repair 1', customer_name: 'Customer A' },
      { id: 2, product_description: 'Repair 2', customer_name: 'Customer B' },
    ];

    it('should return all service orders without filters', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: mockOrders, rowCount: 2 });

      const orders = await serviceOrderService.getAllServiceOrders({});
      expect(orders).toEqual(mockOrders);
      // Verificar partes chave da query para evitar problemas com formatação/espaços
      expect(mockQueryGlobal.mock.calls[0][0]).toContain('SELECT');
      expect(mockQueryGlobal.mock.calls[0][0]).toContain('so.*');
      expect(mockQueryGlobal.mock.calls[0][0]).toContain('c.name AS customer_name');
      expect(mockQueryGlobal.mock.calls[0][1]).toEqual([]);
    });

    it('should filter service orders by status', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: [mockOrders[0]], rowCount: 1 });

      const orders = await serviceOrderService.getAllServiceOrders({ status: 'Em Reparo' });
      expect(orders).toEqual([mockOrders[0]]);
      expect(mockQueryGlobal).toHaveBeenCalledWith(
        expect.stringContaining('WHERE so.status = $1'),
        ['Em Reparo'],
      );
    });

    it('should filter service orders by customer_id', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: [mockOrders[0]], rowCount: 1 });

      const orders = await serviceOrderService.getAllServiceOrders({ customer_id: 1 });
      expect(orders).toEqual([mockOrders[0]]);
      expect(mockQueryGlobal).toHaveBeenCalledWith(
        expect.stringContaining('WHERE so.customer_id = $1'),
        [1],
      );
    });

    it('should filter service orders by customer_name', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: [mockOrders[0]], rowCount: 1 });

      const orders = await serviceOrderService.getAllServiceOrders({ customer_name: 'Customer A' });
      expect(orders).toEqual([mockOrders[0]]);
      expect(mockQueryGlobal).toHaveBeenCalledWith(
        expect.stringContaining('WHERE c.name ILIKE $1'),
        ['%Customer A%'],
      );
    });

    it('should combine multiple filters', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: [mockOrders[0]], rowCount: 1 });

      const orders = await serviceOrderService.getAllServiceOrders({
        status: 'Em Reparo',
        customer_id: 1,
        customer_name: 'Customer A',
      });
      expect(orders).toEqual([mockOrders[0]]);
      expect(mockQueryGlobal).toHaveBeenCalledWith(
        expect.stringContaining('WHERE so.status = $1 AND so.customer_id = $2 AND c.name ILIKE $3'),
        ['Em Reparo', 1, '%Customer A%'],
      );
    });
  });

  describe('getServiceOrderById', () => {
    const mockOrder = {
      id: 1,
      product_description: 'Repair 1',
      items: [],
      attachments: [],
    };
    const mockItems = [{ id: 101, service_order_id: 1, part_id: 1 }];
    const mockAttachments = [{ id: 201, service_order_id: 1, file_path: 'path/to/file.jpg' }];

    it('should return a service order by ID with items and attachments', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: [{ ...mockOrder, id: 1 }], rowCount: 1 }) // SELECT service_orders
        .mockResolvedValueOnce({ rows: mockItems, rowCount: 1 }) // SELECT service_order_items
        .mockResolvedValueOnce({ rows: mockAttachments, rowCount: 1 }); // SELECT service_order_attachments

      const order = await serviceOrderService.getServiceOrderById(1);

      expect(order).toBeDefined();
      expect(order!.id).toBe(1);
      expect(order!.items).toEqual(mockItems);
      expect(order!.attachments).toEqual(mockAttachments);
      expect(mockQueryGlobal).toHaveBeenCalledTimes(3);
    });

    it('should return null if service order not found', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT service_orders returns empty

      const order = await serviceOrderService.getServiceOrderById(999);
      expect(order).toBeNull();
      expect(mockQueryGlobal).toHaveBeenCalledTimes(1);
    });
  });

  describe('addOrderItem', () => {
    const serviceOrderId = 1;
    const itemData = {
      part_id: 1,
      service_description: 'Screen replacement',
      quantity: 1,
      unit_price: 150.00,
    };
    const mockPart = { id: 1, stock_quantity: 5 };

    it('should add an item to a service order', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: [{ ...mockPart, id: 1, stock_quantity: 5 }], rowCount: 1 }) // Stock check
        .mockResolvedValueOnce({ rows: [{ id: 101, ...itemData, service_order_id: 1 }], rowCount: 1 }); // INSERT item

      const newItem = await serviceOrderService.addOrderItem(serviceOrderId, itemData);

      expect(newItem).toBeDefined();
      expect(newItem.part_id).toBe(itemData.part_id);
      expect(mockQueryGlobal).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO service_order_items'),
        expect.any(Array),
      );
    });

    it('should call purchaseAutomationService if stock is insufficient', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: [{ ...mockPart, id: 1, stock_quantity: 0 }], rowCount: 1 }) // Stock check (insufficient)
        .mockResolvedValueOnce({ rows: [{ id: 101, ...itemData, service_order_id: 1 }], rowCount: 1 }); // INSERT item

      // Mockar o serviço de automação
      const purchaseAutomationService = await import(
        '../../../src/services/purchaseAutomationService.js'
      );
      vi.mocked(purchaseAutomationService.checkAndRequestPartsForServiceOrder).mockResolvedValueOnce(undefined);

      await serviceOrderService.addOrderItem(serviceOrderId, itemData);

      expect(purchaseAutomationService.checkAndRequestPartsForServiceOrder).toHaveBeenCalledWith(
        serviceOrderId,
      );
    });

    it('should not call purchaseAutomationService if no part_id', async () => {
      const itemDataWithoutPart = { ...itemData, part_id: undefined };
      mockQueryGlobal.mockResolvedValueOnce({ rows: [{ id: 101, ...itemDataWithoutPart, service_order_id: 1 }], rowCount: 1 }); // INSERT item

      const purchaseAutomationService = await import(
        '../../../src/services/purchaseAutomationService.js'
      );

      await serviceOrderService.addOrderItem(serviceOrderId, itemDataWithoutPart);

      expect(purchaseAutomationService.checkAndRequestPartsForServiceOrder).not.toHaveBeenCalled();
    });
  });

  describe('updateServiceOrder', () => {
    const serviceOrderId = 1;
    const updateData = { technical_report: 'Fixed screen', budget_value: 200.00 };
    const mockUpdatedOrder = { id: serviceOrderId, technical_report: 'Fixed screen', budget_value: 200.00 };

    it('should update a service order successfully', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: [mockUpdatedOrder], rowCount: 1 });

      const updatedOrder = await serviceOrderService.updateServiceOrder(serviceOrderId, updateData);

      expect(updatedOrder).toEqual(mockUpdatedOrder);
      expect(mockQueryGlobal).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE service_orders SET technical_report = $1, budget_value = $2, updated_at = current_timestamp WHERE id = $3 RETURNING *'),
        [updateData.technical_report, updateData.budget_value, serviceOrderId],
      );
    });

    it('should return null if service order not found for update', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const updatedOrder = await serviceOrderService.updateServiceOrder(999, updateData);
      expect(updatedOrder).toBeNull();
    });
  });

  describe('changeOrderStatus', () => {
    const serviceOrderId = 1;
    const userId = 'user123';
    const mockOrder = { id: serviceOrderId, status: 'Em Reparo', user_id: userId, branch_id: 1, product_description: 'Test Prod' };

    it('should change status to "Aguardando QA" from "Em Reparo"', async () => {
      mockConnectGlobal.mockResolvedValueOnce({ // mock connect()
        query: mockClientQuery,
        release: mockClientRelease
      });
      mockClientQuery // Configurar as chamadas no mockClientQuery global
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ ...mockOrder, status: 'Em Reparo' }], rowCount: 1 }) // SELECT old status
        .mockResolvedValueOnce({ rows: [{ ...mockOrder, status: 'Aguardando QA' }], rowCount: 1 }) // UPDATE
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT history
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const updatedOrder = await serviceOrderService.changeOrderStatus(serviceOrderId, 'Aguardando QA', userId);
      expect(updatedOrder?.status).toBe('Aguardando QA');
      expect(mockClientQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockClientQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw error if service order not found', async () => {
      mockConnectGlobal.mockResolvedValueOnce({ // mock connect()
        query: mockClientQuery,
        release: mockClientRelease
      });
      mockClientQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ROLLBACK

      await expect(serviceOrderService.changeOrderStatus(serviceOrderId, 'Aguardando QA', userId))
        .rejects.toThrow('Service order not found');
      expect(mockClientQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockClientQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error if invalid status transition to "Aguardando QA"', async () => {
      const orderWithInvalidStatus = { ...mockOrder, status: 'Aberto' }; // Status inválido para transição
      mockConnectGlobal.mockResolvedValueOnce({ // mock connect()
        query: mockClientQuery,
        release: mockClientRelease
      });
      mockClientQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ status: 'Aberto' }], rowCount: 1 }) // SELECT old status - CORRIGIDO
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ROLLBACK

      await expect(serviceOrderService.changeOrderStatus(serviceOrderId, 'Aguardando QA', userId))
        .rejects.toThrow('Service order can only go to "Aguardando QA" from "Em Reparo" or "Aguardando Peça" status.');
      expect(mockClientQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should change status to "Aguardando QA" from "Aguardando Peça"', async () => {
      const orderWithValidStatus = { ...mockOrder, status: 'Aguardando Peça' }; // Valida de Aguardando Peça para Aguardando QA
      mockConnectGlobal.mockResolvedValueOnce({ // mock connect()
        query: mockClientQuery,
        release: mockClientRelease
      });
      mockClientQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ status: 'Aguardando Peça' }], rowCount: 1 }) // SELECT old status - CORRIGIDO
        .mockResolvedValueOnce({ rows: [{ ...mockOrder, status: 'Aguardando QA' }], rowCount: 1 }) // UPDATE
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT history
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const updatedOrder = await serviceOrderService.changeOrderStatus(serviceOrderId, 'Aguardando QA', userId);
      expect(updatedOrder?.status).toBe('Aguardando QA');
      expect(mockClientQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockClientQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw error if invalid status transition to "Finalizado" (not from Aguardando QA)', async () => {
      mockConnectGlobal.mockResolvedValueOnce({ // mock connect()
        query: mockClientQuery,
        release: mockClientRelease
      });
      mockClientQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ status: 'Em Reparo' }], rowCount: 1 }) // SELECT old status - CORRIGIDO
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ROLLBACK

      await expect(serviceOrderService.changeOrderStatus(serviceOrderId, 'Finalizado', userId))
        .rejects.toThrow('Service order must pass QA before being finalized or rejected.');
      expect(mockClientQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error if user lacks permission for "Finalizado" from "Aguardando QA"', async () => {
      mockConnectGlobal.mockResolvedValueOnce({ // mock connect()
        query: mockClientQuery,
        release: mockClientRelease
      });
      mockClientQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ status: 'Aguardando QA' }], rowCount: 1 }) // SELECT old status - CORRIGIDO
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ROLLBACK

      const permissionService = await import('../../../src/services/permissionService.js');
      vi.mocked(permissionService.permissionService.checkUserPermission).mockResolvedValueOnce(false); // No permission

      await expect(serviceOrderService.changeOrderStatus(serviceOrderId, 'Finalizado', userId))
        .rejects.toThrow('User does not have permission to finalize/reject QA.');
      expect(mockClientQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(permissionService.permissionService.checkUserPermission).toHaveBeenCalledWith(userId, 'perform_qa');
    });

    it('should finalize service order, update stock, and create activity if permission granted', async () => {
      mockConnectGlobal.mockResolvedValueOnce({ // mock connect()
        query: mockClientQuery,
        release: mockClientRelease
      });
      mockClientQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ ...mockOrder, status: 'Aguardando QA' }], rowCount: 1 }) // SELECT old status
        .mockResolvedValueOnce({ rows: [{ ...mockOrder, status: 'Finalizado' }], rowCount: 1 }) // UPDATE service_orders
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT status history
        .mockResolvedValueOnce({ rows: [{ part_id: 10, quantity: 2 }], rowCount: 1 }) // SELECT items (part_id is not null)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE parts stock
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const permissionService = await import('../../../src/services/permissionService.js');
      vi.mocked(permissionService.permissionService.checkUserPermission).mockResolvedValueOnce(true); // Permission granted

      const purchaseAutomationService = await import('../../../src/services/purchaseAutomationService.js');
      vi.mocked(purchaseAutomationService.checkAndRequestPartsForServiceOrder).mockResolvedValueOnce(undefined);

      const activityFeedService = await import('../../../src/services/activityFeedService.js');
      vi.mocked(activityFeedService.createActivity).mockResolvedValueOnce(undefined);

      const updatedOrder = await serviceOrderService.changeOrderStatus(serviceOrderId, 'Finalizado', userId);

      expect(updatedOrder?.status).toBe('Finalizado');
      expect(permissionService.permissionService.checkUserPermission).toHaveBeenCalledWith(userId, 'perform_qa');
      expect(mockClientQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE parts SET stock_quantity = stock_quantity - $1 WHERE id = $2'),
        [2, 10],
      );
      expect(purchaseAutomationService.checkAndRequestPartsForServiceOrder).toHaveBeenCalledWith(serviceOrderId);
      expect(activityFeedService.createActivity).toHaveBeenCalledWith(
        mockOrder.user_id,
        mockOrder.branch_id,
        'repair_completed',
        { serviceOrderId: serviceOrderId, productDescription: mockOrder.product_description },
      );
      expect(mockClientQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should rollback transaction if stock update fails during finalization', async () => {
      mockConnectGlobal.mockResolvedValueOnce({ // mock connect()
        query: mockClientQuery,
        release: mockClientRelease
      });

      mockClientQuery.mockReset(); // Limpar mocks anteriores para este teste
      mockClientQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ status: 'Aguardando QA' }], rowCount: 1 }) // SELECT old status
        .mockResolvedValueOnce({ rows: [{ ...mockOrder, status: 'Finalizado' }], rowCount: 1 }) // UPDATE service_orders
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT status history
        .mockResolvedValueOnce({ rows: [{ part_id: 10, quantity: 2 }], rowCount: 1 }) // SELECT items (part_id is not null)
        .mockRejectedValueOnce(new Error('Stock update failed')) // UPDATE parts stock fails
        .mockResolvedValue({ rows: [], rowCount: 0 }); // ROLLBACK

      const permissionService = await import('../../../src/services/permissionService.js');
      vi.mocked(permissionService.permissionService.checkUserPermission).mockResolvedValueOnce(true);

      await expect(serviceOrderService.changeOrderStatus(serviceOrderId, 'Finalizado', userId))
        .rejects.toThrow('Stock update failed');
      expect(mockClientQuery).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('suggestTechnician', () => {
    const serviceOrderId = 1;
    const mockTechnicians = [{ id: 'tech1', name: 'Tech One' }];

    it('should return technicians with matching skills and lower open orders', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: [{ tags: ['skill1', 'skill2'] }], rowCount: 1 }) // SELECT tags
        .mockResolvedValueOnce({ rows: mockTechnicians, rowCount: 1 }); // SELECT technicians

      const technicians = await serviceOrderService.suggestTechnician(serviceOrderId);
      expect(technicians).toEqual(mockTechnicians);
      expect(mockQueryGlobal).toHaveBeenCalledWith(
        expect.stringContaining('WHERE r.name = \'technician\' AND s.name = ANY($1::text[])'),
        [['skill1', 'skill2']],
      );
    });

    it('should return all technicians with lower open orders if no order tags', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: [{ tags: [] }], rowCount: 1 }) // SELECT tags (empty)
        .mockResolvedValueOnce({ rows: mockTechnicians, rowCount: 1 }); // SELECT technicians without tags

      const technicians = await serviceOrderService.suggestTechnician(serviceOrderId);
      expect(technicians).toEqual(mockTechnicians);
      
      // Verificar que a segunda query foi a de técnicos sem filtro de tags
      const secondCallSql = mockQueryGlobal.mock.calls[1][0];
      expect(secondCallSql).toContain('FROM users u');
      expect(secondCallSql).toContain('JOIN user_roles ur ON u.id = ur.user_id');
      
      // Verificar que NÃO filtrou por tags
      expect(secondCallSql).not.toContain('AND s.name = ANY($1::text[])');
    });

    it('should throw error if service order not found', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT tags (empty)

      await expect(serviceOrderService.suggestTechnician(serviceOrderId)).rejects.toThrow(
        'Order not found',
      );
    });
  });

  describe('addComment', () => {
    const serviceOrderId = 1;
    const userId = 'user123';
    const commentText = 'Test comment';
    const mockComment = { id: 1, service_order_id: serviceOrderId, user_id: userId, comment_text: commentText };

    it('should add a comment to a service order', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: [mockComment], rowCount: 1 });

      const newComment = await serviceOrderService.addComment(serviceOrderId, userId, commentText);
      expect(newComment).toEqual(mockComment);
      expect(mockQueryGlobal).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO service_order_comments'),
        [serviceOrderId, userId, commentText],
      );
    });
  });

  describe('getComments', () => {
    const serviceOrderId = 1;
    const mockComments = [{ id: 1, comment_text: 'Comment 1', user_name: 'User A' }];

    it('should return comments for a service order', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: mockComments, rowCount: 1 });

      const comments = await serviceOrderService.getComments(serviceOrderId);
      expect(comments).toEqual(mockComments);
      expect(mockQueryGlobal).toHaveBeenCalledWith(
        expect.stringContaining('SELECT soc.*, u.name as user_name FROM service_order_comments soc'),
        [serviceOrderId],
      );
    });
  });

  describe('addServiceOrderAttachment', () => {
    const serviceOrderId = 1;
    const filePath = '/path/to/file.png';
    const fileType = 'image/png';
    const description = 'Screenshot of issue';
    const uploadedByUserId = 'user123';
    const mockAttachment = { id: 1, service_order_id: serviceOrderId, file_path: filePath };

    it('should add an attachment to a service order', async () => {
      mockQueryGlobal.mockResolvedValueOnce({ rows: [mockAttachment], rowCount: 1 });

      const newAttachment = await serviceOrderService.addServiceOrderAttachment(
        serviceOrderId,
        filePath,
        fileType,
        description,
        uploadedByUserId,
      );
      expect(newAttachment).toEqual(mockAttachment);
      expect(mockQueryGlobal).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO service_order_attachments'),
        [serviceOrderId, filePath, fileType, description, uploadedByUserId],
      );
    });
  });
});
