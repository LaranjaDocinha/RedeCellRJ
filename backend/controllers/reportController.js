const db = require('../db');

// @desc    Gerar relatório de vendas
// @route   GET /api/reports/sales
// @access  Private
const getSalesReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const query = `
      SELECT
        s.id as sale_id,
        s.sale_date,
        s.total_amount,
        s.payment_method,
        u.name as user_name,
        c.name as customer_name,
        si.product_name,
        si.quantity,
        si.price_at_sale,
        si.cost_at_sale
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN customers c ON s.customer_id = c.id
      JOIN sale_items si ON s.id = si.sale_id
      WHERE s.sale_date BETWEEN $1 AND $2
      ORDER BY s.sale_date DESC;
    `;
    const { rows } = await db.query(query, [startDate, endDate]);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar relatório de estoque
// @route   GET /api/reports/inventory
// @access  Private
const getInventoryReport = async (req, res) => {
  try {
    const query = `
      SELECT
        p.name as product_name,
        pv.barcode,
        pv.stock_quantity,
        pv.min_stock_level,
        pv.price,
        pv.cost,
        c.name as category_name,
        s.name as supplier_name
      FROM products p
      JOIN product_variations pv ON p.id = pv.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.name ASC;
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de estoque:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar relatório de lucratividade
// @route   GET /api/reports/profitability
// @access  Private
const getProfitabilityReport = async (req, res) => {
  const { startDate, endDate, productId, categoryId } = req.query;
  try {
    let query = `
      SELECT
        si.product_id,
        si.product_name,
        SUM(si.quantity) as total_quantity_sold,
        SUM(si.quantity * si.price_at_sale) as total_revenue,
        SUM(si.quantity * si.cost_at_sale) as total_cost,
        (SUM(si.quantity * si.price_at_sale) - SUM(si.quantity * si.cost_at_sale)) as gross_profit
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.sale_date BETWEEN $1 AND $2
    `;
    const queryParams = [startDate, endDate];
    let paramIndex = 3;

    if (productId) {
      query += ` AND si.product_id = ${paramIndex++}`;
      queryParams.push(productId);
    }
    if (categoryId) {
      query += ` AND si.category_id = ${paramIndex++}`;
      queryParams.push(categoryId);
    }

    query += ` GROUP BY si.product_id, si.product_name ORDER BY gross_profit DESC;`;

    const { rows } = await db.query(query, queryParams);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de lucratividade:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar exportação contábil (CSV)
// @route   GET /api/reports/accounting-export
// @access  Private
const getAccountingExport = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    // Exemplo: Exportar vendas e despesas
    const sales = await db.query(
      `SELECT sale_date as date, total_amount as amount, 'Receita' as type, payment_method as details FROM sales WHERE sale_date BETWEEN $1 AND $2 ORDER BY sale_date ASC;`,
      [startDate, endDate]
    );
    const expenses = await db.query(
      `SELECT expense_date as date, amount, 'Despesa' as type, category as details FROM expenses WHERE expense_date BETWEEN $1 AND $2 ORDER BY expense_date ASC;`,
      [startDate, endDate]
    );

    const allTransactions = [...sales.rows, ...expenses.rows];

    // Ordenar por data
    allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    const fields = [
      { label: 'Data', value: 'date' },
      { label: 'Tipo', value: 'type' },
      { label: 'Valor', value: 'amount' },
      { label: 'Detalhes', value: 'details' },
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(allTransactions);

    res.header('Content-Type', 'text/csv');
    res.attachment('accounting_export.csv');
    res.send(csv);

  } catch (error) {
    console.error('Erro ao gerar exportação contábil:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar relatório de vendas por categoria
// @route   GET /api/reports/sales-by-category
// @access  Private
const getSalesByCategoryReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const query = `
      SELECT
        c.name as category_name,
        SUM(si.quantity * si.unit_price) as total_sales_amount
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE s.sale_date BETWEEN $1 AND $2
      GROUP BY c.name
      ORDER BY total_sales_amount DESC;
    `;
    const { rows } = await db.query(query, [startDate, endDate]);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas por categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar relatório de produtos com estoque baixo
// @route   GET /api/reports/low-stock-products
// @access  Private
const getLowStockProductsReport = async (req, res) => {
  try {
    const query = `
      SELECT
        p.name as product_name,
        pv.barcode,
        pv.stock_quantity,
        pv.min_stock_level,
        c.name as category_name,
        s.name as supplier_name
      FROM products p
      JOIN product_variations pv ON p.id = pv.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE pv.stock_quantity <= pv.min_stock_level
      ORDER BY pv.stock_quantity ASC;
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de produtos com estoque baixo:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar relatório de desempenho por técnico
// @route   GET /api/reports/technician-performance
// @access  Private
const getTechnicianPerformanceReport = async (req, res) => {
  const { technicianId, startDate, endDate } = req.query;

  if (!technicianId || !startDate || !endDate) {
    return res.status(400).json({ message: 'ID do técnico, data de início e data de fim são obrigatórios.' });
  }

  try {
    const repairsQuery = `
      SELECT
        r.id,
        r.status,
        r.created_at,
        r.final_cost,
        r.problem_description,
        r.repair_actions,
        r.expected_completion_date,
        r.actual_completion_date,
        c.name as customer_name
      FROM repairs r
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE r.technician_id = $1
        AND r.created_at BETWEEN $2 AND $3
      ORDER BY r.created_at DESC;
    `;
    const { rows: repairs } = await db.query(repairsQuery, [technicianId, startDate, endDate]);

    const completedRepairs = repairs.filter(r => r.status === 'Finalizado' || r.status === 'Entregue');
    const totalRevenue = repairs.reduce((sum, r) => sum + parseFloat(r.final_cost || 0), 0);

    // Calculate average repair time for completed repairs
    let totalRepairTimeDays = 0;
    let repairsWithCompletionDates = 0;
    completedRepairs.forEach(r => {
      if (r.created_at && r.actual_completion_date) {
        const start = new Date(r.created_at);
        const end = new Date(r.actual_completion_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalRepairTimeDays += diffDays;
        repairsWithCompletionDates++;
      }
    });
    const averageRepairTime = repairsWithCompletionDates > 0 ? (totalRepairTimeDays / repairsWithCompletionDates).toFixed(2) : 0;

    // Count repairs by status
    const repairsByStatus = repairs.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      technician_id: technicianId,
      period: `${startDate} to ${endDate}`,
      total_repairs: repairs.length,
      completed_repairs: completedRepairs.length,
      total_revenue_from_repairs: parseFloat(totalRevenue.toFixed(2)),
      average_repair_time_days: parseFloat(averageRepairTime),
      repairs_by_status: repairsByStatus,
      details: repairs,
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de desempenho por técnico:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar análise ABC de produtos
// @route   GET /api/reports/abc-products
// @access  Private
const getAbcProductAnalysis = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Datas de início e fim são obrigatórias.' });
  }

  try {
    const query = `
      SELECT
        p.id as product_id,
        p.name as product_name,
        SUM(si.quantity * si.price_at_sale) as total_revenue
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN product_variations pv ON si.product_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE s.sale_date BETWEEN $1 AND $2
      GROUP BY p.id, p.name
      ORDER BY total_revenue DESC;
    `;
    const { rows } = await db.query(query, [startDate, endDate]);

    let cumulativeRevenue = 0;
    const totalOverallRevenue = rows.reduce((sum, row) => sum + parseFloat(row.total_revenue), 0);

    const abcAnalysis = rows.map(row => {
      cumulativeRevenue += parseFloat(row.total_revenue);
      const cumulativePercentage = (cumulativeRevenue / totalOverallRevenue) * 100;
      let category = 'C';
      if (cumulativePercentage <= 80) {
        category = 'A';
      } else if (cumulativePercentage <= 95) {
        category = 'B';
      }
      return { ...row, cumulative_revenue: parseFloat(cumulativeRevenue.toFixed(2)), cumulative_percentage: parseFloat(cumulativePercentage.toFixed(2)), category };
    });

    res.json(abcAnalysis);
  } catch (error) {
    console.error('Erro ao gerar análise ABC de produtos:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Gerar análise ABC de clientes
// @route   GET /api/reports/abc-customers
// @access  Private
const getAbcCustomerAnalysis = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Datas de início e fim são obrigatórias.' });
  }

  try {
    const query = `
      SELECT
        c.id as customer_id,
        c.name as customer_name,
        SUM(s.total_amount) as total_purchase_amount
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      WHERE s.sale_date BETWEEN $1 AND $2
      GROUP BY c.id, c.name
      ORDER BY total_purchase_amount DESC;
    `;
    const { rows } = await db.query(query, [startDate, endDate]);

    let cumulativePurchaseAmount = 0;
    const totalOverallPurchaseAmount = rows.reduce((sum, row) => sum + parseFloat(row.total_purchase_amount), 0);

    const abcAnalysis = rows.map(row => {
      cumulativePurchaseAmount += parseFloat(row.total_purchase_amount);
      const cumulativePercentage = (cumulativePurchaseAmount / totalOverallPurchaseAmount) * 100;
      let category = 'C';
      if (cumulativePercentage <= 80) {
        category = 'A';
      } else if (cumulativePercentage <= 95) {
        category = 'B';
      }
      return { ...row, cumulative_purchase_amount: parseFloat(cumulativePurchaseAmount.toFixed(2)), cumulative_percentage: parseFloat(cumulativePercentage.toFixed(2)), category };
    });

    res.json(abcAnalysis);
  } catch (error) {
    console.error('Erro ao gerar análise ABC de clientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

module.exports = {
  getSalesReport,
  getInventoryReport,
  getProfitabilityReport,
  getAccountingExport,
  getSalesByCategoryReport,
  getLowStockProductsReport,
  getTechnicianPerformanceReport,
  getAbcProductAnalysis,
  getAbcCustomerAnalysis,
};