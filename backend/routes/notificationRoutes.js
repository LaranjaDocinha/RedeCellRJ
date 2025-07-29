const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint para gerar notificações (simula um job agendado)
router.post('/generate', async (req, res) => {
  try {
    await db.query('BEGIN');
    const client = await db.getClient();
    try {
      // --- Regra 1: Alerta de Estoque Baixo ---
      const lowStockProductsResult = await client.query(
        `SELECT
          p.name as product_name,
          pv.color as variation_color,
          pv.stock_quantity,
          pv.alert_threshold
        FROM product_variations pv
        JOIN products p ON pv.product_id = p.id
        WHERE pv.stock_quantity <= pv.alert_threshold
        AND pv.status = 'active';`
      );
      const lowStockProducts = lowStockProductsResult.rows;

      for (const product of lowStockProducts) {
        const message = `Estoque baixo: ${product.product_name} (${product.variation_color}) tem apenas ${product.stock_quantity} unidades. Limite de alerta: ${product.alert_threshold}.`;
        await client.query(
          `INSERT INTO notifications (type, message) VALUES ($1, $2)
          ON CONFLICT (type, message) DO NOTHING;`,
          ['stock_alert', message]
        );
      }

      // --- Regra 2: Clientes em Risco (baseado na segmentação anterior) ---
      const atRiskCustomersResult = await client.query(
        `SELECT name FROM customers WHERE segment = 'Em Risco';`
      );
      const atRiskCustomers = atRiskCustomersResult.rows;

      if (atRiskCustomers.length > 0) {
        const customerNames = atRiskCustomers.map(c => c.name).join(', ');
        const message = `Temos ${atRiskCustomers.length} cliente(s) em risco: ${customerNames}. Considere ações de reengajamento.`;
        await client.query(
          `INSERT INTO notifications (type, message) VALUES ($1, $2)
          ON CONFLICT (type, message) DO NOTHING;`,
          ['customer_risk', message]
        );
      }

      // --- Regra 3: Vendas Diárias Abaixo da Meta (Exemplo Simples) ---
      // Supondo uma meta diária de R$ 500.00
      const dailySalesResult = await client.query(
        `SELECT SUM(total_amount) as total_sales FROM sales
        WHERE sale_date::date = CURRENT_DATE;`
      );
      const dailySales = parseFloat(dailySalesResult.rows[0]?.total_sales || 0);
      const dailyGoal = 500.00; // Meta de vendas diária

      if (dailySales < dailyGoal) {
        const message = `Vendas de hoje (R$ ${dailySales.toFixed(2)}) estão abaixo da meta diária (R$ ${dailyGoal.toFixed(2)}).`;
        await client.query(
          `INSERT INTO notifications (type, message) VALUES ($1, $2)
          ON CONFLICT (type, message) DO NOTHING;`,
          ['sales_goal', message]
        );
      }
      await client.query('COMMIT');

    } catch (error) {
      await client.query('ROLLBACK');
      throw error; // Re-throw para ser pego pelo catch externo
    } finally {
      client.release();
    }

    res.status(200).json({ message: 'Notificações geradas com sucesso.' });
  } catch (error) {
    console.error('Erro ao gerar notificações:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao gerar notificações.' });
  }
});

// Endpoint para listar notificações
router.get('/', async (req, res) => {
  try {
    const { limit: limitStr = '10', offset: offsetStr = '0', readStatus = 'all', userId } = req.query;
    const limit = parseInt(limitStr, 10);
    const offset = parseInt(offsetStr, 10);

    let query = 'SELECT * FROM notifications';
    const queryParams = [];
    const conditions = [];
    let paramIndex = 1;

    if (userId) {
      conditions.push(`user_id = $${paramIndex}`);
      queryParams.push(parseInt(userId, 10));
      paramIndex++;
    }

    if (readStatus !== 'all') {
      conditions.push(`read_status = $${paramIndex}`);
      queryParams.push(readStatus === 'read');
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    if (!isNaN(limit) && limit > 0) {
      query += ` LIMIT $${paramIndex}`;
      queryParams.push(limit);
      paramIndex++;
    }
    if (!isNaN(offset) && offset >= 0) {
      query += ` OFFSET $${paramIndex}`;
      queryParams.push(offset);
      paramIndex++;
    }

    

    const { rows: notifications } = await db.query(query, queryParams);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error.stack); // Loga o stack trace completo
    res.status(500).json({ error: 'Erro interno do servidor ao buscar notificações.' });
  }
});

// Endpoint para marcar notificação como lida
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      'UPDATE notifications SET read_status = TRUE WHERE id = $1',
      [id]
    );
    res.status(200).json({ message: 'Notificação marcada como lida.' });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao marcar notificação como lida.' });
  }
});

module.exports = router;
