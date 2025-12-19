import { getPool } from '../db/index.js';
export const calculateClv = async (customerId) => {
    const pool = getPool();
    const client = await pool.connect();
    try {
        // For simplicity, CLV calculation will be: (Average Purchase Value) * (Average Purchase Frequency) * (Customer Lifespan)
        // Average Purchase Value (APV): Total Revenue from customer / Number of Purchases
        // Average Purchase Frequency (APF): Number of Purchases / Customer Lifespan (in years)
        // Customer Lifespan (CL): Assuming 3 years for now, or calculated from first purchase to last purchase
        // 1. Get total revenue and number of purchases for the customer
        const salesData = await client.query(`SELECT
        SUM(total_amount) as total_revenue,
        COUNT(id) as num_purchases,
        MIN(sale_date) as first_purchase_date,
        MAX(sale_date) as last_purchase_date
       FROM sales
       WHERE customer_id = $1`, [customerId]);
        console.log('[clvService] salesData.rows[0]:', salesData.rows[0]);
        const { total_revenue: totalRevenueStr, num_purchases, first_purchase_date, last_purchase_date, } = salesData.rows[0];
        const total_revenue = parseFloat(totalRevenueStr || '0');
        if (!num_purchases || num_purchases === '0') {
            return { customer_id: customerId, clv: 0, message: 'No purchase data for this customer.' };
        }
        const apv = total_revenue / parseInt(num_purchases);
        // Calculate customer lifespan in years
        let customerLifespanYears = 3; // Default to 3 years if not enough data
        if (first_purchase_date && last_purchase_date) {
            const diffTime = Math.abs(new Date(last_purchase_date).getTime() - new Date(first_purchase_date).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 365) {
                // Only calculate if more than a year of data
                customerLifespanYears = diffDays / 365;
            }
        }
        const apf = parseInt(num_purchases) / customerLifespanYears;
        const clv = apv * apf * customerLifespanYears;
        return {
            customer_id: customerId,
            total_revenue: total_revenue,
            num_purchases: parseInt(num_purchases),
            apv: apv,
            apf: apf,
            customer_lifespan_years: customerLifespanYears,
            clv: clv,
        };
    }
    finally {
        client.release();
    }
};
