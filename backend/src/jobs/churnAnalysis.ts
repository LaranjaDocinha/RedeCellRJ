import { getPool } from '../db/index.js';
import { logger } from '../utils/logger.js';

export const analyzeChurn = async () => {
  logger.info('Starting Churn Analysis...');
  const pool = getPool();

  // Clientes que compraram há mais de 60 dias e não compraram nos últimos 60 dias
  // E que tinham frequência de compra (pelo menos 2 compras antes)
  const query = `
    UPDATE customers
    SET rfm_segment = 'Churn Risk'
    WHERE id IN (
        SELECT customer_id 
        FROM sales 
        GROUP BY customer_id 
        HAVING 
            MAX(sale_date) < NOW() - INTERVAL '60 days' 
            AND COUNT(id) >= 2
    )
  `;

  const result = await pool.query(query);
  logger.info(`Churn Analysis Complete. Marked ${result.rowCount} customers as 'Churn Risk'.`);
};
