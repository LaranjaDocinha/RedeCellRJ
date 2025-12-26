import { getPool } from '../db/index.js';
import { Column, Card, MoveCardArgs, CreateCardArgs } from '../types/kanban.js';
import * as serviceOrderService from './serviceOrderService.js'; // Import serviceOrderService
import * as whatsappService from './whatsappService.js'; // Import whatsappService
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const getBoard = async (): Promise<Column[]> => {
  const { rows: columns } = await getPool().query<Omit<Column, 'cards'>>(
    'SELECT id, title, position, is_system, wip_limit FROM kanban_columns ORDER BY position ASC',
  );

  const { rows: cards } = await getPool().query<Card>(
    'SELECT id, title, description, column_id, position, due_date, assignee_id, priority, service_order_id, tags, created_at, updated_at FROM kanban_cards ORDER BY position ASC',
  );

  const board: Column[] = columns.map((column) => ({
    ...column,
    cards: cards.filter((card) => card.column_id === column.id),
  }));

  return board;
};

export const moveCard = async ({
  cardId,
  newColumnId,
  newPosition,
}: MoveCardArgs): Promise<void> => {
  logger.info('--- moveCard called with:', { cardId, newColumnId, newPosition });
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    const numCardId = parseInt(String(cardId), 10);
    const numNewColumnId = parseInt(String(newColumnId), 10);
    const numNewPosition = parseInt(String(newPosition), 10);

    const {
      rows: [cardToMove],
    } = await client.query<{ column_id: number; position: number; service_order_id?: number | null }>(
      'SELECT column_id, position, service_order_id FROM kanban_cards WHERE id = $1 FOR UPDATE',
      [numCardId],
    );

    if (!cardToMove) {
      throw new AppError(`Card with ID ${numCardId} not found`, 404);
    }

    const { column_id: oldColumnId, position: oldPosition, service_order_id } = cardToMove;

    if (oldColumnId !== numNewColumnId) {
      // Check WIP limit for the new column
      const {
        rows: [newColumn],
      } = await client.query<{ wip_limit: number; is_system: boolean; title: string }>(
        'SELECT wip_limit, is_system, title FROM kanban_columns WHERE id = $1',
        [numNewColumnId],
      );

      if (!newColumn) {
        throw new AppError(`New column with ID ${numNewColumnId} not found`, 404);
      }

      if (newColumn.wip_limit !== -1) {
        const {
          rows: [{ current_cards_count }],
        } = await client.query<{ current_cards_count: number }>(
          'SELECT COUNT(id) as current_cards_count FROM kanban_cards WHERE column_id = $1',
          [numNewColumnId],
        );

        if (current_cards_count >= newColumn.wip_limit) {
          logger.info(`WIP limit of ${newColumn.wip_limit} reached for column "${newColumn.title}". Current: ${current_cards_count}`);
          throw new AppError(`WIP limit of ${newColumn.wip_limit} reached for column "${newColumn.title}"`, 400);
        }
      }

      // Automação para coluna "Finalizado" (is_system = true e título "Finalizado" ou "Entregue")
      if (newColumn.is_system && (newColumn.title === 'Finalizado' || newColumn.title === 'Entregue') && service_order_id) {
        logger.info(`[KANBAN AUTOMATION] Card ${numCardId} moved to "Finalizado". Service Order ${service_order_id} will be updated.`);
        await serviceOrderService.updateServiceOrderStatus(service_order_id, 'Finalizado', 'Sistema Kanban', client);
        // Opcional: Notificação WhatsApp para o cliente
        const so = await serviceOrderService.getServiceOrderById(service_order_id);
        if (so && so.customer_id) {
          const customer = await getPool().query('SELECT phone FROM customers WHERE id = $1', [so.customer_id]);
          if (customer.rows[0]?.phone) {
            whatsappService.sendTemplateMessage(
              customer.rows[0].phone,
              'service_order_ready', // Template customizado para OS pronta
              { orderId: service_order_id, customerName: so.customer_name } // Dados para o template
            ).catch(e => logger.error('Failed to send WhatsApp notification:', e));
          }
        }
      }
    }

    if (oldColumnId === numNewColumnId) {
      if (oldPosition === numNewPosition) {
        await client.query('COMMIT');
        return;
      }

      if (oldPosition < numNewPosition) {
        await client.query(
          `UPDATE kanban_cards SET position = position - 1 WHERE column_id = $1 AND position > $2 AND position <= $3`,
          [oldColumnId, oldPosition, numNewPosition],
        );
      } else {
        await client.query(
          `UPDATE kanban_cards SET position = position + 1 WHERE column_id = $1 AND position >= $2 AND position < $3`,
          [oldColumnId, numNewPosition, oldPosition],
        );
      }
    } else {
      await client.query(
        `UPDATE kanban_cards SET position = position - 1 WHERE column_id = $1 AND position > $2`,
        [oldColumnId, oldPosition],
      );
      await client.query(
        `UPDATE kanban_cards SET position = position + 1 WHERE column_id = $1 AND position >= $2`,
        [numNewColumnId, numNewPosition],
      );
    }

    await client.query('UPDATE kanban_cards SET column_id = $1, position = $2 WHERE id = $3', [
      numNewColumnId,
      numNewPosition,
      numCardId,
    ]);

    await client.query('COMMIT');
  } catch (e) {
    console.log('--- Error in moveCard transaction:', e);
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export const createCard = async ({
  columnId,
  title,
  description,
  priority = 'normal', // Default to normal
  serviceOrderId = null, // Default to null
  tags = [], // Default to empty array
  assigneeId = null, // Add assigneeId here
}: CreateCardArgs): Promise<Card> => {
  const {
    rows: [maxPos],
  } = await getPool().query<{ max_pos: string | null }>(
    'SELECT MAX(position) as max_pos FROM kanban_cards WHERE column_id = $1',
    [columnId],
  );
  const newPosition = maxPos.max_pos === null ? 0 : parseInt(maxPos.max_pos, 10) + 1;

  const {
    rows: [newCard],
  } = await getPool().query<Card>(
    'INSERT INTO kanban_cards (title, description, column_id, position, priority, service_order_id, tags, assignee_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [title, description, columnId, newPosition, priority, serviceOrderId, JSON.stringify(tags), assigneeId],
  );
  return newCard;
};

interface UpdateCardArgs {
  cardId: number;
  title?: string;
  description?: string;
  due_date?: string; // ISO string
  assignee_id?: string | null;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  service_order_id?: number | null; // Adicionado
  tags?: string[]; // Adicionado
}

export const updateCard = async ({
  cardId,
  title,
  description,
  due_date,
  assignee_id,
  priority,
  service_order_id,
  tags,
}: UpdateCardArgs): Promise<Card | undefined> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(title);
  }
  if (description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(description);
  }
  if (due_date !== undefined) {
    fields.push(`due_date = $${paramIndex++}`);
    values.push(due_date ? new Date(due_date) : null);
  }
  if (assignee_id !== undefined) {
    fields.push(`assignee_id = $${paramIndex++}`);
    values.push(assignee_id);
  }
  if (priority !== undefined) {
    fields.push(`priority = $${paramIndex++}`);
    values.push(priority);
  }
  if (service_order_id !== undefined) {
    fields.push(`service_order_id = $${paramIndex++}`);
    values.push(service_order_id);
  }
  if (tags !== undefined) {
    fields.push(`tags = $${paramIndex++}`);
    values.push(JSON.stringify(tags)); // Store tags as JSONB
  }

  if (fields.length === 0) {
    const {
      rows: [existingCard],
    } = await getPool().query('SELECT * FROM kanban_cards WHERE id = $1', [cardId]);
    return existingCard; // No fields to update, return existing card
  }

  values.push(cardId); // Add cardId for WHERE clause
  const query = `UPDATE kanban_cards SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;

  const {
    rows: [updatedCard],
  } = await getPool().query<Card>(query, values);
  return updatedCard;
};

export const deleteCard = async (cardId: number): Promise<{ message: string }> => {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    const {
      rows: [cardToDelete],
    } = await client.query<{ column_id: number; position: number }>(
      'SELECT column_id, position FROM kanban_cards WHERE id = $1 FOR UPDATE',
      [cardId],
    );

    if (!cardToDelete) {
      throw new Error('Card not found');
    }

    await client.query('DELETE FROM kanban_cards WHERE id = $1', [cardId]);

    await client.query(
      'UPDATE kanban_cards SET position = position - 1 WHERE column_id = $1 AND position > $2',
      [cardToDelete.column_id, cardToDelete.position],
    );

    await client.query('COMMIT');
    return { message: 'Card deleted successfully' };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

interface MoveColumnArgs {
  columnId: string | number;
  newPosition: string | number;
}

export const moveColumn = async ({ columnId, newPosition }: MoveColumnArgs): Promise<void> => {
  console.log('--- moveColumn called with:', { columnId, newPosition });
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    const numColumnId = parseInt(String(columnId), 10);
    const numNewPosition = parseInt(String(newPosition), 10);

    const {
      rows: [columnToMove],
    } = await client.query<{ position: number }>(
      'SELECT position FROM kanban_columns WHERE id = $1 FOR UPDATE',
      [numColumnId],
    );

    if (!columnToMove) {
      throw new Error(`Column with ID ${numColumnId} not found`);
    }

    const oldPosition = columnToMove.position;

    if (oldPosition === numNewPosition) {
      await client.query('COMMIT');
      return;
    }

    if (oldPosition < numNewPosition) {
      await client.query(
        `UPDATE kanban_columns SET position = position - 1 WHERE position > $1 AND position <= $2`,
        [oldPosition, numNewPosition],
      );
    } else {
      await client.query(
        `UPDATE kanban_columns SET position = position + 1 WHERE position >= $1 AND position < $2`,
        [numNewPosition, oldPosition],
      );
    }

    await client.query('UPDATE kanban_columns SET position = $1 WHERE id = $2', [
      numNewPosition,
      numColumnId,
    ]);

    await client.query('COMMIT');
  } catch (e) {
    console.log('--- Error in moveColumn transaction:', e);
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};
