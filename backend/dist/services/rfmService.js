import pool from '../db/index.js';
class RfmService {
    /**
     * Calculates and updates RFM scores for all customers.
     */
    async calculateRfmScores() {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            // 1. Calculate raw RFM values for each customer
            const rfmQuery = `
        WITH CustomerRFM AS (
          SELECT
            c.id AS customer_id,
            (CURRENT_DATE - MAX(s.sale_date)::date) AS recency,
            COUNT(s.id) AS frequency,
            SUM(s.total_amount) AS monetary
          FROM customers c
          JOIN sales s ON c.id = s.customer_id
          GROUP BY c.id
        )
        SELECT * FROM CustomerRFM;
      `;
            const { rows: rfmData } = await client.query(rfmQuery);
            if (rfmData.length === 0) {
                console.log('No sales data to calculate RFM scores.');
                return;
            }
            // 2. Score customers based on quintiles (1-5)
            const scoredData = this.scoreRfm(rfmData);
            // 3. Update the customers table in a batch
            const values = scoredData
                .map((d) => `(${d.customer_id}, ${d.R}, ${d.F}, ${d.M}, '${this.getSegmentName(d.R, d.F)}')`)
                .join(',');
            const updateQuery = `
        UPDATE customers SET
          rfm_recency = temp.rfm_recency,
          rfm_frequency = temp.rfm_frequency,
          rfm_monetary = temp.rfm_monetary,
          rfm_segment = temp.rfm_segment,
          rfm_last_calculated = NOW()
        FROM (VALUES
          ${values}
        ) AS temp(customer_id, rfm_recency, rfm_frequency, rfm_monetary, rfm_segment)
        WHERE customers.id = temp.customer_id;
      `;
            await client.query(updateQuery);
            await client.query('COMMIT');
            console.log(`RFM scores calculated for ${scoredData.length} customers.`);
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('Error calculating RFM scores:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    scoreRfm(data) {
        const sortedByRecency = [...data].sort((a, b) => a.recency - b.recency); // Lower recency is better
        const sortedByFrequency = [...data].sort((a, b) => b.frequency - a.frequency);
        const sortedByMonetary = [...data].sort((a, b) => b.monetary - a.monetary);
        const quintileSize = Math.floor(data.length / 5);
        return data.map((customer) => {
            const rScore = 5 -
                Math.floor(sortedByRecency.findIndex((c) => c.customer_id === customer.customer_id) / quintileSize);
            const fScore = 5 -
                Math.floor(sortedByFrequency.findIndex((c) => c.customer_id === customer.customer_id) / quintileSize);
            const mScore = 5 -
                Math.floor(sortedByMonetary.findIndex((c) => c.customer_id === customer.customer_id) / quintileSize);
            return { ...customer, R: rScore, F: fScore, M: mScore };
        });
    }
    getSegmentName(r, f) {
        if (r >= 4 && f >= 4)
            return 'Champions';
        if (r >= 2 && f >= 3)
            return 'Loyal Customers';
        if (r >= 3 && f >= 1)
            return 'Potential Loyalist';
        if (r >= 4 && f === 1)
            return 'New Customers';
        if (r >= 3 && f === 1)
            return 'Promising';
        if (r >= 2 && f >= 2)
            return 'Customers Needing Attention';
        if (r <= 2 && f >= 2)
            return 'At Risk';
        if (r <= 2 && f <= 2)
            return "Can't Lose Them";
        if (r <= 1 && f >= 1)
            return 'Hibernating';
        if (r <= 2 && f === 1)
            return 'Lost';
        return 'Uncategorized';
    }
    async getSegmentCounts() {
        const query = `
      SELECT rfm_segment, COUNT(*) as customer_count
      FROM customers
      WHERE rfm_segment IS NOT NULL
      GROUP BY rfm_segment
      ORDER BY customer_count DESC;
    `;
        const { rows } = await pool.query(query);
        return rows;
    }
    async getCustomersBySegment(segment) {
        const query = `
      SELECT id, name, email, rfm_recency, rfm_frequency, rfm_monetary
      FROM customers
      WHERE rfm_segment = $1
      ORDER BY rfm_monetary DESC;
    `;
        const { rows } = await pool.query(query, [segment]);
        return rows;
    }
}
export const rfmService = new RfmService();
