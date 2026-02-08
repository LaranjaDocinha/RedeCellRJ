import pool from '../db/index.js';
import { Column, Card, MoveCardArgs, CreateCardArgs } from '../types/kanban.js';
import { serviceOrderService } from './serviceOrderService.js';
import { whatsappService } from './whatsappService.js';
import { customerService } from './customerService.js'; // Assuming we need customer phone
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { kanbanRepository } from '../repositories/kanban.repository.js';

export const getBoard = async (): Promise<Column[]> => {
  return kanbanRepository.getBoard();
};

export const moveCard = async ({
  cardId,
  newColumnId,
  newPosition,
}: MoveCardArgs): Promise<void> => {
  logger.info('--- moveCard called with:', { cardId, newColumnId, newPosition });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const numCardId = parseInt(String(cardId), 10);
    const numNewColumnId = parseInt(String(newColumnId), 10);
    const numNewPosition = parseInt(String(newPosition), 10);

    const cardToMove = await kanbanRepository.findCardForUpdate(numCardId, client);

    if (!cardToMove) {
      throw new AppError(`Card with ID ${numCardId} not found`, 404);
    }

    const { column_id: oldColumnId, position: oldPosition, service_order_id } = cardToMove;

    if (oldColumnId !== numNewColumnId) {
      // Check WIP limit for the new column
      const newColumn = await kanbanRepository.findColumnById(numNewColumnId, client);

      if (!newColumn) {
        throw new AppError(`New column with ID ${numNewColumnId} not found`, 404);
      }

      if (newColumn.wip_limit !== -1) {
        const currentCardsCount = await kanbanRepository.countCardsInColumn(numNewColumnId, client);

        if (currentCardsCount >= newColumn.wip_limit) {
          logger.info(
            `WIP limit of ${newColumn.wip_limit} reached for column "${newColumn.title}". Current: ${currentCardsCount}`,
          );
          throw new AppError(
            `WIP limit of ${newColumn.wip_limit} reached for column "${newColumn.title}"`,
            400,
          );
        }
      }

      // Automação para coluna "Finalizado"
      if (
        newColumn.is_system &&
        (newColumn.title === 'Finalizado' || newColumn.title === 'Entregue') &&
        service_order_id
      ) {
        logger.info(
          `[KANBAN AUTOMATION] Card ${numCardId} moved to "Finalizado". Service Order ${service_order_id} will be updated.`,
        );
        await serviceOrderService.updateServiceOrderStatusFromKanban(
          service_order_id,
          'Finalizado',
          'Sistema Kanban',
          client,
        );

        const so = await serviceOrderService.getServiceOrderById(service_order_id);
        if (so && so.customer_id) {
          const customer = await customerService.getCustomerById(so.customer_id.toString());
          if (customer?.phone) {
            whatsappService
              .sendTemplateMessage({
                customerId: so.customer_id,
                phone: customer.phone,
                templateName: 'service_order_ready',
                variables: {
                  orderId: service_order_id,
                  customerName: so.customer_name || 'Cliente',
                },
              })
              .catch((e) => logger.error('Failed to send WhatsApp notification:', e));
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
        // Shift down (decrement pos) for items in between
        await kanbanRepository.shiftCards(oldColumnId, oldPosition, numNewPosition, 'down', client);
      } else {
        // Shift up (increment pos)
        await kanbanRepository.shiftCards(oldColumnId, numNewPosition, oldPosition, 'up', client);
      }
    } else {
      // Different columns
      // Close gap in old column
      await kanbanRepository.shiftCardsGap(oldColumnId, oldPosition, 'close', client);
      // Open gap in new column
      await kanbanRepository.shiftCardsGap(numNewColumnId, numNewPosition, 'open', client);
    }

    await kanbanRepository.updateCardPosition(numCardId, numNewColumnId, numNewPosition, client);

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
  priority = 'normal',
  serviceOrderId = null,
  tags = [],
  assigneeId = null,
}: CreateCardArgs): Promise<Card> => {
  const maxPos = await kanbanRepository.getMaxPosition(columnId);
  const newPosition = maxPos + 1;

  return kanbanRepository.createCard({
    columnId,
    title,
    description,
    position: newPosition,
    priority,
    serviceOrderId,
    tags,
    assigneeId,
  });
};

interface UpdateCardArgs {
  cardId: number;
  title?: string;
  description?: string;
  due_date?: string;
  assignee_id?: string | null;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  service_order_id?: number | null;
  tags?: string[];
}

export const updateCard = async (args: UpdateCardArgs): Promise<Card | undefined> => {
  const { cardId, ...data } = args;
  return kanbanRepository.updateCard(cardId, data);
};

export const deleteCard = async (cardId: number): Promise<{ message: string }> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cardToDelete = await kanbanRepository.findCardForUpdate(cardId, client);

    if (!cardToDelete) {
      throw new Error('Card not found');
    }

    await kanbanRepository.deleteCard(cardId, client);
    await kanbanRepository.shiftCardsGap(
      cardToDelete.column_id,
      cardToDelete.position,
      'close',
      client,
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const numColumnId = parseInt(String(columnId), 10);
    const numNewPosition = parseInt(String(newPosition), 10);

    const columnToMove = await kanbanRepository.findColumnForUpdate(numColumnId, client);

    if (!columnToMove) {
      throw new Error(`Column with ID ${numColumnId} not found`);
    }

    const oldPosition = columnToMove.position;

    if (oldPosition === numNewPosition) {
      await client.query('COMMIT');
      return;
    }

    if (oldPosition < numNewPosition) {
      await kanbanRepository.shiftColumns(oldPosition, numNewPosition, 'down', client);
    } else {
      await kanbanRepository.shiftColumns(numNewPosition, oldPosition, 'up', client);
    }

    await kanbanRepository.updateColumnPosition(numColumnId, numNewPosition, client);

    await client.query('COMMIT');
  } catch (e) {
    console.log('--- Error in moveColumn transaction:', e);
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};
