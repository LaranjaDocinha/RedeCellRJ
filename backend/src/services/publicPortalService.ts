import { getPool } from '../db/index.js';
import { AppError } from '../utils/errors.js';
import crypto from 'crypto';

export const publicPortalService = {
  /**
   * Busca uma OS usando o token público seguro.
   */
  async getOrderByToken(token: string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT 
        so.id, so.device_name, so.problem_description, so.status, so.estimated_cost, so.final_cost,
        so.entry_date, so.delivery_date, so.customer_approval_status, so.notes,
        c.name as customer_name, b.name as branch_name
       FROM service_orders so
       JOIN customers c ON so.customer_id = c.id
       JOIN branches b ON so.branch_id = b.id
       WHERE so.public_token = $1`,
      [token]
    );

    if (res.rows.length === 0) {
      throw new AppError('Order not found or invalid token', 404);
    }

    const order = res.rows[0];

    // Buscar itens e fotos
    const itemsRes = await pool.query('SELECT * FROM service_items WHERE service_order_id = $1', [order.id]);
    const photosRes = await pool.query("SELECT * FROM service_order_photos WHERE service_order_id = $1 AND type != 'internal'", [order.id]);

    return {
      ...order,
      items: itemsRes.rows,
      photos: photosRes.rows
    };
  },

  /**
   * Autentica o cliente via OS ID + CPF ou Telefone para gerar/recuperar o token.
   */
  async authenticateCustomer(osId: number, identity: string) {
    const pool = getPool();
    // Limpar formatação do input (apenas números)
    const cleanIdentity = identity.replace(/\D/g, '');

    // Tenta casar com CPF ou Phone do cliente dono da OS
    const res = await pool.query(
      `SELECT so.id, so.public_token 
       FROM service_orders so
       JOIN customers c ON so.customer_id = c.id
       WHERE so.id = $1 AND (
         REPLACE(REPLACE(REPLACE(c.cpf, '.', ''), '-', ''), ' ', '') = $2 OR 
         REPLACE(REPLACE(REPLACE(REPLACE(c.phone, '(', ''), ')', ''), '-', ''), ' ', '') LIKE '%' || $2
       )`,
      [osId, cleanIdentity]
    );

    if (res.rows.length === 0) {
      throw new AppError('Order not found or identity mismatch', 401);
    }

    let token = res.rows[0].public_token;

    // Se não tiver token ainda, gera um
    if (!token) {
      token = crypto.randomBytes(32).toString('hex');
      await pool.query('UPDATE service_orders SET public_token = $1 WHERE id = $2', [token, osId]);
    }

    return { token };
  },

  /**
   * Processa aprovação ou reprovação do orçamento pelo cliente.
   */
  async updateApproval(token: string, status: 'approved' | 'rejected', feedback?: string) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const pool = getPool();
    
    // Verifica status atual para não alterar OS já finalizada
    const checkRes = await pool.query('SELECT id, status FROM service_orders WHERE public_token = $1', [token]);
    if (checkRes.rows.length === 0) {
      throw new AppError('Order not found', 404);
    }
    const os = checkRes.rows[0];

    if (['finished', 'delivered', 'cancelled'].includes(os.status)) {
      throw new AppError('Cannot change approval for a finalized order', 400);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Atualiza status da aprovação
      await client.query(
        `UPDATE service_orders 
         SET customer_approval_status = $1, 
             customer_approval_date = NOW(),
             notes = CASE WHEN $3::text IS NOT NULL THEN notes || E'\n[Portal] Cliente ' || $1 || ': ' || $3 ELSE notes END,
             status = CASE WHEN $1 = 'approved' THEN 'in_progress' ELSE 'cancelled' END -- Auto-move workflow (simplificado)
         WHERE public_token = $2`,
        [status, token, feedback]
      );

      // Log de atividade/Notificação interna seria bom aqui (emitir evento) 
      
      await client.query('COMMIT');
      
      return { success: true, newStatus: status };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};
