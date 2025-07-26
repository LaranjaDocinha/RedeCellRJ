const express = require('express');
const router = express.Router();
const db = require('../db');

// Função auxiliar para gerar a cláusula WHERE de data para período atual e anterior
const getPeriodDates = (period = 'today') => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();

    switch (period) {
        case 'today':
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            prevStartDate.setDate(now.getDate() - 1);
            prevStartDate.setHours(0, 0, 0, 0);
            prevEndDate.setDate(now.getDate() - 1);
            prevEndDate.setHours(23, 59, 59, 999);
            break;
        case '7d':
            startDate.setDate(now.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);
            prevStartDate.setDate(now.getDate() - 13);
            prevStartDate.setHours(0, 0, 0, 0);
            prevEndDate.setDate(now.getDate() - 7);
            prevEndDate.setHours(23, 59, 59, 999);
            break;
        case '30d':
            startDate.setDate(now.getDate() - 29);
            startDate.setHours(0, 0, 0, 0);
            prevStartDate.setDate(now.getDate() - 59);
            prevStartDate.setHours(0, 0, 0, 0);
            prevEndDate.setDate(now.getDate() - 30);
            prevEndDate.setHours(23, 59, 59, 999);
            break;
        case 'thisMonth':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            break;
    }
    return { startDate, endDate, prevStartDate, prevEndDate };
};

// Função para calcular a variação percentual
const calculatePercentageChange = (current, previous) => {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
};

// GET /api/dashboard/summary - Rota de resumo totalmente reformulada
router.get('/summary', async (req, res) => {
    const { period = 'today' } = req.query;
    const { startDate, endDate, prevStartDate, prevEndDate } = getPeriodDates(period);

    try {
        // --- Consultas para o Período ATUAL ---
        const kpiQuery = `
            SELECT
                COALESCE(SUM(s.total_amount), 0) as "revenue",
                COALESCE(SUM(s.total_amount - si.total_cost), 0) as "profit",
                COUNT(DISTINCT s.id) as "salesCount",
                COALESCE(SUM(s.total_amount) / NULLIF(COUNT(DISTINCT s.id), 0), 0) as "averageTicket"
            FROM sales s
            LEFT JOIN (
                SELECT 
                    si.sale_id, 
                    SUM(si.quantity * pv.cost_price) as total_cost
                FROM sale_items si
                JOIN product_variations pv ON si.variation_id = pv.id
                GROUP BY si.sale_id
            ) si ON s.id = si.sale_id
            WHERE s.sale_date BETWEEN $1 AND $2;
        `;

        const repairsQuery = `
            SELECT
                COUNT(*) as "newRepairsCount",
                COUNT(CASE WHEN r.status = 'Aguardando Peças' THEN 1 END) as "waitingForPartsCount"
            FROM repairs r
            WHERE r.created_at BETWEEN $1 AND $2;
        `;

        const customersQuery = `
            SELECT COUNT(*) as "newCustomersCount"
            FROM customers
            WHERE created_at BETWEEN $1 AND $2;
        `;

        // --- Consultas para o Período ANTERIOR (para comparação) ---
        const prevKpiQuery = `
            SELECT
                COALESCE(SUM(s.total_amount), 0) as "revenue",
                COALESCE(SUM(s.total_amount - si.total_cost), 0) as "profit",
                COUNT(DISTINCT s.id) as "salesCount"
            FROM sales s
            LEFT JOIN (
                SELECT si.sale_id, SUM(si.quantity * pv.cost_price) as total_cost
                FROM sale_items si JOIN product_variations pv ON si.variation_id = pv.id
                GROUP BY si.sale_id
            ) si ON s.id = si.sale_id
            WHERE s.sale_date BETWEEN $1 AND $2;
        `;

        // --- Consultas de Widgets (não dependem do período anterior) ---
        const paymentMethodsQuery = `
            SELECT payment_method, SUM(amount) as total
            FROM sale_payments sp
            JOIN sales s ON sp.sale_id = s.id
            WHERE s.sale_date BETWEEN $1 AND $2
            GROUP BY payment_method ORDER BY total DESC;
        `;

        const stockStatusQuery = `
            SELECT
                COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as "outOfStockCount",
                COUNT(CASE WHEN stock_quantity > 0 AND stock_quantity <= 5 THEN 1 END) as "lowStockCount"
            FROM product_variations;
        `;
        
        const activityFeedQuery = `
            (SELECT 'Venda' as type, s.id, u.name as user_name, s.total_amount::text as value, s.sale_date as date FROM sales s JOIN users u ON s.user_id = u.id ORDER BY s.sale_date DESC LIMIT 3)
            UNION ALL
            (SELECT 'Reparo' as type, r.id, c.name as user_name, r.status as value, r.updated_at as date FROM repairs r JOIN customers c ON r.customer_id = c.id ORDER BY r.updated_at DESC LIMIT 3)
            UNION ALL
            (SELECT 'Cliente' as type, c.id, c.name as user_name, '' as value, c.created_at as date FROM customers c ORDER BY c.created_at DESC LIMIT 2)
            ORDER BY date DESC LIMIT 8;
        `;

        const sellerRankingQuery = `
            SELECT u.name, SUM(s.total_amount) as total_revenue
            FROM sales s
            JOIN users u ON s.user_id = u.id
            WHERE s.sale_date BETWEEN $1 AND $2
            GROUP BY u.name ORDER BY total_revenue DESC LIMIT 5;
        `;

        const dailyRevenueAndProfitQuery = `
            SELECT
                DATE(s.sale_date) as date,
                SUM(s.total_amount) as revenue,
                SUM(s.total_amount - si.total_cost) as profit
            FROM sales s
            LEFT JOIN (
                SELECT 
                    si.sale_id, 
                    SUM(si.quantity * pv.cost_price) as total_cost
                FROM sale_items si
                JOIN product_variations pv ON si.variation_id = pv.id
                GROUP BY si.sale_id
            ) si ON s.id = si.sale_id
            WHERE s.sale_date BETWEEN $1 AND $2
            GROUP BY DATE(s.sale_date)
            ORDER BY date ASC;
        `;

        // Executando todas as consultas em paralelo
        const [
            kpiRes, prevKpiRes, repairsRes, customersRes,
            paymentMethodsRes, stockStatusRes, activityFeedRes, sellerRankingRes,
            dailyRevenueAndProfitRes
        ] = await Promise.all([
            db.query(kpiQuery, [startDate, endDate]),
            db.query(prevKpiQuery, [prevStartDate, prevEndDate]),
            db.query(repairsQuery, [startDate, endDate]),
            db.query(customersQuery, [startDate, endDate]),
            db.query(paymentMethodsQuery, [startDate, endDate]),
            db.query(stockStatusQuery),
            db.query(activityFeedQuery),
            db.query(sellerRankingQuery, [startDate, endDate]),
            db.query(dailyRevenueAndProfitQuery, [startDate, endDate])
        ]);

        const current = kpiRes.rows[0];
        const previous = prevKpiRes.rows[0] || { revenue: 0, profit: 0, salesCount: 0 };
        
        res.json({
            kpis: {
                revenue: {
                    value: parseFloat(current.revenue),
                    change: calculatePercentageChange(current.revenue, previous.revenue)
                },
                profit: {
                    value: parseFloat(current.profit),
                    change: calculatePercentageChange(current.profit, previous.profit)
                },
                salesCount: {
                    value: parseInt(current.salesCount),
                    change: calculatePercentageChange(current.salesCount, previous.salesCount)
                },
                averageTicket: {
                    value: parseFloat(current.averageTicket),
                    change: 0 // Comparação de ticket médio pode ser complexa, deixamos para depois
                },
                newRepairsCount: {
                    value: parseInt(repairsRes.rows[0].newRepairsCount),
                    change: 0
                },
                newCustomersCount: {
                    value: parseInt(customersRes.rows[0].newCustomersCount),
                    change: 0
                }
            },
            widgets: {
                paymentMethods: paymentMethodsRes.rows.map(r => ({...r, total: parseFloat(r.total)})),
                stockStatus: {
                    outOfStock: parseInt(stockStatusRes.rows[0].outOfStockCount),
                    lowStock: parseInt(stockStatusRes.rows[0].lowStockCount)
                },
                repairsWaitingForParts: parseInt(repairsRes.rows[0].waitingForPartsCount),
                activityFeed: activityFeedRes.rows,
                sellerRanking: sellerRankingRes.rows.map(r => ({...r, total_revenue: parseFloat(r.total_revenue)})),
                dailyRevenueAndProfit: dailyRevenueAndProfitRes.rows.map(r => ({
                    date: r.date,
                    revenue: parseFloat(r.revenue),
                    profit: parseFloat(r.profit)
                })),
                salesGoal: {
                    goal: 10000, // Meta de R$ 10.000 (hardcoded por enquanto)
                    current: parseFloat(current.revenue)
                }
            }
        });

    } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err.stack);
        res.status(500).send('Erro do Servidor');
    }
});


// Manter as rotas antigas por compatibilidade temporária, se necessário
router.get('/sales-over-time', async (req, res) => {
    const { period = '30d' } = req.query;
    const { startDate, endDate } = getPeriodDates(period);
    try {
        const query = `
            SELECT DATE(s.sale_date) as date, SUM(s.total_amount) as total_revenue, COUNT(s.id) as sales_count
            FROM sales s WHERE s.sale_date BETWEEN $1 AND $2
            GROUP BY DATE(s.sale_date) ORDER BY date ASC;
        `;
        const { rows } = await db.query(query, [startDate, endDate]);
        res.json(rows.map(r => ({...r, total_revenue: parseFloat(r.total_revenue)})));
    } catch (err) {
        console.error("Erro em /sales-over-time:", err.message);
        res.status(500).send('Erro do Servidor');
    }
});

router.get('/top-products', async (req, res) => {
    const { period = '30d' } = req.query;
    const { startDate, endDate } = getPeriodDates(period);
    try {
        const query = `
            SELECT p.name, pv.color, SUM(si.quantity) as quantity_sold, SUM(si.quantity * si.unit_price) as revenue_generated
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            JOIN product_variations pv ON si.variation_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE s.sale_date BETWEEN $1 AND $2
            GROUP BY p.name, pv.color ORDER BY revenue_generated DESC LIMIT 10;
        `;
        const { rows } = await db.query(query, [startDate, endDate]);
        res.json(rows.map(r => ({...r, revenue_generated: parseFloat(r.revenue_generated)})));
    } catch (err) {
        console.error("Erro em /top-products:", err.message);
        res.status(500).send('Erro do Servidor');
    }
});

router.get('/sales-by-user', async (req, res) => {
    const { period = '30d' } = req.query;
    const { startDate, endDate } = getPeriodDates(period);
    try {
        const query = `
            SELECT u.name as user_name, COUNT(s.id) as sales_count, SUM(s.total_amount) as total_revenue
            FROM sales s JOIN users u ON s.user_id = u.id
            WHERE s.sale_date BETWEEN $1 AND $2
            GROUP BY u.name ORDER BY total_revenue DESC;
        `;
        const { rows } = await db.query(query, [startDate, endDate]);
        res.json(rows.map(r => ({...r, total_revenue: parseFloat(r.total_revenue)})));
    } catch (err) {
        console.error("Erro em /sales-by-user:", err.message);
        res.status(500).send('Erro do Servidor');
    }
});

module.exports = router;

