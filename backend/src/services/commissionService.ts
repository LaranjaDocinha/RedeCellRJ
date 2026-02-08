import pool, { getPool } from '../db/index.js';
import { logger } from '../utils/logger.js';

export const commissionService = {
  /**
   * Calcula e registra comissão para uma venda.
   */
  async calculateForSale(sale: any, externalClient?: any) {
    const client = externalClient || getPool();
    try {
      logger.info(`[Commission] Calculando para Venda #${sale.id} (Vendedor: ${sale.user_id})`);

      // 1. Buscar regras para o usuário ou cargo do usuário
      const userRes = await client.query(
        'SELECT role_id FROM user_roles WHERE user_id = $1 LIMIT 1',
        [sale.user_id],
      );
      const roleId = userRes.rows[0]?.role_id;

      for (const item of sale.items) {
        // Buscar regra mais específica: Usuário + Categoria -> Cargo + Categoria -> Apenas Categoria
        const ruleQuery = `
            SELECT * FROM commission_rules 
            WHERE type = 'sale'
            AND (user_id = $1 OR user_id IS NULL)
            AND (role_id = $2 OR role_id IS NULL)
            AND (category_id = $3 OR category_id IS NULL)
            ORDER BY user_id NULLS LAST, role_id NULLS LAST, category_id NULLS LAST
            LIMIT 1
        `;

        const ruleRes = await client.query(ruleQuery, [sale.user_id, roleId || null, item.category_id || null]);
        const rule = ruleRes.rows[0];
        

        if (rule) {
          const amount = Number(item.total_price);
          const commission = amount * (Number(rule.percentage) / 100) + Number(rule.fixed_value);

          await client.query(
            `INSERT INTO commissions_earned (user_id, sale_id, base_amount, commission_amount) 
                 VALUES ($1, $2, $3, $4)`,
            [sale.user_id, sale.id, amount, commission],
          );
        }
      }
    } catch (error) {
      logger.error(`Error calculating commission for sale ${sale.id}:`, error);
      throw error;
    }
  },

  /**
   * Calcula e registra comissão para uma Ordem de Serviço finalizada.
   */
  async calculateForOS(os: any, externalClient?: any) {
    if (!os.technician_id) return;
    const client = externalClient || getPool();

    try {
      logger.info(`[Commission] Calculando para OS #${os.id} (Técnico: ${os.technician_id})`);

      const ruleQuery = `
        SELECT * FROM commission_rules 
        WHERE type = 'os'
        AND (user_id = $1 OR user_id IS NULL)
        LIMIT 1
      `;

      const ruleRes = await client.query(ruleQuery, [os.technician_id]);
      const rule = ruleRes.rows[0];

      if (rule) {
        const amount = Number(os.budget_value || 0);
        const commission = amount * (Number(rule.percentage) / 100) + Number(rule.fixed_value);

        await client.query(
          `INSERT INTO commissions_earned (user_id, service_order_id, base_amount, commission_amount) 
               VALUES ($1, $2, $3, $4)`,
          [os.technician_id, os.id, amount, commission],
        );
      }
    } catch (error) {
      logger.error(`Error calculating commission for OS ${os.id}:`, error);
      throw error;
    }
  },

  async getSalespersonPerformance(userId: string, startDate: string, endDate: string) {
    const res = await pool.query(
      `SELECT 
            COALESCE(SUM(base_amount), 0) as total_sales,
            COALESCE(SUM(commission_amount), 0) as total_commission
           FROM commissions_earned 
           WHERE user_id = $1 AND created_at BETWEEN $2 AND $3`,
      [userId, startDate, endDate],
    );

    const { total_sales, total_commission } = res.rows[0];
    return {
      totals: {
        totalSales: Number(total_sales),
        totalCommission: Number(total_commission),
      },
    };
  },
};
