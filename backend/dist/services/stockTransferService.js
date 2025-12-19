import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
export const stockTransferService = {
    async createStockTransfer(payload) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const { origin_branch_id, destination_branch_id, notes, created_by_user_id, items } = payload;
            if (origin_branch_id === destination_branch_id) {
                throw new AppError('Origin and destination branches cannot be the same.', 400);
            }
            const transferResult = await client.query('INSERT INTO stock_transfers (origin_branch_id, destination_branch_id, notes, created_by_user_id) VALUES ($1, $2, $3, $4) RETURNING *', [origin_branch_id, destination_branch_id, notes, created_by_user_id]);
            const newTransfer = transferResult.rows[0];
            for (const item of items) {
                // Verificar estoque na filial de origem
                const stockRes = await client.query('SELECT stock_quantity FROM product_variations WHERE id = $1 AND branch_id = $2', [item.product_variation_id, origin_branch_id]);
                if (stockRes.rows.length === 0 || stockRes.rows[0].stock_quantity < item.quantity) {
                    throw new AppError(`Insufficient stock for variation ${item.product_variation_id} in origin branch.`, 400);
                }
                await client.query('INSERT INTO stock_transfer_items (stock_transfer_id, product_variation_id, quantity) VALUES ($1, $2, $3)', [newTransfer.id, item.product_variation_id, item.quantity]);
            }
            await client.query('COMMIT');
            return newTransfer;
        }
        catch (error) {
            await client.query('ROLLBACK');
            if (error instanceof AppError) {
                throw error;
            }
            throw error;
        }
        finally {
            client.release();
        }
    },
    async getStockTransferById(id) {
        const transferResult = await pool.query('SELECT * FROM stock_transfers WHERE id = $1', [id]);
        if (transferResult.rows.length === 0)
            return null;
        const transfer = transferResult.rows[0];
        const itemsResult = await pool.query('SELECT * FROM stock_transfer_items WHERE stock_transfer_id = $1', [id]);
        transfer.items = itemsResult.rows;
        return transfer;
    },
    async getAllStockTransfers() {
        const result = await pool.query('SELECT * FROM stock_transfers ORDER BY created_at DESC');
        return result.rows;
    },
    async updateStockTransfer(id, payload) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const { status, notes, items } = payload;
            const fields = [];
            const values = [];
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
                await client.query(`UPDATE stock_transfers SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`, values);
            }
            if (items !== undefined) {
                // Lógica para atualizar itens da transferência (pode ser mais complexa, como adicionar/remover)
                // Por simplicidade, vamos apenas deletar e reinserir
                await client.query('DELETE FROM stock_transfer_items WHERE stock_transfer_id = $1', [id]);
                for (const item of items) {
                    await client.query('INSERT INTO stock_transfer_items (stock_transfer_id, product_variation_id, quantity) VALUES ($1, $2, $3)', [id, item.product_variation_id, item.quantity]);
                }
            }
            // Lógica de atualização de estoque quando o status muda para 'completed'
            if (status === 'completed') {
                const transfer = await this.getStockTransferById(id);
                if (!transfer)
                    throw new AppError('Stock transfer not found', 404);
                for (const item of transfer.items) {
                    // Deduzir estoque da filial de origem
                    await client.query('UPDATE product_variations SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND branch_id = $3', [item.quantity, item.product_variation_id, transfer.origin_branch_id]);
                    // Adicionar estoque à filial de destino
                    await client.query('UPDATE product_variations SET stock_quantity = stock_quantity + $1 WHERE id = $2 AND branch_id = $3', [item.quantity, item.product_variation_id, transfer.destination_branch_id]);
                }
            }
            const updatedTransfer = await this.getStockTransferById(id);
            await client.query('COMMIT');
            return updatedTransfer;
        }
        catch (error) {
            await client.query('ROLLBACK');
            if (error instanceof AppError) {
                throw error;
            }
            throw error;
        }
        finally {
            client.release();
        }
    },
    async deleteStockTransfer(id) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM stock_transfer_items WHERE stock_transfer_id = $1', [id]);
            const result = await pool.query('DELETE FROM stock_transfers WHERE id = $1 RETURNING id', [
                id,
            ]);
            await client.query('COMMIT');
            return (result?.rowCount ?? 0) > 0;
        }
        catch (error) {
            await client.query('ROLLBACK');
            if (error instanceof AppError) {
                throw error;
            }
            throw error;
        }
        finally {
            client.release();
        }
    },
};
