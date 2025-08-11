const db = require('../db');

exports.getDashboardData = async (req, res) => {
  try {
    // Exemplo: Contagem de reparos por status
    const repairsByStatus = await db.query(
      'SELECT status, COUNT(*) FROM repairs GROUP BY status'
    );

    // Exemplo: Total de vendas no mês atual
    const salesThisMonth = await db.query(
      'SELECT SUM(total_amount) FROM sales WHERE EXTRACT(MONTH FROM sale_date) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM sale_date) = EXTRACT(YEAR FROM CURRENT_DATE)'
    );

    res.json({
      repairsByStatus: repairsByStatus.rows,
      salesThisMonth: salesThisMonth.rows[0].sum || 0,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.getDashboardSummary = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const totalSales = await db.query(
      'SELECT SUM(total_amount) FROM sales WHERE sale_date BETWEEN $1 AND $2',
      [startDate, endDate]
    );

    const totalProductsSold = await db.query(
      'SELECT SUM(quantity) FROM sale_items JOIN sales ON sale_items.sale_id = sales.id WHERE sales.sale_date BETWEEN $1 AND $2',
      [startDate, endDate]
    );

    const totalCustomers = await db.query(
      'SELECT COUNT(DISTINCT customer_id) FROM sales WHERE sale_date BETWEEN $1 AND $2',
      [startDate, endDate]
    );

    res.json({
      totalSales: totalSales.rows[0].sum || 0,
      totalProductsSold: totalProductsSold.rows[0].sum || 0,
      totalCustomers: totalCustomers.rows[0].count || 0,
    });
  } catch (error) {
    console.error('Erro ao buscar resumo do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter visão geral de vendas por período (para gráficos)
exports.getSalesOverview = async (req, res) => {
  const { startDate, endDate, interval } = req.query; // interval: 'day', 'week', 'month'

  if (!startDate || !endDate || !interval) {
    return res.status(400).json({ message: 'Datas de início, fim e intervalo são obrigatórios.' });
  }

  let dateTruncFunction = '';
  if (interval === 'day') {
    dateTruncFunction = 'DATE_TRUNC(\'day\', sale_date)';
  } else if (interval === 'week') {
    dateTruncFunction = 'DATE_TRUNC(\'week\', sale_date)';
  } else if (interval === 'month') {
    dateTruncFunction = 'DATE_TRUNC(\'month\', sale_date)';
  } else {
    return res.status(400).json({ message: 'Intervalo inválido. Use \'day\', \'week\' ou \'month\'.' });
  }

  try {
    const query = `
      SELECT
        ${dateTruncFunction} as period,
        SUM(total_amount) as total_sales
      FROM sales
      WHERE sale_date BETWEEN $1 AND $2
      GROUP BY period
      ORDER BY period ASC;
    `;
    const { rows } = await db.query(query, [startDate, endDate]);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar visão geral de vendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
