const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware'); // Importação corrigida

const getStartDate = (period) => {
    let startDate;
    switch (period) {
        case 'today':
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'last7days':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'last30days':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'thisMonth':
            startDate = new Date();
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'thisYear':
            startDate = new Date();
            startDate.setMonth(0);
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            break;
        default:
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
    }
    return startDate;
};

// GET /api/reports/sales
router.get('/sales', authenticateToken, async (req, res) => { // Uso corrigido
  const { period } = req.query;
  const startDate = getStartDate(period);

  try {
    const summaryQuery = `
      SELECT
        COALESCE(SUM(total_amount), 0) AS "totalRevenue",
        COUNT(DISTINCT s.id) AS "totalSales",
        COALESCE(AVG(total_amount), 0) AS "averageTicket",
        COALESCE(SUM(quantity), 0) AS "totalProductsSold"
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      WHERE s.sale_date >= $1;
    `;
    const summaryResult = await db.query(summaryQuery, [startDate]);

    const salesOverTimeQuery = `
      SELECT
        DATE(sale_date) AS date,
        SUM(total_amount) AS total_revenue
      FROM sales
      WHERE sale_date >= $1
      GROUP BY DATE(sale_date)
      ORDER BY DATE(sale_date) ASC;
    `;
    const salesOverTimeResult = await db.query(salesOverTimeQuery, [startDate]);

    const salesDetailQuery = `
      SELECT
        s.id AS sale_id,
        s.sale_date,
        c.name AS customer_name,
        s.total_amount,
        (SELECT SUM(quantity) FROM sale_items WHERE sale_id = s.id) as total_items,
        pm.name AS payment_method
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.customer_id
      LEFT JOIN payment_methods pm ON s.payment_method_id = pm.payment_method_id
      WHERE s.sale_date >= $1
      ORDER BY s.sale_date DESC;
    `;
    const salesDetailResult = await db.query(salesDetailQuery, [startDate]);

    res.json({
      summary: summaryResult.rows[0],
      salesOverTime: salesOverTimeResult.rows,
      sales: salesDetailResult.rows,
    });

  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({ message: 'Error fetching sales report' });
  }
});

// GET /api/reports/profitability
router.get('/profitability', authenticateToken, async (req, res) => { // Uso corrigido
    const { period } = req.query;
    const startDate = getStartDate(period);

    try {
        const profitabilityQuery = `
            WITH sales_data AS (
                SELECT
                    p.id AS product_id,
                    p.name,
                    pv.cost_price,
                    si.quantity,
                    si.unit_price,
                    s.sale_date
                FROM sale_items si
                JOIN sales s ON si.sale_id = s.id
                JOIN product_variations pv ON si.variation_id = pv.id
                JOIN products p ON pv.product_id = p.id
                WHERE s.sale_date >= $1
            )
            SELECT
                product_id,
                name,
                SUM(quantity) AS units_sold,
                SUM(quantity * unit_price) AS total_revenue,
                SUM(quantity * cost_price) AS total_cost,
                SUM(quantity * unit_price) - SUM(quantity * cost_price) AS total_profit,
                CASE
                    WHEN SUM(quantity * unit_price) = 0 THEN 0
                    ELSE (SUM(quantity * unit_price) - SUM(quantity * cost_price)) / SUM(quantity * unit_price) * 100
                END AS profit_margin
            FROM sales_data
            GROUP BY product_id, name
            ORDER BY total_profit DESC;
        `;
        const productsResult = await db.query(profitabilityQuery, [startDate]);

        const summary = productsResult.rows.reduce((acc, row) => {
            acc.totalRevenue += parseFloat(row.total_revenue);
            acc.totalCost += parseFloat(row.total_cost);
            return acc;
        }, { totalRevenue: 0, totalCost: 0 });

        summary.grossProfit = summary.totalRevenue - summary.totalCost;
        summary.profitMargin = summary.totalRevenue > 0 ? (summary.grossProfit / summary.totalRevenue) * 100 : 0;

        const profitOverTimeQuery = `
            SELECT
                DATE(s.sale_date) AS date,
                SUM(si.quantity * si.unit_price) AS total_revenue,
                SUM(si.quantity * pv.cost_price) AS total_cost
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            JOIN product_variations pv ON si.variation_id = pv.id
            WHERE s.sale_date >= $1
            GROUP BY DATE(s.sale_date)
            ORDER BY date ASC;
        `;
        const profitOverTimeResult = await db.query(profitOverTimeQuery, [startDate]);

        res.json({
            summary,
            products: productsResult.rows,
            profitOverTime: profitOverTimeResult.rows
        });

    } catch (error) {
        console.error('Error fetching profitability report:', error);
        res.status(500).json({ message: 'Error fetching profitability report' });
    }
});

// GET /api/reports/customers
router.get('/customers', authenticateToken, async (req, res) => { // Uso corrigido
    const { period } = req.query;
    const startDate = getStartDate(period);

    try {
        const topCustomersQuery = `
            SELECT
                c.customer_id,
                c.name,
                c.email,
                c.phone,
                SUM(s.total_amount) as total_spent,
                COUNT(s.id) as total_purchases,
                MAX(s.sale_date) as last_purchase_date
            FROM customers c
            JOIN sales s ON c.customer_id = s.customer_id
            WHERE s.sale_date >= $1
            GROUP BY c.customer_id, c.name, c.email, c.phone
            ORDER BY total_spent DESC;
        `;
        const topCustomersResult = await db.query(topCustomersQuery, [startDate]);

        const summaryQuery = `
            SELECT
                COUNT(DISTINCT c.customer_id) AS "activeCustomers",
                (SELECT COUNT(*) FROM customers WHERE created_at >= $1) AS "newCustomers",
                AVG(customer_totals.total_spent) AS "averageSpentPerCustomer",
                AVG(customer_totals.total_purchases) AS "averagePurchasesPerCustomer"
            FROM customers c
            JOIN sales s ON c.customer_id = s.customer_id
            CROSS JOIN (
                SELECT
                    SUM(s_inner.total_amount) as total_spent,
                    COUNT(s_inner.id) as total_purchases
                FROM sales s_inner
                WHERE s_inner.sale_date >= $1 AND s_inner.customer_id IS NOT NULL
                GROUP BY s_inner.customer_id
            ) as customer_totals
            WHERE s.sale_date >= $1;
        `;
        const summaryResult = await db.query(summaryQuery, [startDate]);

        res.json({
            summary: summaryResult.rows[0],
            topCustomers: topCustomersResult.rows
        });

    } catch (error) {
        console.error('Error fetching customer report:', error);
        res.status(500).json({ message: 'Error fetching customer report' });
    }
});

// GET /api/reports/sales-by-category
router.get('/sales-by-category', authenticateToken, async (req, res) => {
    const { period } = req.query;
    const startDate = getStartDate(period);

    try {
        const query = `
            SELECT
                c.name AS category_name,
                SUM(si.quantity * si.unit_price) AS total_sales
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            JOIN product_variations pv ON si.variation_id = pv.id
            JOIN products p ON pv.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE s.sale_date >= $1
            GROUP BY c.name
            ORDER BY total_sales DESC;
        `;
        const result = await db.query(query, [startDate]);
        res.json(result.rows.map(row => ({ name: row.category_name, value: parseFloat(row.total_sales) })));
    } catch (error) {
        console.error('Error fetching sales by category report:', error);
        res.status(500).json({ message: 'Error fetching sales by category report' });
    }
});

// GET /api/reports/low-stock-products
router.get('/low-stock-products', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT
                p.id AS id,
                p.name,
                pv.stock_quantity AS stock,
                pv.color
            FROM products p
            JOIN product_variations pv ON p.id = pv.product_id
            WHERE pv.stock_quantity <= pv.alert_threshold
            ORDER BY pv.stock_quantity ASC;
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching low stock products report:', error);
        res.status(500).json({ message: 'Error fetching low stock products report' });
    }
});

module.exports = router;