const express = require('express');
const router = express.Router();
const db = require('../db');
const cors = require('cors'); // Importar cors

// GET /api/dashboard/summary
router.get('/summary', cors(), async (req, res) => {
  try {
    const { period = 'today' } = req.query; // Default para 'today'
    let startDate, endDate;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (period) {
      case 'today':
        startDate = today.toISOString();
        endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(); // End of today
        break;
      case 'week':
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        startDate = firstDayOfWeek.toISOString();
        endDate = new Date(firstDayOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1).toISOString();
        break;
      case 'month':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = firstDayOfMonth.toISOString();
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
        break;
      case 'year':
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        startDate = firstDayOfYear.toISOString();
        endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999).toISOString();
        break;
      default:
        // Se o período não for reconhecido, use o padrão de hoje
        startDate = today.toISOString();
        endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
        break;
    }

    let dateFilter = '';
    const queryParams = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE sale_date BETWEEN $1 AND $2';
      queryParams.push(startDate, endDate);
    }

    // Fetch KPIs
    const totalSalesQuery = db.query(`SELECT SUM(total_amount) as total_sales FROM sales ${dateFilter}`, [...queryParams]);
    const totalOrdersQuery = db.query(`SELECT COUNT(*) as total_orders FROM sales ${dateFilter}`, [...queryParams]);
    const totalCustomersQuery = db.query(`SELECT COUNT(DISTINCT customer_id) as total_customers FROM sales ${dateFilter} AND customer_id IS NOT NULL`, [...queryParams]);

    // Fetch recent activity (assuming an activity_log table)
    const recentActivityQuery = db.query(
      `SELECT id, user_name, description, timestamp FROM activity_log ORDER BY timestamp DESC LIMIT 10`
    );

    const [
      totalSalesResult,
      totalOrdersResult,
      totalCustomersResult,
      recentActivityResult,
    ] = await Promise.all([
      totalSalesQuery,
      totalOrdersQuery,
      totalCustomersQuery,
      recentActivityQuery,
    ]);

    res.json({
      kpis: {
        totalSales: parseFloat(totalSalesResult.rows[0].total_sales || 0),
        totalOrders: parseInt(totalOrdersResult.rows[0].total_orders || 0),
        totalCustomers: parseInt(totalCustomersResult.rows[0].total_customers || 0),
      },
      widgets: {
        recentActivity: recentActivityResult.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;