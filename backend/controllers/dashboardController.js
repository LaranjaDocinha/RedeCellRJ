const db = require('../db');

const getDashboardData = async (req, res) => {
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

const getDashboardSummary = async (req, res) => {
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
const getSalesOverview = async (req, res) => {
  const { startDate, endDate, interval } = req.query; // interval: 'day', 'week', 'month'

  if (!startDate || !endDate || !interval) {
    return res.status(400).json({ message: 'Datas de início, fim e intervalo são obrigatórios.' });
  }

  let dateTruncFunction = '';
  if (interval === 'day') {
    dateTruncFunction = "DATE_TRUNC('day', sale_date)";
  } else if (interval === 'week') {
    dateTruncFunction = "DATE_TRUNC('week', sale_date)";
  } else if (interval === 'month') {
    dateTruncFunction = "DATE_TRUNC('month', sale_date)";
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

// @desc    Obter os produtos mais vendidos por quantidade ou receita
// @route   GET /api/dashboard/top-products
// @access  Private
const getTopProducts = async (req, res) => {
  const { limit = 5, orderBy = 'quantity', startDate, endDate } = req.query; // orderBy: 'quantity' or 'revenue'
  let orderByClause = '';
  if (orderBy === 'quantity') {
    orderByClause = 'SUM(si.quantity)';
  } else if (orderBy === 'revenue') {
    orderByClause = 'SUM(si.quantity * si.price_at_sale)';
  } else {
    return res.status(400).json({ message: 'Parâmetro orderBy inválido. Use \'quantity\' ou \'revenue\'.' });
  }


  try {
    const query = `
      SELECT
        p.name as product_name,
        SUM(si.quantity) as total_quantity_sold,
        SUM(si.quantity * si.price_at_sale) as total_revenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN product_variations pv ON si.product_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE s.sale_date BETWEEN $1 AND $2
      GROUP BY p.name
      ORDER BY ${orderByClause} DESC
      LIMIT $3;
    `;
    const { rows } = await db.query(query, [startDate, endDate, limit]);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar produtos mais vendidos:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Obter vendas por categoria
// @route   GET /api/dashboard/sales-by-category
// @access  Private
const getSalesByCategory = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const query = `
      SELECT
        c.name as category_name,
        SUM(si.quantity * si.price_at_sale) as total_sales_amount
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN product_variations pv ON si.product_id = pv.id
      JOIN products p ON pv.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE s.sale_date BETWEEN $1 AND $2
      GROUP BY c.name
      ORDER BY total_sales_amount DESC;
    `;
    const { rows } = await db.query(query, [startDate, endDate]);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar vendas por categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Obter tendências de vendas ao longo do tempo (diário, semanal, mensal)
// @route   GET /api/dashboard/sales-trends
// @access  Private
const getSalesTrends = async (req, res) => {
  const { startDate, endDate, interval = 'month' } = req.query; // interval: 'day', 'week', 'month', 'year'

  let dateTruncFunction = '';
  if (interval === 'day') {
    dateTruncFunction = "DATE_TRUNC('day', sale_date)";
  } else if (interval === 'week') {
    dateTruncFunction = "DATE_TRUNC('week', sale_date)";
  } else if (interval === 'month') {
    dateTruncFunction = "DATE_TRUNC('month', sale_date)";
  } else if (interval === 'year') {
    dateTruncFunction = "DATE_TRUNC('year', sale_date)";
  } else {
    return res.status(400).json({ message: 'Intervalo inválido. Use \'day\', \'week\', \'month\' ou \'year\'.' });
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
    console.error('Erro ao buscar tendências de vendas:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

module.exports = {
  getDashboardData,
  getDashboardSummary,
  getSalesOverview,
  getTopProducts,
  getSalesByCategory,
  getSalesTrends,
};