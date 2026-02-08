import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPool, mockPoolQuery, mockConnect, mockClient, mockClientQuery } = vi.hoisted(() => {
  const mPoolQuery = vi.fn();
  const mClientQuery = vi.fn();
  const mRelease = vi.fn();
  const mClient = { query: mClientQuery, release: mRelease };
  const mConnect = vi.fn().mockResolvedValue(mClient);
  const mPool = { query: mPoolQuery, connect: mConnect };
  return {
    mockPool: mPool,
    mockPoolQuery: mPoolQuery,
    mockConnect: mConnect,
    mockClient: mClient,
    mockClientQuery: mClientQuery,
  };
});

vi.mock('../../../src/db/index.js', () => ({
  default: mockPool,
  getPool: () => mockPool,
  query: mockPoolQuery,
  connect: mockConnect,
}));

vi.mock('../../../src/repositories/kanban.repository.js', () => ({
  kanbanRepository: {
    getBoard: vi.fn(),
    findCardForUpdate: vi.fn(),
    findColumnById: vi.fn(),
    countCardsInColumn: vi.fn(),
    shiftCards: vi.fn(),
    shiftCardsGap: vi.fn(),
    updateCardPosition: vi.fn(),
    getMaxPosition: vi.fn(),
    createCard: vi.fn(),
    updateCard: vi.fn(),
    deleteCard: vi.fn(),
    findColumnForUpdate: vi.fn(),
    shiftColumns: vi.fn(),
    updateColumnPosition: vi.fn(),
  },
}));

vi.mock('../../../src/services/serviceOrderService.js', () => ({
  serviceOrderService: {
    updateServiceOrderStatusFromKanban: vi.fn().mockResolvedValue({}),
    getServiceOrderById: vi.fn().mockResolvedValue({ id: 123, customer_id: 1, customer_name: 'John' }),
  },
}));

vi.mock('../../../src/services/whatsappService.js', () => ({
  whatsappService: {
    sendTemplateMessage: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../../src/services/customerService.js', () => ({
  customerService: {
    getCustomerById: vi.fn().mockResolvedValue({ phone: '12345' }),
  },
}));

import {
  getBoard,
  createCard,
  updateCard,
  deleteCard,
  moveCard,
  moveColumn,
} from '../../../src/services/kanbanService.js';
import { kanbanRepository } from '../../../src/repositories/kanban.repository.js';
import { serviceOrderService } from '../../../src/services/serviceOrderService.js';
import { whatsappService } from '../../../src/services/whatsappService.js';
import { AppError } from '../../../src/utils/errors.js';

describe('KanbanService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockPoolQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    mockClientQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    mockConnect.mockResolvedValue(mockClient);
  });

  describe('getBoard', () => {
    it('should return board from repository', async () => {
      vi.mocked(kanbanRepository.getBoard).mockResolvedValue([]);
      await getBoard();
      expect(kanbanRepository.getBoard).toHaveBeenCalled();
    });
  });

  describe('moveCard', () => {
    const mockCard = { id: 1, column_id: 1, position: 0, service_order_id: 123 };
    const mockColumn = { id: 2, title: 'Finalizado', wip_limit: 5, is_system: true };

    it('should move card to different column and trigger automation', async () => {
      vi.mocked(kanbanRepository.findCardForUpdate).mockResolvedValue(mockCard as any);
      vi.mocked(kanbanRepository.findColumnById).mockResolvedValue(mockColumn as any);
      vi.mocked(kanbanRepository.countCardsInColumn).mockResolvedValue(2);

      await moveCard({ cardId: 1, newColumnId: 2, newPosition: 0 });

      expect(kanbanRepository.updateCardPosition).toHaveBeenCalled();
      expect(serviceOrderService.updateServiceOrderStatusFromKanban).toHaveBeenCalledWith(
        123, 'Finalizado', 'Sistema Kanban', mockClient
      );
      expect(whatsappService.sendTemplateMessage).toHaveBeenCalled();
      expect(mockClientQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw error if WIP limit reached', async () => {
      vi.mocked(kanbanRepository.findCardForUpdate).mockResolvedValue(mockCard as any);
      vi.mocked(kanbanRepository.findColumnById).mockResolvedValue({ ...mockColumn, wip_limit: 2 } as any);
      vi.mocked(kanbanRepository.countCardsInColumn).mockResolvedValue(2);

      await expect(moveCard({ cardId: 1, newColumnId: 2, newPosition: 0 })).rejects.toThrow(/WIP limit/);
      expect(mockClientQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should handle shift cards in same column', async () => {
      vi.mocked(kanbanRepository.findCardForUpdate).mockResolvedValue(mockCard as any);
      await moveCard({ cardId: 1, newColumnId: 1, newPosition: 5 });
      expect(kanbanRepository.shiftCards).toHaveBeenCalled();
    });
  });

  describe('createCard', () => {
    it('should create card with position based on max position', async () => {
      vi.mocked(kanbanRepository.getMaxPosition).mockResolvedValue(10);
      vi.mocked(kanbanRepository.createCard).mockResolvedValue({ id: 1 } as any);

      await createCard({ columnId: 1, title: 'New' });

      expect(kanbanRepository.createCard).toHaveBeenCalledWith(expect.objectContaining({
        position: 11
      }));
    });
  });

  describe('updateCard', () => {
    it('should call repository update', async () => {
      await updateCard({ cardId: 1, title: 'Updated' });
      expect(kanbanRepository.updateCard).toHaveBeenCalledWith(1, { title: 'Updated' });
    });
  });

  describe('deleteCard', () => {
    it('should delete card and close gap', async () => {
      vi.mocked(kanbanRepository.findCardForUpdate).mockResolvedValue({ id: 1, column_id: 1, position: 2 } as any);
      
      const result = await deleteCard(1);

      expect(result.message).toContain('successfully');
      expect(kanbanRepository.deleteCard).toHaveBeenCalledWith(1, mockClient);
      expect(kanbanRepository.shiftCardsGap).toHaveBeenCalledWith(1, 2, 'close', mockClient);
    });

    it('should throw error if card not found', async () => {
      vi.mocked(kanbanRepository.findCardForUpdate).mockResolvedValue(null);
      await expect(deleteCard(999)).rejects.toThrow('Card not found');
    });
  });

  describe('moveColumn', () => {
    it('should move column position', async () => {
      vi.mocked(kanbanRepository.findColumnForUpdate).mockResolvedValue({ id: 1, position: 1 } as any);
      
      await moveColumn({ columnId: 1, newPosition: 3 });

      expect(kanbanRepository.shiftColumns).toHaveBeenCalledWith(1, 3, 'down', mockClient);
      expect(kanbanRepository.updateColumnPosition).toHaveBeenCalledWith(1, 3, mockClient);
    });

    it('should throw error if column not found', async () => {
      vi.mocked(kanbanRepository.findColumnForUpdate).mockResolvedValue(null);
      await expect(moveColumn({ columnId: 999, newPosition: 1 })).rejects.toThrow('not found');
    });
  });
});
