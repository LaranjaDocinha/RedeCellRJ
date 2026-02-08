import pool from '../db/index.js';

class RfmService {
  /**
   * Calculates and updates RFM scores for all customers.
   */
  async calculateRfmScores(): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Calculate RFM scores using SQL Window Functions (NTILE)
      const rfmQuery = `
        WITH CustomerStats AS (
          SELECT
            c.id AS customer_id,
            (CURRENT_DATE - MAX(s.sale_date)::date) AS recency_days,
            COUNT(s.id) AS frequency_count,
            SUM(s.total_amount) AS monetary_value
          FROM customers c
          JOIN sales s ON c.id = s.customer_id
          GROUP BY c.id
        ),
        RFM_Score AS (
          SELECT 
              customer_id,
              recency_days,
              frequency_count,
              monetary_value,
              NTILE(5) OVER (ORDER BY recency_days DESC) as r_score,
              NTILE(5) OVER (ORDER BY frequency_count ASC) as f_score,
              NTILE(5) OVER (ORDER BY monetary_value ASC) as m_score
          FROM CustomerStats
        )
        SELECT * FROM RFM_Score;
      `;
      const { rows: scoredData } = await client.query(rfmQuery);

      if (scoredData.length === 0) {
        console.log('No sales data to calculate RFM scores.');
        await client.query('COMMIT');
        return;
      }

      // 2. Update the customers table in a batch
      const values = scoredData
        .map(
          (d) =>
            `(${d.customer_id}, ${d.r_score}, ${d.f_score}, ${d.m_score}, '${this.getSegmentName(d.r_score, d.f_score)}', ${d.recency_days > 60})`,
        )
        .join(',');

      if (values) {
        const updateQuery = `
            UPDATE customers SET
              rfm_recency = temp.rfm_recency,
              rfm_frequency = temp.rfm_frequency,
              rfm_monetary = temp.rfm_monetary,
              rfm_segment = temp.rfm_segment,
              churn_risk = temp.churn_risk,
              health_score = CASE 
                WHEN temp.rfm_segment = 'Champions' THEN 100
                WHEN temp.rfm_segment = 'At Risk' THEN 30
                WHEN temp.rfm_segment = 'Lost' THEN 0
                ELSE 70
              END,
              rfm_last_calculated = NOW()
            FROM (VALUES
              ${values}
            ) AS temp(customer_id, rfm_recency, rfm_frequency, rfm_monetary, rfm_segment, churn_risk)
            WHERE customers.id = temp.customer_id; 
          `;
        await client.query(updateQuery);
      }

      await client.query('COMMIT');
      console.log(`RFM scores calculated for ${scoredData.length} customers.`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error calculating RFM scores:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  private getSegmentName(r: number, f: number): string {
    if (r >= 4 && f >= 4) return 'Champions';
    if (r >= 2 && f >= 3) return 'Loyal Customers';
    if (r >= 3 && f >= 1) return 'Potential Loyalist';
    if (r >= 4 && f === 1) return 'New Customers';
    if (r >= 3 && f === 1) return 'Promising';
    if (r >= 2 && f >= 2) return 'Customers Needing Attention';
    if (r <= 2 && f >= 2) return 'At Risk';
    if (r <= 2 && f <= 2) return "Can't Lose Them";
    if (r <= 1 && f >= 1) return 'Hibernating';
    if (r <= 2 && f === 1) return 'Lost';
    return 'Uncategorized';
  }
  async getSegmentCounts(): Promise<any[]> {
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

  async getCustomersBySegment(segment: string): Promise<any[]> {
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
