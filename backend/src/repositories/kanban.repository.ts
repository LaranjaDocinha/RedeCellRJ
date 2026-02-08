import { Pool, PoolClient } from 'pg';
import { getPool } from '../db/index.js';
import { Card, Column } from '../types/kanban.js';

export class KanbanRepository {
  private get db(): Pool {
    return getPool();
  }

  async getBoard(): Promise<Column[]> {
    const { rows } = await this.db.query<Column>(`
      SELECT 
        c.id, 
        c.title, 
        c.position, 
        c.is_system, 
        c.wip_limit,
        COALESCE(
          json_agg(
            k.* ORDER BY k.position
          ) FILTER (WHERE k.id IS NOT NULL),
          '[]'
        ) as cards
      FROM kanban_columns c
      LEFT JOIN kanban_cards k ON c.id = k.column_id
      GROUP BY c.id
      ORDER BY c.position ASC
    `);
    return rows;
  }

  async findCardById(id: number, client?: PoolClient): Promise<Card | undefined> {
    const executor = client || this.db;
    const { rows } = await executor.query('SELECT * FROM kanban_cards WHERE id = $1', [id]);
    return rows[0];
  }

  async findCardForUpdate(
    id: number,
    client: PoolClient,
  ): Promise<{ column_id: number; position: number; service_order_id?: number } | undefined> {
    const { rows } = await client.query(
      'SELECT column_id, position, service_order_id FROM kanban_cards WHERE id = $1 FOR UPDATE',
      [id],
    );
    return rows[0];
  }

  async findColumnById(id: number, client?: PoolClient): Promise<Column | undefined> {
    const executor = client || this.db;
    const { rows } = await executor.query('SELECT * FROM kanban_columns WHERE id = $1', [id]);
    return rows[0];
  }

  async countCardsInColumn(columnId: number, client: PoolClient): Promise<number> {
    const { rows } = await client.query(
      'SELECT COUNT(id) as count FROM kanban_cards WHERE column_id = $1',
      [columnId],
    );
    return parseInt(rows[0].count);
  }

  async getMaxPosition(columnId: number): Promise<number> {
    const { rows } = await this.db.query(
      'SELECT MAX(position) as max_pos FROM kanban_cards WHERE column_id = $1',
      [columnId],
    );
    return rows[0].max_pos === null ? 0 : parseInt(rows[0].max_pos, 10);
  }

  async createCard(data: Partial<Card>): Promise<Card> {
    const { rows } = await this.db.query(
      'INSERT INTO kanban_cards (title, description, column_id, position, priority, service_order_id, tags, assignee_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        data.title,
        data.description,
        data.column_id,
        data.position,
        data.priority,
        data.service_order_id,
        JSON.stringify(data.tags || []),
        data.assignee_id,
      ],
    );
    return rows[0];
  }

  async updateCard(id: number, data: Partial<Card>): Promise<Card | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramIndex++}`);
        // Special handling for JSON/Date if needed, but generic works for simple types
        if (key === 'tags') values.push(JSON.stringify(value));
        else values.push(value);
      }
    }

    if (fields.length === 0) return this.findCardById(id);

    values.push(id);
    const query = `UPDATE kanban_cards SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;

    const { rows } = await this.db.query(query, values);
    return rows[0];
  }

  async deleteCard(id: number, client: PoolClient): Promise<void> {
    await client.query('DELETE FROM kanban_cards WHERE id = $1', [id]);
  }

  // Métodos de reordenação (shift positions)
  async shiftCards(
    columnId: number,
    start: number,
    end: number,
    direction: 'up' | 'down',
    client: PoolClient,
  ): Promise<void> {
    const _op = direction === 'up' ? '+' : '-'; // up means increment position (move down visually? wait. position + 1)
    // If we want to open a space at X, we shift items >= X to X+1.

    // Logic from original service:
    // UPDATE ... SET position = position - 1 WHERE ...

    let _query = '';
    if (direction === 'down') {
      // Decrement position (move up list)
      _query = `UPDATE kanban_cards SET position = position - 1 WHERE column_id = $1 AND position > $2 AND position <= $3`;
    } else {
      // Increment position (move down list)
      _query = `UPDATE kanban_cards SET position = position + 1 WHERE column_id = $1 AND position >= $2 AND position < $3`;
    }

    // This logic is tricky to generalize without context. I will create specific methods matching the service logic.
    // Service logic case 1: Same Column
    // if old < new: shift -1 for range (old, new]
    // if old > new: shift +1 for range [new, old)

    // Service logic case 2: Diff Column
    // old col: shift -1 for range > oldPos
    // new col: shift +1 for range >= newPos

    if (direction === 'down') {
      await client.query(
        `UPDATE kanban_cards SET position = position - 1 WHERE column_id = $1 AND position > $2 AND position <= $3`,
        [columnId, start, end],
      );
    } else {
      await client.query(
        `UPDATE kanban_cards SET position = position + 1 WHERE column_id = $1 AND position >= $2 AND position < $3`,
        [columnId, start, end],
      );
    }
  }

  async shiftCardsGap(
    columnId: number,
    threshold: number,
    direction: 'close' | 'open',
    client: PoolClient,
  ): Promise<void> {
    // Close gap: delete item at threshold, shift items > threshold down (-1)
    // Open gap: insert item at threshold, shift items >= threshold up (+1)

    if (direction === 'close') {
      await client.query(
        `UPDATE kanban_cards SET position = position - 1 WHERE column_id = $1 AND position > $2`,
        [columnId, threshold],
      );
    } else {
      await client.query(
        `UPDATE kanban_cards SET position = position + 1 WHERE column_id = $1 AND position >= $2`,
        [columnId, threshold],
      );
    }
  }

  async updateCardPosition(
    id: number,
    columnId: number,
    position: number,
    client: PoolClient,
  ): Promise<void> {
    await client.query('UPDATE kanban_cards SET column_id = $1, position = $2 WHERE id = $3', [
      columnId,
      position,
      id,
    ]);
  }

  async findColumnForUpdate(
    id: number,
    client: PoolClient,
  ): Promise<{ position: number } | undefined> {
    const { rows } = await client.query(
      'SELECT position FROM kanban_columns WHERE id = $1 FOR UPDATE',
      [id],
    );
    return rows[0];
  }

  async updateColumnPosition(id: number, position: number, client: PoolClient): Promise<void> {
    await client.query('UPDATE kanban_columns SET position = $1 WHERE id = $2', [position, id]);
  }

  async shiftColumns(
    start: number,
    end: number,
    direction: 'up' | 'down',
    client: PoolClient,
  ): Promise<void> {
    if (direction === 'down') {
      // Decrement
      await client.query(
        `UPDATE kanban_columns SET position = position - 1 WHERE position > $1 AND position <= $2`,
        [start, end],
      );
    } else {
      // Increment
      await client.query(
        `UPDATE kanban_columns SET position = position + 1 WHERE position >= $1 AND position < $2`,
        [start, end],
      );
    }
  }
}

export const kanbanRepository = new KanbanRepository();
