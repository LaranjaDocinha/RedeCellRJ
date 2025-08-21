const pool = require('../db');

const openCashier = async (req, res) => {
  const { initial_amount } = req.body;
  const userId = req.user.id;

  try {
    // Check for an already open cashier for the user
    const existingSession = await pool.query(
      'SELECT * FROM cash_sessions WHERE user_id = $1 AND closing_time IS NULL',
      [userId]
    );

    if (existingSession.rows.length > 0) {
      return res.status(400).json({ message: 'Cashier is already open for this user.' });
    }

    const result = await pool.query(
      'INSERT INTO cash_sessions (user_id, opening_time, initial_amount) VALUES ($1, NOW(), $2) RETURNING *',
      [userId, initial_amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const closeCashier = async (req, res) => {
  const { final_amount } = req.body;
  const userId = req.user.id;

  try {
    const sessionResult = await pool.query(
      'SELECT * FROM cash_sessions WHERE user_id = $1 AND closing_time IS NULL ORDER BY opening_time DESC LIMIT 1',
      [userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'No open cashier session found for this user.' });
    }

    const session = sessionResult.rows[0];
    const sessionId = session.id;

    // Calculate total sales during the session
    const salesResult = await pool.query(
      'SELECT SUM(total_amount) as total_sales FROM sales WHERE sale_date >= $1 AND user_id = $2',
      [session.opening_time, userId]
    );
    const totalSales = parseFloat(salesResult.rows[0].total_sales) || 0;

    const calculatedFinalAmount = parseFloat(session.initial_amount) + totalSales;
    const difference = parseFloat(final_amount) - calculatedFinalAmount;

    const updateResult = await pool.query(
      'UPDATE cash_sessions SET closing_time = NOW(), final_amount = $1, calculated_sales = $2, difference = $3 WHERE id = $4 RETURNING *',
      [final_amount, totalSales, difference, sessionId]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCashierStatus = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            'SELECT * FROM cash_sessions WHERE user_id = $1 AND closing_time IS NULL ORDER BY opening_time DESC LIMIT 1',
            [userId]
        );
        if (result.rows.length > 0) {
            res.json({ isOpen: true, session: result.rows[0] });
        } else {
            res.json({ isOpen: false });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCashierHistory = async (req, res) => {
    const userId = req.user.id;
    // TODO: Add pagination
    try {
        const result = await pool.query(
            'SELECT * FROM cash_sessions WHERE user_id = $1 ORDER BY opening_time DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCashierSummary = async (req, res) => {
  const userId = req.user.id;
  try {
    const sessionResult = await pool.query(
      'SELECT * FROM cash_sessions WHERE user_id = $1 AND closing_time IS NULL ORDER BY opening_time DESC LIMIT 1',
      [userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'No open cashier session found for this user.' });
    }

    const session = sessionResult.rows[0];

    // Calculate total sales during the session, broken down by payment method
    const salesByPaymentMethod = await pool.query(
      `SELECT pm.name as payment_method, SUM(sp.amount) as total_amount
       FROM sales s
       JOIN sales_payments sp ON s.id = sp.sale_id
       JOIN payment_methods pm ON sp.payment_method_id = pm.id
       WHERE s.sale_date >= $1 AND s.user_id = $2
       GROUP BY pm.name`,
      [session.opening_time, userId]
    );

    const totalSalesResult = await pool.query(
      'SELECT SUM(total_amount) as total_sales FROM sales WHERE sale_date >= $1 AND user_id = $2',
      [session.opening_time, userId]
    );
    const totalSales = parseFloat(totalSalesResult.rows[0].total_sales) || 0;

    res.json({
      session,
      totalSales,
      salesByPaymentMethod: salesByPaymentMethod.rows,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  openCashier,
  closeCashier,
  getCashierStatus,
  getCashierHistory,
  getCashierSummary,
};
