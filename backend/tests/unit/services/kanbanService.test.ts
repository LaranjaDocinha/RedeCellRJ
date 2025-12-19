import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDbMock } from '../../utils/dbMock.js';

// Mock do pool do PostgreSQL
vi.mock('../../../src/db/index.js', () => {
  const { mockPool, mockQuery, mockConnect, mockClient } = createDbMock();
  return {
    default: mockPool,
    connect: mockConnect,
    query: mockQuery,
    getPool: () => mockPool,
    _mockQuery: mockQuery,
    _mockConnect: mockConnect,
    _mockClient: mockClient,
    _mockPool: mockPool,
  };
});

// Importar o serviço APÓS os mocks
import * as kanbanService from '../../../src/services/kanbanService.js';

describe('KanbanService', () => {
  let mockQuery: any;
  let mockConnect: any;

  beforeEach(async () => {
    const dbModule = await import('../../../src/db/index.js');
    mockQuery = (dbModule as any)._mockQuery;
    mockConnect = (dbModule as any)._mockConnect;

    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    mockConnect.mockResolvedValue((dbModule as any)._mockClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getBoard', () => {
    it('should return the board structure', async () => {
      const mockColumns = [{ id: 1, title: 'To Do', position: 0 }];
      const mockCards = [{ id: 101, title: 'Task 1', column_id: 1, position: 0 }];

      mockQuery
        .mockResolvedValueOnce({ rows: mockColumns, rowCount: 1 }) // SELECT columns
        .mockResolvedValueOnce({ rows: mockCards, rowCount: 1 }); // SELECT cards

      const board = await kanbanService.getBoard();

      expect(board).toHaveLength(1);
      expect(board[0].id).toBe(1);
      expect(board[0].cards).toHaveLength(1);
      expect(board[0].cards[0].id).toBe(101);
    });
  });

  describe('createCard', () => {
    it('should create a card at the correct position', async () => {
      const args = { columnId: 1, title: 'New Task', description: 'Desc' };
      const mockMaxPos = { max_pos: '5' };
      const mockNewCard = { id: 102, ...args, position: 6 };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockMaxPos], rowCount: 1 }) // SELECT MAX
        .mockResolvedValueOnce({ rows: [mockNewCard], rowCount: 1 }); // INSERT

      const card = await kanbanService.createCard(args);

      expect(card).toEqual(mockNewCard);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO kanban_cards'),
        [args.title, args.description, args.columnId, 6],
      );
    });

    it('should create a card at position 0 if column is empty', async () => {
      const args = { columnId: 1, title: 'New Task' };
      const mockMaxPos = { max_pos: null };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockMaxPos], rowCount: 1 }) // SELECT MAX
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // INSERT

      await kanbanService.createCard(args);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO kanban_cards'),
        [args.title, undefined, args.columnId, 0],
      );
    });
  });

  describe('updateCard', () => {
    it('should update card fields', async () => {
      const args = { cardId: 101, title: 'Updated Task' };
      const mockUpdatedCard = { id: 101, title: 'Updated Task' };

      mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedCard], rowCount: 1 });

      const card = await kanbanService.updateCard(args);

      expect(card).toEqual(mockUpdatedCard);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE kanban_cards SET title = $1, updated_at = current_timestamp WHERE id = $2 RETURNING *'),
        ['Updated Task', 101],
      );
    });

    it('should return existing card if no fields to update', async () => {
      const args = { cardId: 101 };
      const mockExistingCard = { id: 101, title: 'Original' };

      mockQuery.mockResolvedValueOnce({ rows: [mockExistingCard], rowCount: 1 });

      const card = await kanbanService.updateCard(args);

      expect(card).toEqual(mockExistingCard);
      expect(mockQuery).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE kanban_cards'));
    });
  });

  describe('deleteCard', () => {
    it('should delete a card and reorder remaining cards', async () => {
      const cardId = 101;
      const mockCard = { id: cardId, column_id: 1, position: 2 };

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockCard], rowCount: 1 }) // SELECT card
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // DELETE
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE positions
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const result = await kanbanService.deleteCard(cardId);

      expect(result.message).toBe('Card deleted successfully');
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM kanban_cards WHERE id = $1', [cardId]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE kanban_cards SET position = position - 1'),
        [1, 2],
      );
    });

    it('should throw error if card not found', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT card (empty)

      await expect(kanbanService.deleteCard(999)).rejects.toThrow('Card not found');
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('moveCard', () => {
    const cardId = 101;
    const oldColumnId = 1;
    const newColumnId = 1; // Same column
    const userId = 1; // Not used in moveCard directly, but useful for context if needed

    it('should not move card if position is the same', async () => {
      const args = { cardId, newColumnId: oldColumnId, newPosition: 2 };
      const mockCard = { id: cardId, column_id: oldColumnId, position: 2 };

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockCard], rowCount: 1 }) // SELECT card
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      await kanbanService.moveCard(args);

      expect(mockQuery).toHaveBeenCalledTimes(3); // BEGIN, SELECT, COMMIT
      expect(mockQuery).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE kanban_cards SET position'));
    });

    it('should move card within same column (down)', async () => {
      const args = { cardId, newColumnId: oldColumnId, newPosition: 5 };
      const mockCard = { id: cardId, column_id: oldColumnId, position: 2 }; // Moving from 2 to 5

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockCard], rowCount: 1 }) // SELECT card
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE positions (shift others up)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE target card
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      await kanbanService.moveCard(args);

      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SET position = position - 1 WHERE column_id = $1 AND position > $2 AND position <= $3'),
        [oldColumnId, 2, 5],
      );
      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE kanban_cards SET column_id = $1, position = $2 WHERE id = $3',
        [oldColumnId, 5, cardId],
      );
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should move card within same column (up)', async () => {
      const args = { cardId, newColumnId: oldColumnId, newPosition: 0 };
      const mockCard = { id: cardId, column_id: oldColumnId, position: 5 }; // Moving from 5 to 0

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockCard], rowCount: 1 }) // SELECT card
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE positions (shift others down)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE target card
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      await kanbanService.moveCard(args);

      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SET position = position + 1 WHERE column_id = $1 AND position >= $2 AND position < $3'),
        [oldColumnId, 0, 5],
      );
      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE kanban_cards SET column_id = $1, position = $2 WHERE id = $3',
        [oldColumnId, 0, cardId],
      );
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should move card to different column', async () => {
      const args = { cardId, newColumnId: 2, newPosition: 0 };
      const mockCard = { id: cardId, column_id: oldColumnId, position: 5 }; // Moving from col 1 pos 5 to col 2 pos 0

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockCard], rowCount: 1 }) // SELECT card
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE old column (shift down)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE new column (shift up)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE target card
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      await kanbanService.moveCard(args);

      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SET position = position - 1 WHERE column_id = $1 AND position > $2'),
        [oldColumnId, 5],
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SET position = position + 1 WHERE column_id = $1 AND position >= $2'),
        [args.newColumnId, 0],
      );
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw error if card not found', async () => {
      const args = { cardId: 999, newColumnId: 1, newPosition: 0 };

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT card (not found)

      await expect(kanbanService.moveCard(args)).rejects.toThrow('Card with ID 999 not found');
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should rollback transaction and log error if DB error occurs', async () => {
      const args = { cardId, newColumnId: oldColumnId, newPosition: 5 };
      const mockCard = { id: cardId, column_id: oldColumnId, position: 2 };

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockCard], rowCount: 1 }) // SELECT card
        .mockRejectedValueOnce(new Error('DB error during move')); // Simulate error

      await expect(kanbanService.moveCard(args)).rejects.toThrow('DB error during move');
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(consoleSpy).toHaveBeenCalledWith(
        '--- Error in moveCard transaction:',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('moveColumn', () => {
    const columnId = 1;
    const oldPosition = 1;

    it('should not move column if position is the same', async () => {
      const args = { columnId, newPosition: oldPosition };
      const mockColumn = { id: columnId, position: oldPosition };

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockColumn], rowCount: 1 }) // SELECT column
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      await kanbanService.moveColumn(args);

      expect(mockQuery).toHaveBeenCalledTimes(3); // BEGIN, SELECT, COMMIT
      expect(mockQuery).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE kanban_columns SET position'));
    });

    it('should move column down', async () => {
      const args = { columnId, newPosition: 3 };
      const mockColumn = { id: columnId, position: oldPosition }; // from 1 to 3

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockColumn], rowCount: 1 }) // SELECT column
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE others
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE target
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      await kanbanService.moveColumn(args);

      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SET position = position - 1 WHERE position > $1 AND position <= $2'),
        [oldPosition, 3],
      );
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should move column up', async () => {
      const args = { columnId, newPosition: 0 };
      const mockColumn = { id: columnId, position: oldPosition }; // from 1 to 0

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockColumn], rowCount: 1 }) // SELECT column
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE others
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE target
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      await kanbanService.moveColumn(args);

      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SET position = position + 1 WHERE position >= $1 AND position < $2'),
        [0, oldPosition],
      );
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw error if column not found', async () => {
      const args = { columnId: 999, newPosition: 0 };

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT column (not found)

      await expect(kanbanService.moveColumn(args)).rejects.toThrow('Column with ID 999 not found');
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should rollback transaction and log error if DB error occurs', async () => {
      const args = { columnId, newPosition: 3 };
      const mockColumn = { id: columnId, position: oldPosition };

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockColumn], rowCount: 1 }) // SELECT column
        .mockRejectedValueOnce(new Error('DB error during column move')); // Simulate error

      await expect(kanbanService.moveColumn(args)).rejects.toThrow('DB error during column move');
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(consoleSpy).toHaveBeenCalledWith(
        '--- Error in moveColumn transaction:',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });
});
