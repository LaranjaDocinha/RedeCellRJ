const express = require('express');
const router = express.Router();
const db = require('../db'); // Usar nosso novo módulo de DB

// Get all customers or search for customers
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0, search = '', segment = '' } = req.query;

    let queryParams = [];
    let whereClauses = [];

    if (search) {
      queryParams.push(`%${search}%`);
      whereClauses.push(`(name ILIKE $${queryParams.length + 1} OR email ILIKE $${queryParams.length + 1})`);
    }

    if (segment) {
      queryParams.push(segment);
      whereClauses.push(`segment = $${queryParams.length + 1}`);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const baseQuery = `FROM customers ${whereClause}`;
    const finalQuery = `SELECT * ${baseQuery} ORDER BY name LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    const totalQuery = `SELECT COUNT(*) ${baseQuery}`;

    const customersResult = await db.query(finalQuery, [...queryParams, limit, offset]);
    const totalCustomersResult = await db.query(totalQuery, queryParams);

    res.json({
      customers: customersResult.rows,
      total: parseInt(totalCustomersResult.rows[0].count),
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
    console.error('Erro ao buscar cliente:', err);
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
    console.error('Erro ao criar cliente:', err);
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
    console.error('Erro ao atualizar cliente:', err);
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
    console.error('Erro ao deletar cliente:', err);
    res.status(500).send('Erro do Servidor');
  }
});

// Rota para executar a segmentação de clientes
router.post('/segment/run', async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // 1. Obter dados agregados de vendas por cliente
    const customerSalesQuery = `
      SELECT
        c.id AS customer_id,
        SUM(s.total_amount) AS total_spent,
        MAX(s.sale_date) AS last_purchase_date
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id
      GROUP BY c.id
    `;
    const { rows: customerSales } = await client.query(customerSalesQuery);

    // 2. Determinar o segmento para cada cliente
    const customerSegments = customerSales.map(cs => {
      let segment = 'Bronze';
      if (cs.total_spent > 5000) {
        segment = 'Ouro';
      } else if (cs.total_spent > 1000) {
        segment = 'Prata';
      }

      // Lógica para clientes em risco
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      if (cs.last_purchase_date && new Date(cs.last_purchase_date) < ninetyDaysAgo) {
        segment = 'Em Risco';
      }

      return { id: cs.customer_id, segment };
    });

    // 3. Atualizar a tabela de clientes
    const updatePromises = customerSegments.map(cs => {
      return client.query('UPDATE customers SET segment = $1 WHERE id = $2', [cs.segment, cs.id]);
    });

    await Promise.all(updatePromises);

    await client.query('COMMIT');
    res.status(200).json({ message: `Segmentação de clientes concluída. ${customerSegments.length} clientes atualizados.` });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro na segmentação de clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

module.exports = router;