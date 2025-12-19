import { getPool } from '../db/index.js';
import moment from 'moment';
export const simulatePromotion = async (details) => {
    const client = await getPool().connect();
    try {
        const { discount_percentage, target_product_ids, target_category_ids, duration_days, expected_sales_increase_percentage, branch_id, } = details;
        // Define a historical period for baseline calculation (e.g., last 30 days)
        const historicalEndDate = moment().subtract(duration_days, 'days').toISOString();
        const historicalStartDate = moment(historicalEndDate)
            .subtract(duration_days, 'days')
            .toISOString();
        let baseQuery = `
      SELECT 
        SUM(si.total_price) as total_revenue,
        SUM(si.cost_price * si.quantity) as total_cost,
        SUM(si.total_price - (si.cost_price * si.quantity)) as total_profit,
        SUM(si.quantity) as total_quantity_sold
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE s.sale_date BETWEEN $1 AND $2
    `;
        const queryParams = [historicalStartDate, historicalEndDate];
        let paramIndex = 3;
        if (branch_id) {
            baseQuery += ` AND s.branch_id = $${paramIndex++}`;
            queryParams.push(branch_id);
        }
        if (target_product_ids && target_product_ids.length > 0) {
            baseQuery += ` AND p.id = ANY($${paramIndex++}::int[])`;
            queryParams.push(target_product_ids);
        }
        if (target_category_ids && target_category_ids.length > 0) {
            baseQuery += ` AND p.category_id = ANY($${paramIndex++}::int[])`;
            queryParams.push(target_category_ids);
        }
        const baselineRes = await client.query(baseQuery, queryParams);
        const baseline = baselineRes.rows[0];
        const currentRevenue = parseFloat(baseline.total_revenue) || 0;
        const currentCost = parseFloat(baseline.total_cost) || 0;
        const currentProfit = parseFloat(baseline.total_profit) || 0;
        const currentQuantity = parseFloat(baseline.total_quantity_sold) || 0;
        // Simulate new scenario
        const newRevenuePerUnitFactor = (100 - discount_percentage) / 100;
        const newQuantityFactor = (100 + expected_sales_increase_percentage) / 100;
        const simulatedQuantity = currentQuantity * newQuantityFactor;
        const simulatedRevenue = (currentRevenue / currentQuantity) * newRevenuePerUnitFactor * simulatedQuantity;
        const simulatedCost = currentCost * newQuantityFactor; // Assuming cost per unit remains same
        const simulatedProfit = simulatedRevenue - simulatedCost;
        return {
            baseline: {
                revenue: parseFloat(currentRevenue.toFixed(2)),
                cost: parseFloat(currentCost.toFixed(2)),
                profit: parseFloat(currentProfit.toFixed(2)),
                quantity: parseFloat(currentQuantity.toFixed(2)),
            },
            simulated: {
                revenue: parseFloat(simulatedRevenue.toFixed(2)),
                cost: parseFloat(simulatedCost.toFixed(2)),
                profit: parseFloat(simulatedProfit.toFixed(2)),
                quantity: parseFloat(simulatedQuantity.toFixed(2)),
            },
            impact: {
                profitChange: parseFloat((simulatedProfit - currentProfit).toFixed(2)),
                revenueChange: parseFloat((simulatedRevenue - currentRevenue).toFixed(2)),
                quantityChange: parseFloat((simulatedQuantity - currentQuantity).toFixed(2)),
            },
        };
    }
    finally {
        client.release();
    }
};
