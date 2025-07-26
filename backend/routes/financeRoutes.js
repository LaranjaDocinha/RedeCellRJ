const express = require('express');
const router = express.Router();
const db = require('../db');

// Rota para buscar todas as contas a pagar
router.get('/payables', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM contas_a_pagar ORDER BY data_vencimento ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching payables:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Rota para adicionar uma nova conta a pagar
router.post('/payables', async (req, res) => {
  const { descricao, valor, data_vencimento, fornecedor_id, observacao } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO contas_a_pagar (descricao, valor, data_vencimento, fornecedor_id, observacao) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [descricao, valor, data_vencimento, fornecedor_id, observacao]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error adding payable:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Rota para buscar todas as contas a receber
router.get('/receivables', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM contas_a_receber ORDER BY data_vencimento ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching receivables:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Rota para adicionar uma nova conta a receber
router.post('/receivables', async (req, res) => {
    const { descricao, valor, data_vencimento, cliente_id, venda_id, reparo_id, observacao } = req.body;
    try {
      const { rows } = await db.query(
        'INSERT INTO contas_a_receber (descricao, valor, data_vencimento, cliente_id, venda_id, reparo_id, observacao) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [descricao, valor, data_vencimento, cliente_id, venda_id, reparo_id, observacao]
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error adding receivable:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

module.exports = router;
