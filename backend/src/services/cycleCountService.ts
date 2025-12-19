import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { z } from 'zod';

interface CycleCountItemInput {
  product_variation_id: number;
  counted_quantity: number;
  notes?: string | null;
}

interface CreateCycleCountPayload {
  counted_by_user_id: number;
  branch_id: number;
  notes?: string | null;
  items: CycleCountItemInput[];
}

interface UpdateCycleCountPayload {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string | null;
  items?: CycleCountItemInput[];
}

export const cycleCountService = {
  async createCycleCount(payload: CreateCycleCountPayload) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { counted_by_user_id, branch_id, notes, items } = payload;

      const countResult = await client.query(
        'INSERT INTO cycle_counts (counted_by_user_id, branch_id, notes) VALUES ($1, $2, $3) RETURNING *',
        [counted_by_user_id, branch_id, notes],
      );
      const newCycleCount = countResult.rows[0];

      for (const item of items) {
        // Obter a quantidade atual do sistema
        const systemStockRes = await client.query(
          'SELECT stock_quantity FROM product_variations WHERE id = $1 AND branch_id = $2',
          [item.product_variation_id, branch_id],
        );
        const system_quantity = systemStockRes.rows[0]?.stock_quantity || 0;
        const discrepancy = item.counted_quantity - system_quantity;

        await client.query(
          'INSERT INTO cycle_count_items (cycle_count_id, product_variation_id, counted_quantity, system_quantity, discrepancy, notes) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            newCycleCount.id,
            item.product_variation_id,
            item.counted_quantity,
            system_quantity,
            discrepancy,
            item.notes,
          ],
        );
      }

      await client.query('COMMIT');
      return newCycleCount;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
      client.release();
    }
  },

  async getCycleCountById(id: number) {
    const countResult = await pool.query('SELECT * FROM cycle_counts WHERE id = $1', [id]);
    if (countResult.rows.length === 0) return null;

    const cycleCount = countResult.rows[0];
    const itemsResult = await pool.query(
      'SELECT * FROM cycle_count_items WHERE cycle_count_id = $1',
      [id],
    );
    cycleCount.items = itemsResult.rows;

    return cycleCount;
  },

  async getAllCycleCounts() {
    const result = await pool.query('SELECT * FROM cycle_counts ORDER BY count_date DESC');
    return result.rows;
  },

  async updateCycleCount(id: number, payload: UpdateCycleCountPayload) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { status, notes, items } = payload;
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (status !== undefined) {
        fields.push(`status = $${paramIndex++}`);
        values.push(status);
      }
      if (notes !== undefined) {
        fields.push(`notes = $${paramIndex++}`);
        values.push(notes);
      }

      if (fields.length > 0) {
        values.push(id);
        await client.query(
          `UPDATE cycle_counts SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`,
          values,
        );
      }

      if (items !== undefined) {
        // Lógica para atualizar itens da contagem (pode ser mais complexa)
        // Por simplicidade, vamos apenas deletar e reinserir
        await client.query('DELETE FROM cycle_count_items WHERE cycle_count_id = $1', [id]);
        for (const item of items) {
          // Obter a quantidade atual do sistema
          const systemStockRes = await client.query(
            'SELECT stock_quantity FROM product_variations WHERE id = $1', // branch_id não é necessário aqui se a variação já está associada à filial
            [item.product_variation_id],
          );
          const system_quantity = systemStockRes.rows[0]?.stock_quantity || 0;
          const discrepancy = item.counted_quantity - system_quantity;

          await client.query(
            'INSERT INTO cycle_count_items (cycle_count_id, product_variation_id, counted_quantity, system_quantity, discrepancy, notes) VALUES ($1, $2, $3, $4, $5, $6)',
            [
              id,
              item.product_variation_id,
              item.counted_quantity,
              system_quantity,
              discrepancy,
              item.notes,
            ],
          );
        }
      }

      // Lógica de ajuste de estoque quando o status muda para 'completed'
      if (status === 'completed') {
        const cycleCount = await this.getCycleCountById(id);
        if (!cycleCount) throw new AppError('Cycle count not found', 404);

        for (const item of cycleCount.items) {
          if (item.discrepancy !== 0) {
            // Ajustar estoque
            await client.query(
              'UPDATE product_variations SET stock_quantity = stock_quantity + $1 WHERE id = $2',
              [item.discrepancy, item.product_variation_id],
            );
            // Registrar movimento de inventário (opcional, mas recomendado)
            // await inventoryService.recordInventoryMovement(...)
          }
        }
      }

      const updatedCycleCount = await this.getCycleCountById(id);
      await client.query('COMMIT');
      return updatedCycleCount;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
      client.release();
    }
  },

  async deleteCycleCount(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM cycle_count_items WHERE cycle_count_id = $1', [id]);
      const result = await pool.query('DELETE FROM cycle_counts WHERE id = $1 RETURNING id', [id]);
      await client.query('COMMIT');
      return (result?.rowCount ?? 0) > 0;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    } finally {
      client.release();
    }
  },
};
