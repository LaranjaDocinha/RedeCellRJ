const pool = require('../db');
const { AppError } = require('../utils/appError');

// @desc    Obter dados consolidados para o dashboard financeiro
// @route   GET /api/finance/dashboard
// @access  Private
exports.getDashboardData = async (req, res, next) => {
  const { startDate, endDate } = req.query;

  // Validação básica de datas
  if (!startDate || !endDate) {
    return next(new AppError('As datas de início e fim são obrigatórias.', 400));
  }

  try {
    const queryParams = [startDate, endDate];

    // 1. KPIs
    const kpiQueries = [
      pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM sales WHERE sale_date BETWEEN $1 AND $2', queryParams),
      pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE expense_date BETWEEN $1 AND $2', queryParams),
    ];

    // 2. Gráficos
    const chartQueries = [
      pool.query('SELECT payment_method, SUM(amount) as amount FROM sale_payments sp JOIN sales s ON sp.sale_id = s.id WHERE s.sale_date BETWEEN $1 AND $2 GROUP BY payment_method ORDER BY amount DESC', queryParams),
      pool.query('SELECT category, SUM(amount) as amount FROM expenses WHERE expense_date BETWEEN $1 AND $2 AND category IS NOT NULL GROUP BY category ORDER BY amount DESC', queryParams),
    ];

    const [kpiResults, chartResults] = await Promise.all([
      Promise.all(kpiQueries),
      Promise.all(chartQueries)
    ]);

    const totalSales = parseFloat(kpiResults[0].rows[0].total);
    const totalExpenses = parseFloat(kpiResults[1].rows[0].total);
    const grossProfit = totalSales - totalExpenses;

    const response = {
      kpis: {
        totalSales,
        totalExpenses,
        grossProfit,
      },
      charts: {
        salesByPaymentMethod: chartResults[0].rows,
        expensesByCategory: chartResults[1].rows,
      },
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard financeiro:', error);
    next(new AppError('Erro ao buscar dados do dashboard financeiro.', 500));
  }
};