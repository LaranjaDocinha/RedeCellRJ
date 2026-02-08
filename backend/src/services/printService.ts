import pool from '../db/index.js';
import { whatsappService } from './whatsappService.js';

export interface PrintCostConfig {
  costPerPage: number;
  inkCostPerPage: number;
  markup: number;
}

export const printService = {
  /**
   * Calcula o custo e preço sugerido de impressão.
   */
  calculateCost(
    pages: number,
    config: PrintCostConfig = { costPerPage: 0.05, inkCostPerPage: 0.1, markup: 2.5 },
  ) {
    const totalCost = pages * (config.costPerPage + config.inkCostPerPage);
    const suggestedPrice = totalCost * config.markup;

    return {
      totalCost: totalCost.toFixed(4),
      suggestedPrice: suggestedPrice.toFixed(2),
      profit: (suggestedPrice - totalCost).toFixed(2),
    };
  },

  async createJob(data: {
    customer_name: string;
    customer_phone?: string;
    description: string;
    quantity: number;
  }) {
    const res = await pool.query(
      'INSERT INTO print_jobs (customer_name, customer_phone, description, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.customer_name, data.customer_phone, data.description, data.quantity],
    );
    return res.rows[0];
  },

  async listJobs() {
    const res = await pool.query(
      'SELECT * FROM print_jobs WHERE status != $1 ORDER BY created_at ASC',
      ['Entregue'],
    );
    return res.rows;
  },

  async updateJobStatus(id: number, status: string) {
    const res = await pool.query(
      'UPDATE print_jobs SET status = $1, updated_at = current_timestamp WHERE id = $2 RETURNING *',
      [status, id],
    );

    return res.rows[0];
  },

  async notifyCustomer(id: number) {
    const res = await pool.query('SELECT * FROM print_jobs WHERE id = $1', [id]);
    const job = res.rows[0];

    if (!job || !job.customer_phone) {
      throw new Error('Cliente sem telefone cadastrado ou pedido não encontrado.');
    }

    // Usando queueTemplateMessage para robustez enterprise
    await whatsappService.queueTemplateMessage({
      phone: job.customer_phone,
      templateName: 'print_ready',
      variables: { name: job.customer_name },
    });

    return { success: true };
  },
};
