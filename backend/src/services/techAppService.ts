import { getPool } from '../db/index.js';

interface AddPhotoParams {
  serviceOrderId: number;
  url: string;
  type: 'entry' | 'exit' | 'internal';
  userId: string;
}

export const techAppService = {
  /**
   * Lista OS abertas para o painel do técnico.
   */
  async getOpenOrders(branchId: number, userId?: string) {
    const pool = getPool();
    // Busca OS com status 'open', 'analysis', 'in_progress'
    // Prioriza OS atribuídas ao usuário, mas mostra fila geral da loja
    const res = await pool.query(
      `SELECT so.id, so.device_name, so.problem_description, so.status, so.priority, so.entry_date,
              c.name as customer_name
       FROM service_orders so
       JOIN customers c ON so.customer_id = c.id
       WHERE so.branch_id = $1 
         AND so.status IN ('open', 'analysis', 'in_progress', 'waiting_approval')
       ORDER BY 
         CASE WHEN so.user_id = $2 THEN 0 ELSE 1 END, -- Minhas primeiro
         CASE WHEN so.priority = 'urgent' THEN 0 ELSE 1 END, -- Urgentes depois
         so.entry_date ASC`,
      [branchId, userId],
    );
    return res.rows;
  },

  /**
   * Adiciona uma foto à OS.
   */
  async addServicePhoto({ serviceOrderId, url, type, userId }: AddPhotoParams) {
    const pool = getPool();

    const result = await pool.query(
      `INSERT INTO service_order_photos (service_order_id, url, type, uploaded_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [serviceOrderId, url, type, userId],
    );
    return result.rows[0];
  },

  /**
   * Busca template de checklist.
   */
  async getChecklistTemplate(type: 'pre-repair' | 'post-repair' = 'pre-repair') {
    const pool = getPool();

    // Busca o template mais recente desse tipo
    const templateRes = await pool.query(
      'SELECT id, name FROM checklist_templates WHERE type = $1 ORDER BY created_at DESC LIMIT 1',
      [type],
    );

    if (templateRes.rows.length === 0) {
      // Retorna um default se não houver no banco
      return {
        id: 0,
        name: 'Checklist Padrão',
        items: [
          { item_name: 'Tela intacta?' },
          { item_name: 'Liga/Desliga?' },
          { item_name: 'Carrega?' },
          { item_name: 'Wi-Fi conecta?' },
          { item_name: 'Câmeras funcionam?' },
        ],
      };
    }

    const templateId = templateRes.rows[0].id;
    const itemsRes = await pool.query(
      'SELECT item_name FROM checklist_template_items WHERE template_id = $1 ORDER BY position ASC',
      [templateId],
    );

    return {
      ...templateRes.rows[0],
      items: itemsRes.rows,
    };
  },

  /**
   * Salva o checklist preenchido na OS.
   */
  async submitChecklist(serviceOrderId: number, checklistData: any, userId: string) {
    const pool = getPool();

    await pool.query(
      `UPDATE service_orders 
       SET inspection_checklist = $1, 
           updated_at = NOW()
       WHERE id = $2`,
      [
        JSON.stringify({ ...checklistData, submitted_by: userId, submitted_at: new Date() }),
        serviceOrderId,
      ],
    );

    return { success: true };
  },
};
