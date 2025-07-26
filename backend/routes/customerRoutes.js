const express = require('express');
const router = express.Router();
const db = require('../db'); // Usar nosso novo módulo de DB

// Get all customers or search for customers
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0, search = '' } = req.query;

    let customersQuery;
    let totalCustomersQuery;

    if (search) {
      // Se houver busca, procura por nome ou email
      const searchQuery = `%${search}%`;
      customersQuery = await db.query(
        'SELECT * FROM customers WHERE name ILIKE $1 OR email ILIKE $1 ORDER BY name LIMIT $2 OFFSET $3',
        [searchQuery, limit, offset]
      );
      totalCustomersQuery = await db.query(
        'SELECT COUNT(*) FROM customers WHERE name ILIKE $1 OR email ILIKE $1',
        [searchQuery]
      );
    } else {
      // Senão, retorna a lista paginada
      customersQuery = await db.query('SELECT * FROM customers ORDER BY name LIMIT $1 OFFSET $2', [limit, offset]);
      totalCustomersQuery = await db.query('SELECT COUNT(*) FROM customers');
    }

    res.json({
      customers: customersQuery.rows,
      total: parseInt(totalCustomersQuery.rows[0].count),
    });
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).send('Erro do Servidor');
  }
});

// Get a single customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).send('Erro do Servidor');
  }
});

// Create a new customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    const result = await db.query(
      'INSERT INTO customers (name, phone, email, address) VALUES ($1, $2, $3, $4) RETURNING * ',
      [name, phone, email, address]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).send('Erro do Servidor');
  }
});

// Update a customer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;
    const result = await db.query(
      'UPDATE customers SET name = $1, phone = $2, email = $3, address = $4 WHERE id = $5 RETURNING * ',
      [name, phone, email, address, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).send('Erro do Servidor');
  }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM customers WHERE id = $1 RETURNING * ', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Customer not found' });
    }
    res.json({ msg: 'Customer deleted' });
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).send('Erro do Servidor');
  }
});

module.exports = router;
