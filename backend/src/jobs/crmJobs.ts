import cron from 'node-cron';
import pool from '../db/index.js';
import { logger } from '../utils/logger.js';
import { whatsappService } from '../services/whatsappService.js';

// Executar todos os dias às 10:00 AM
const scheduleCrmJobs = () => {
  cron.schedule('0 10 * * *', async () => {
    logger.info('[CRM Job] Iniciando análise de ciclo de vida...');

    const client = await pool.connect();
    try {
      // 1. Regra: Bateria (12 meses após troca)
      const batteryCandidates = await client.query(`
        SELECT c.name, c.phone, so.product_description
        FROM service_orders so
        JOIN service_order_items soi ON so.id = soi.service_order_id
        JOIN customers c ON so.customer_id = c.id
        WHERE soi.service_description ILIKE '%bateria%'
        AND so.created_at::date = CURRENT_DATE - INTERVAL '1 year'
        AND so.status = 'Finalizado'
      `);

      for (const candidate of batteryCandidates.rows) {
        await whatsappService.sendMessage(
          candidate.phone,
          `Olá ${candidate.name}! Faz 1 ano que trocamos a bateria do seu ${candidate.product_description}. Como está a saúde dela? Se precisar, temos condições especiais para renovar a energia do seu aparelho! 🔋`,
        );
        logger.info(`[CRM Job] Oferta de bateria enviada para ${candidate.name}`);
      }

      // 2. Regra: Película (3 meses após aplicação)
      const protectorCandidates = await client.query(`
        SELECT c.name, c.phone
        FROM sales s
        JOIN sale_items si ON s.id = si.sale_id
        JOIN customers c ON s.customer_id = c.id
        JOIN product_variations pv ON si.variation_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE p.name ILIKE '%película%'
        AND s.sale_date::date = CURRENT_DATE - INTERVAL '3 months'
      `);

      for (const candidate of protectorCandidates.rows) {
        await whatsappService.sendMessage(
          candidate.phone,
          `Oi ${candidate.name}! Sua película de proteção já tem 3 meses. Que tal passar aqui na Redecell para ver se ela ainda está protegendo 100%? Troca rápida e segura! 🛡️`,
        );
        logger.info(`[CRM Job] Oferta de película enviada para ${candidate.name}`);
      }
    } catch (error) {
      logger.error('[CRM Job] Erro ao executar análise:', error);
    } finally {
      client.release();
    }
  });
};

export default scheduleCrmJobs;
