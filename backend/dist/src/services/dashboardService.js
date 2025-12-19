import pool from '../db/index.js';
// Função auxiliar para construir a cláusula WHERE baseada em um *único* conjunto de parâmetros de período e filtros
function buildWhereClauseForPeriod(currentPeriod, currentStartDate, currentEndDate, filters, tableAlias = 's') {
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    // Condição para período
    if (currentPeriod && currentPeriod !== 'custom') {
        switch (currentPeriod) {
            case 'today':
                conditions.push(`${tableAlias}.sale_date = CURRENT_DATE`);
                break;
            case 'last7days':
                conditions.push(`${tableAlias}.sale_date >= CURRENT_DATE - INTERVAL '7 days'`);
                break;
            case 'last30days':
                conditions.push(`${tableAlias}.sale_date >= CURRENT_DATE - INTERVAL '30 days'`);
                break;
            case 'thisMonth':
                conditions.push(`EXTRACT(MONTH FROM ${tableAlias}.sale_date) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM ${tableAlias}.sale_date) = EXTRACT(YEAR FROM CURRENT_DATE)`);
                break;
            case 'lastMonth':
                conditions.push(`EXTRACT(MONTH FROM ${tableAlias}.sale_date) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month') AND EXTRACT(YEAR FROM ${tableAlias}.sale_date) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')`);
                break;
            case 'thisYear':
                conditions.push(`EXTRACT(YEAR FROM ${tableAlias}.sale_date) = EXTRACT(YEAR FROM CURRENT_DATE)`);
                break;
            // Para o caso de comparePeriod = 'previousYear' e o período principal ser 'thisMonth' ou 'thisYear'
            case 'lastYear': // Usado internamente por calculateComparisonPeriod
                conditions.push(`EXTRACT(YEAR FROM ${tableAlias}.sale_date) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 year')`);
                break;
            case 'twoMonthsAgo': // Usado internamente por calculateComparisonPeriod
                conditions.push(`EXTRACT(MONTH FROM ${tableAlias}.sale_date) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '2 months') AND EXTRACT(YEAR FROM ${tableAlias}.sale_date) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '2 months')`);
                break;
            case 'yesterday': // Usado internamente por calculateComparisonPeriod
                conditions.push(`${tableAlias}.sale_date = CURRENT_DATE - INTERVAL '1 day'`);
                break;
            case 'previous7days': // Usado internamente por calculateComparisonPeriod
                conditions.push(`${tableAlias}.sale_date BETWEEN CURRENT_DATE - INTERVAL '14 days' AND CURRENT_DATE - INTERVAL '8 days'`);
                break;
            case 'previous30days': // Usado internamente por calculateComparisonPeriod
                conditions.push(`${tableAlias}.sale_date BETWEEN CURRENT_DATE - INTERVAL '60 days' AND CURRENT_DATE - INTERVAL '31 days'`);
                break;
        }
    }
    else if (currentPeriod === 'custom' && currentStartDate && currentEndDate) {
        conditions.push(`${tableAlias}.sale_date BETWEEN $${paramIndex++} AND $${paramIndex++}`);
        params.push(currentStartDate, currentEndDate);
    }
    // Condição para vendedor
    if (filters.salesperson && filters.salesperson !== 'Todos') {
        conditions.push(`${tableAlias}.user_id = $${paramIndex++}`);
        params.push(filters.salesperson);
    }
    // Condição para produto
    if (filters.product && filters.product !== 'Todos') {
        conditions.push(`EXISTS (SELECT 1 FROM sale_items si JOIN product_variations pv ON si.variation_id = pv.id WHERE si.sale_id = ${tableAlias}.id AND pv.product_id = $${paramIndex++})`);
        params.push(filters.product);
    }
    // Condição para região (assumindo que a região está ligada ao cliente da venda)
    if (filters.region && filters.region !== 'Todas') {
        conditions.push(`EXISTS (SELECT 1 FROM customers c WHERE c.id = ${tableAlias}.customer_id AND c.region = $${paramIndex++})`);
        params.push(filters.region);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params };
}
// Função auxiliar para calcular o período de comparação
// **NOTA:** Esta é uma implementação simplificada. Em um ambiente de produção, seria crucial
// usar uma biblioteca de manipulação de datas robusta (ex: moment.js ou date-fns no backend)
// para garantir cálculos precisos e lidar com fusos horários e peculiaridades de datas.
function calculateComparisonPeriod(period, startDate, endDate, comparePeriod) {
    let compPeriod = { period: '', startDate: undefined, endDate: undefined };
    if (!comparePeriod || comparePeriod === 'Nenhum')
        return compPeriod;
    // Mock de Moment.js para demonstrar a lógica de cálculo
    // Em produção, você instalaria 'moment' ou 'date-fns' e faria o seguinte:
    const moment = (date) => {
        const d = date ? new Date(date) : new Date();
        return {
            format: (fmt) => {
                const year = d.getFullYear();
                const month = (d.getMonth() + 1).toString().padStart(2, '0');
                const day = d.getDate().toString().padStart(2, '0');
                if (fmt === 'YYYY-MM-DD')
                    return `${year}-${month}-${day}`;
                return ''; // Simplificado
            },
            subtract: (amount, unit) => {
                if (unit === 'days')
                    d.setDate(d.getDate() - amount);
                if (unit === 'months')
                    d.setMonth(d.getMonth() - amount);
                if (unit === 'years')
                    d.setFullYear(d.getFullYear() - amount);
                return moment(d.toISOString().split('T')[0]); // Retorna novo momento mock
            },
            add: (amount, unit) => {
                if (unit === 'days')
                    d.setDate(d.getDate() + amount);
                if (unit === 'months')
                    d.setMonth(d.getMonth() + amount);
                if (unit === 'years')
                    d.setFullYear(d.getFullYear() + amount);
                return moment(d.toISOString().split('T')[0]); // Retorna novo momento mock
            },
            diff: (otherMoment, unit) => {
                // Apenas um mock para a diferença em dias
                const diffTime = Math.abs(d.getTime() - new Date(otherMoment.format('YYYY-MM-DD')).getTime());
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
        };
    };
    const getStartOfMonth = (m) => moment(`${m.format('YYYY-MM')}-01`);
    const getEndOfMonth = (m) => moment(getStartOfMonth(m).add(1, 'month').subtract(1, 'day').format('YYYY-MM-DD'));
    const getStartOfYear = (m) => moment(`${m.format('YYYY')}-01-01`);
    const getEndOfYear = (m) => moment(`${m.format('YYYY')}-12-31`);
    if (period === 'custom' && startDate && endDate) {
        const startMoment = moment(startDate);
        const endMoment = moment(endDate);
        const diffDays = endMoment.diff(startMoment, 'days'); // Diferença em dias
        if (comparePeriod === 'previousPeriod') {
            compPeriod.startDate = startMoment.subtract(diffDays + 1, 'days').format('YYYY-MM-DD');
            compPeriod.endDate = startMoment.subtract(1, 'day').format('YYYY-MM-DD');
        }
        else if (comparePeriod === 'previousYear') {
            compPeriod.startDate = startMoment.subtract(1, 'year').format('YYYY-MM-DD');
            compPeriod.endDate = endMoment.subtract(1, 'year').format('YYYY-MM-DD');
        }
        compPeriod.period = 'custom';
    }
    else {
        const today = moment();
        switch (period) {
            case 'today':
                compPeriod.period = (comparePeriod === 'previousPeriod') ? 'yesterday' : 'today'; // 'today' se 'previousYear'
                if (comparePeriod === 'previousYear') {
                    const yearAgo = today.subtract(1, 'year');
                    compPeriod.startDate = yearAgo.format('YYYY-MM-DD');
                    compPeriod.endDate = yearAgo.format('YYYY-MM-DD');
                    compPeriod.period = 'custom'; // Tratar como custom para datas exatas
                }
                else if (comparePeriod === 'previousPeriod') {
                    const yesterday = today.subtract(1, 'day');
                    compPeriod.startDate = yesterday.format('YYYY-MM-DD');
                    compPeriod.endDate = yesterday.format('YYYY-MM-DD');
                    compPeriod.period = 'custom';
                }
                break;
            case 'last7days':
                if (comparePeriod === 'previousPeriod') { // Últimos 7 dias antes do período selecionado
                    compPeriod.startDate = today.subtract(14, 'days').add(1, 'day').format('YYYY-MM-DD');
                    compPeriod.endDate = today.subtract(7, 'days').format('YYYY-MM-DD');
                    compPeriod.period = 'custom';
                }
                else if (comparePeriod === 'previousYear') {
                    const yearAgo = today.subtract(1, 'year');
                    compPeriod.startDate = yearAgo.subtract(6, 'days').format('YYYY-MM-DD'); // 7 dias atrás do ano passado
                    compPeriod.endDate = yearAgo.format('YYYY-MM-DD');
                    compPeriod.period = 'custom';
                }
                break;
            case 'last30days':
                if (comparePeriod === 'previousPeriod') { // Últimos 30 dias antes do período selecionado
                    compPeriod.startDate = today.subtract(60, 'days').add(1, 'day').format('YYYY-MM-DD');
                    compPeriod.endDate = today.subtract(30, 'days').format('YYYY-MM-DD');
                    compPeriod.period = 'custom';
                }
                else if (comparePeriod === 'previousYear') {
                    const yearAgo = today.subtract(1, 'year');
                    compPeriod.startDate = yearAgo.subtract(29, 'days').format('YYYY-MM-DD'); // 30 dias atrás do ano passado
                    compPeriod.endDate = yearAgo.format('YYYY-MM-DD');
                    compPeriod.period = 'custom';
                }
                break;
            case 'thisMonth':
                if (comparePeriod === 'previousPeriod') { // Mês passado
                    const lastMonth = today.subtract(1, 'month');
                    compPeriod.startDate = getStartOfMonth(lastMonth).format('YYYY-MM-DD');
                    compPeriod.endDate = getEndOfMonth(lastMonth).format('YYYY-MM-DD');
                    compPeriod.period = 'custom';
                }
                else if (comparePeriod === 'previousYear') { // Mesmo mês do ano passado
                    const yearAgo = today.subtract(1, 'year');
                    compPeriod.startDate = getStartOfMonth(yearAgo).format('YYYY-MM-DD');
                    compPeriod.endDate = getEndOfMonth(yearAgo).format('YYYY-MM-DD');
                    compPeriod.period = 'custom';
                }
                break;
            case 'lastMonth':
                if (comparePeriod === 'previousPeriod') { // Dois meses atrás
                    const twoMonthsAgo = today.subtract(2, 'month');
                    compPeriod.startDate = getStartOfMonth(twoMonthsAgo).format('YYYY-MM-DD');
                    compPeriod.endDate = getEndOfMonth(twoMonthsAgo).format('YYYY-MM-DD');
                    compPeriod.period = 'custom';
                }
                else if (comparePeriod === 'previousYear') { // Mês passado do ano passado
                    const lastMonth = today.subtract(1, 'month');
                    const lastMonthLastYear = lastMonth.subtract(1, 'year');
                    compPeriod.startDate = getStartOfMonth(lastMonthLastYear).format('YYYY-MM-DD');
                    compPeriod.endDate = getEndOfMonth(lastMonthLastYear).format('YYYY-MM-DD');
                    compPeriod.period = 'custom';
                }
                break;
            case 'thisYear':
                if (comparePeriod === 'previousPeriod') { // Ano passado
                    const lastYear = today.subtract(1, 'year');
                    compPeriod.startDate = getStartOfYear(lastYear).format('YYYY-MM-DD');
                    compPeriod.endDate = getEndOfYear(lastYear).format('YYYY-MM-DD');
                    compPeriod.period = 'custom';
                }
                else if (comparePeriod === 'previousYear') { // Dois anos atrás
                    const twoYearsAgo = today.subtract(2, 'year');
                    compPeriod.startDate = getStartOfYear(twoYearsAgo).format('YYYY-MM-DD');
                    compPeriod.endDate = getEndOfYear(twoYearsAgo).format('YYYY-MM-DD');
                    compPeriod.period = 'custom';
                }
                break;
            default:
                break;
        }
    }
    return compPeriod;
}
export const dashboardService = {
    async getTotalSalesAmount(filters = {}) {
        const { period, startDate, endDate, salesperson, product, region, comparePeriod } = filters;
        // Filtros para o período principal
        const { whereClause: mainWhereClause, params: mainParams } = buildWhereClauseForPeriod(period, startDate, endDate, { salesperson, product, region }, 's');
        const { rows: mainRows } = await pool.query(`SELECT COALESCE(SUM(total_amount), 0) AS total_sales FROM sales s ${mainWhereClause};`, mainParams);
        const mainPeriodSales = parseFloat(mainRows[0].total_sales);
        let comparisonPeriodSales = null;
        if (comparePeriod && comparePeriod !== 'Nenhum') {
            const compPeriod = calculateComparisonPeriod(period, startDate, endDate, comparePeriod);
            if (compPeriod.period || (compPeriod.startDate && compPeriod.endDate)) {
                // Filtros para o período de comparação
                const { whereClause: compWhereClause, params: compParams } = buildWhereClauseForPeriod(compPeriod.period, compPeriod.startDate, compPeriod.endDate, { salesperson, product, region }, 's');
                const { rows: compRows } = await pool.query(`SELECT COALESCE(SUM(total_amount), 0) AS total_sales FROM sales s ${compWhereClause};`, compParams);
                comparisonPeriodSales = parseFloat(compRows[0].total_sales);
            }
        }
        return { mainPeriodSales, comparisonPeriodSales };
    },
    async getSalesByMonth(filters = {}) {
        const { period, startDate, endDate, salesperson, product, region, comparePeriod } = filters;
        // Dados para o período principal
        const { whereClause: mainWhereClause, params: mainParams } = buildWhereClauseForPeriod(period, startDate, endDate, { salesperson, product, region }, 's');
        const { rows: mainRows } = await pool.query(`SELECT
        TO_CHAR(sale_date, 'YYYY-MM') AS month,
        COALESCE(SUM(total_amount), 0) AS monthly_sales
      FROM sales s
      ${mainWhereClause}
      GROUP BY month
      ORDER BY month ASC;`, mainParams);
        const mainPeriodSalesByMonth = mainRows.map((row) => ({ month: row.month, monthly_sales: parseFloat(row.monthly_sales) }));
        let comparisonPeriodSalesByMonth = null;
        if (comparePeriod && comparePeriod !== 'Nenhum') {
            const compPeriod = calculateComparisonPeriod(period, startDate, endDate, comparePeriod);
            if (compPeriod.period || (compPeriod.startDate && compPeriod.endDate)) {
                // Dados para o período de comparação
                const { whereClause: compWhereClause, params: compParams } = buildWhereClauseForPeriod(compPeriod.period, compPeriod.startDate, compPeriod.endDate, { salesperson, product, region }, 's');
                const { rows: compRows } = await pool.query(`SELECT
            TO_CHAR(sale_date, 'YYYY-MM') AS month,
            COALESCE(SUM(total_amount), 0) AS monthly_sales
          FROM sales s
          ${compWhereClause}
          GROUP BY month
          ORDER BY month ASC;`, compParams);
                comparisonPeriodSalesByMonth = compRows.map((row) => ({ month: row.month, monthly_sales: parseFloat(row.monthly_sales) }));
            }
        }
        return { mainPeriodSalesByMonth, comparisonPeriodSalesByMonth };
    },
    async getTopSellingProducts(filters = {}, limit = 5) {
        const { period, startDate, endDate, salesperson, product, region, comparePeriod } = filters;
        // Dados para o período principal
        const { whereClause: mainWhereClause, params: mainParams } = buildWhereClauseForPeriod(period, startDate, endDate, { salesperson, product, region }, 's');
        let mainParamIndex = mainParams.length + 1;
        const { rows: mainRows } = await pool.query(`SELECT
        p.name AS product_name,
        pv.color AS variation_color,
        SUM(si.quantity) AS total_quantity_sold
      FROM sale_items si
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      ${mainWhereClause}
      GROUP BY p.name, pv.color
      ORDER BY total_quantity_sold DESC
      LIMIT $${mainParamIndex};`, [...mainParams, limit]);
        const mainPeriodTopSellingProducts = mainRows.map((row) => ({ ...row, total_quantity_sold: parseInt(row.total_quantity_sold) }));
        let comparisonPeriodTopSellingProducts = null;
        if (comparePeriod && comparePeriod !== 'Nenhum') {
            const compPeriod = calculateComparisonPeriod(period, startDate, endDate, comparePeriod);
            if (compPeriod.period || (compPeriod.startDate && compPeriod.endDate)) {
                // Dados para o período de comparação
                const { whereClause: compWhereClause, params: compParams } = buildWhereClauseForPeriod(compPeriod.period, compPeriod.startDate, compPeriod.endDate, { salesperson, product, region }, 's');
                let compParamIndex = compParams.length + 1;
                const { rows: compRows } = await pool.query(`SELECT
            p.name AS product_name,
            pv.color AS variation_color,
            SUM(si.quantity) AS total_quantity_sold
          FROM sale_items si
          JOIN product_variations pv ON si.variation_id = pv.id
          JOIN products p ON pv.product_id = p.id
          JOIN sales s ON si.sale_id = s.id
          ${compWhereClause}
          GROUP BY p.name, pv.color
          ORDER BY total_quantity_sold DESC
          LIMIT $${compParamIndex};`, [...compParams, limit]);
                comparisonPeriodTopSellingProducts = compRows.map((row) => ({ ...row, total_quantity_sold: parseInt(row.total_quantity_sold) }));
            }
        }
        return { mainPeriodTopSellingProducts, comparisonPeriodTopSellingProducts };
    },
    async getRecentSales(filters = {}, limit = 5) {
        const { period, startDate, endDate, salesperson, product, region, comparePeriod } = filters;
        // Dados para o período principal
        const { whereClause: mainWhereClause, params: mainParams } = buildWhereClauseForPeriod(period, startDate, endDate, { salesperson, product, region }, 's');
        let mainParamIndex = mainParams.length + 1;
        const { rows: mainRows } = await pool.query(`SELECT
        id,
        total_amount,
        sale_date
      FROM sales s
      ${mainWhereClause}
      ORDER BY sale_date DESC
      LIMIT $${mainParamIndex};`, [...mainParams, limit]);
        const mainPeriodRecentSales = mainRows.map((row) => ({ ...row, total_amount: parseFloat(row.total_amount) }));
        let comparisonPeriodRecentSales = null;
        if (comparePeriod && comparePeriod !== 'Nenhum') {
            const compPeriod = calculateComparisonPeriod(period, startDate, endDate, comparePeriod);
            if (compPeriod.period || (compPeriod.startDate && compPeriod.endDate)) {
                // Dados para o período de comparação
                const { whereClause: compWhereClause, params: compParams } = buildWhereClauseForPeriod(compPeriod.period, compPeriod.startDate, compPeriod.endDate, { salesperson, product, region }, 's');
                let compParamIndex = compParams.length + 1;
                const { rows: compRows } = await pool.query(`SELECT
            id,
            total_amount,
            sale_date
          FROM sales s
          ${compWhereClause}
          ORDER BY sale_date DESC
          LIMIT $${compParamIndex};`, [...compParams, limit]);
                comparisonPeriodRecentSales = compRows.map((row) => ({ ...row, total_amount: parseFloat(row.total_amount) }));
            }
        }
        return { mainPeriodRecentSales, comparisonPeriodRecentSales };
    },
    async getSlowMovingProducts(filters = {}, days = 90) {
        const { period, startDate, endDate, salesperson, product, region, comparePeriod } = filters;
        // Função para buscar produtos sem giro para um período específico
        const fetchSlowMovingForPeriod = async (currentPeriod, currentStartDate, currentEndDate) => {
            const { whereClause, params } = buildWhereClauseForPeriod(currentPeriod, currentStartDate, currentEndDate, { salesperson, product, region }, 's');
            let paramIndex = params.length + 1;
            const { rows } = await pool.query(`SELECT
          p.name,
          pv.color,
          ps.quantity,
          MAX(s.sale_date) as last_sale_date,
          EXTRACT(DAY FROM NOW() - MAX(s.sale_date)) as days_since_sale
        FROM product_stock ps
        JOIN product_variations pv ON ps.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        LEFT JOIN sale_items si ON pv.id = si.variation_id
        LEFT JOIN sales s ON si.sale_id = s.id
        ${whereClause ? whereClause + ' AND' : 'WHERE'} ps.quantity > 0
        GROUP BY p.name, pv.color, ps.quantity
        HAVING MAX(s.sale_date) < NOW() - make_interval(days => $${paramIndex}) OR MAX(s.sale_date) IS NULL
        ORDER BY last_sale_date ASC NULLS FIRST
        LIMIT 10;`, [...params, days]);
            return rows;
        };
        const mainPeriodSlowMovingProducts = await fetchSlowMovingForPeriod(period, startDate, endDate);
        let comparisonPeriodSlowMovingProducts = null;
        if (comparePeriod && comparePeriod !== 'Nenhum') {
            const compPeriod = calculateComparisonPeriod(period, startDate, endDate, comparePeriod);
            if (compPeriod.period || (compPeriod.startDate && compPeriod.endDate)) {
                comparisonPeriodSlowMovingProducts = await fetchSlowMovingForPeriod(compPeriod.period, compPeriod.startDate, compPeriod.endDate);
            }
        }
        return { mainPeriodSlowMovingProducts, comparisonPeriodSlowMovingProducts };
    },
    async getSalesForecast(filters = {}) {
        const { period, startDate, endDate, salesperson, product, region, comparePeriod } = filters;
        // Função para buscar a previsão de vendas para um período específico
        const fetchSalesForecastForPeriod = async (currentPeriod, currentStartDate, currentEndDate) => {
            const { whereClause, params } = buildWhereClauseForPeriod(currentPeriod, currentStartDate, currentEndDate, { salesperson, product, region }, 's');
            const { rows } = await pool.query(`WITH monthly_stats AS (
          SELECT
            COALESCE(SUM(total_amount), 0) as current_sales,
            EXTRACT(DAY FROM NOW()) as days_passed,
            EXTRACT(DAY FROM (DATE_TRUNC('MONTH', NOW()) + INTERVAL '1 MONTH - 1 day')) as total_days_in_month
          FROM sales s
          ${whereClause ? whereClause + ' AND' : 'WHERE'} s.sale_date >= DATE_TRUNC('MONTH', NOW())
        )
        SELECT
          current_sales,
          (current_sales / GREATEST(days_passed, 1)) * total_days_in_month as projected_sales
        FROM monthly_stats;`, params);
            return {
                current_sales: parseFloat(rows[0].current_sales),
                projected_sales: parseFloat(rows[0].projected_sales)
            };
        };
        const mainPeriodSalesForecast = await fetchSalesForecastForPeriod(period, startDate, endDate);
        let comparisonPeriodSalesForecast = null;
        if (comparePeriod && comparePeriod !== 'Nenhum') {
            const compPeriod = calculateComparisonPeriod(period, startDate, endDate, comparePeriod);
            if (compPeriod.period || (compPeriod.startDate && compPeriod.endDate)) {
                comparisonPeriodSalesForecast = await fetchSalesForecastForPeriod(compPeriod.period, compPeriod.startDate, compPeriod.endDate);
            }
        }
        return { mainPeriodSalesForecast, comparisonPeriodSalesForecast };
    },
    async getAverageTicketBySalesperson(filters = {}) {
        const { period, startDate, endDate, salesperson, product, region, comparePeriod } = filters;
        // Função para buscar ticket médio por vendedor para um período específico
        const fetchAverageTicketForPeriod = async (currentPeriod, currentStartDate, currentEndDate) => {
            const { whereClause, params } = buildWhereClauseForPeriod(currentPeriod, currentStartDate, currentEndDate, { salesperson, product, region }, 's');
            const { rows } = await pool.query(`SELECT
          u.name as user_name,
          AVG(s.total_amount) as avg_ticket,
          COUNT(s.id) as total_sales
        FROM sales s
        JOIN users u ON s.user_id = u.id
        ${whereClause ? whereClause + ' AND' : 'WHERE'} s.sale_date >= DATE_TRUNC('MONTH', NOW())
        GROUP BY u.name
        ORDER BY avg_ticket DESC;`, params);
            return rows.map(row => ({
                user_name: row.user_name,
                avg_ticket: parseFloat(row.avg_ticket),
                total_sales: parseInt(row.total_sales)
            }));
        };
        const mainPeriodAverageTicketBySalesperson = await fetchAverageTicketForPeriod(period, startDate, endDate);
        let comparisonPeriodAverageTicketBySalesperson = null;
        if (comparePeriod && comparePeriod !== 'Nenhum') {
            const compPeriod = calculateComparisonPeriod(period, startDate, endDate, comparePeriod);
            if (compPeriod.period || (compPeriod.startDate && compPeriod.endDate)) {
                comparisonPeriodAverageTicketBySalesperson = await fetchAverageTicketForPeriod(compPeriod.period, compPeriod.startDate, compPeriod.endDate);
            }
        }
        return { mainPeriodAverageTicketBySalesperson, comparisonPeriodAverageTicketBySalesperson };
    },
    async getSalesHeatmapData(filters = {}) {
        const { period, startDate, endDate, salesperson, product, region, comparePeriod } = filters;
        // Função para buscar dados do mapa de calor de vendas para um período específico
        const fetchSalesHeatmapDataForPeriod = async (currentPeriod, currentStartDate, currentEndDate) => {
            const { whereClause, params } = buildWhereClauseForPeriod(currentPeriod, currentStartDate, currentEndDate, { salesperson, product, region }, 's');
            const { rows } = await pool.query(`SELECT
          c.city,
          c.state,
          COUNT(s.id) as sales_count,
          SUM(s.total_amount) as total_revenue
        FROM sales s
        JOIN customers c ON s.customer_id = c.id
        ${whereClause ? whereClause + ' AND' : 'WHERE'} c.city IS NOT NULL
        GROUP BY c.city, c.state
        ORDER BY total_revenue DESC
        LIMIT 50;`, params);
            return rows.map(row => ({
                city: row.city,
                state: row.state,
                sales_count: parseInt(row.sales_count),
                total_revenue: parseFloat(row.total_revenue)
            }));
        };
        const mainPeriodSalesHeatmapData = await fetchSalesHeatmapDataForPeriod(period, startDate, endDate);
        let comparisonPeriodSalesHeatmapData = null;
        if (comparePeriod && comparePeriod !== 'Nenhum') {
            const compPeriod = calculateComparisonPeriod(period, startDate, endDate, comparePeriod);
            if (compPeriod.period || (compPeriod.startDate && compPeriod.endDate)) {
                comparisonPeriodSalesHeatmapData = await fetchSalesHeatmapDataForPeriod(compPeriod.period, compPeriod.startDate, compPeriod.endDate);
            }
        }
        return { mainPeriodSalesHeatmapData, comparisonPeriodSalesHeatmapData };
    },
};
