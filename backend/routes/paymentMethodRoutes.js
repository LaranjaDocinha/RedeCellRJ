const express = require('express');
const router = express.Router();
const db = require('../db');

// Rota para buscar todos os métodos de pagamento
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM payment_methods ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching payment methods', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
