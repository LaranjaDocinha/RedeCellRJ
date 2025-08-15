const pool = require('../db');
const { logActivity } = require('../utils/activityLogger');

// Constrói a cláusula WHERE para a consulta de clientes com base nos filtros
const buildWhereClause = (filters) => {
  let whereClause = '';
  const params = [];
  if (filters) {
    const filterEntries = Object.entries(JSON.parse(filters));
    if (filterEntries.length > 0) {
      whereClause = ' WHERE ' + filterEntries.map(([key, value], index) => {
        params.push(`%${value}%`);
        return `${key} ILIKE $${index + 1}`;
      }).join(' AND ');
    }
  }
  return { whereClause, params };
};

// @desc    Obter todos os clientes com paginação, ordenação e filtros
// @route   GET /api/customers
// @access  Private
exports.getAllCustomers = async (req, res) => {
  const { page = 1, pageSize = 10, sort = 'id', order = 'asc', filters } = req.query;
  const offset = (page - 1) * pageSize;

  try {
    const { whereClause, params: filterParams } = buildWhereClause(filters);

    // Consulta para obter os dados paginados e filtrados
    const dataQuery = `
      SELECT * FROM customers
      ${whereClause}
      ORDER BY ${sort} ${order.toUpperCase()}
      LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2};
    `;
    const dataResult = await pool.query(dataQuery, [...filterParams, pageSize, offset]);

    // Consulta para obter a contagem total de registros para a paginação
    const countQuery = `SELECT COUNT(*) FROM customers ${whereClause}`;
    const countResult = await pool.query(countQuery, filterParams);
    const totalRecords = parseInt(countResult.rows[0].count, 10);

    res.json({
      data: dataResult.rows,
      page,
      pageSize,
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageSize),
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ message: 'Erro interno ao buscar clientes.' });
  }
};

// @desc    Obter um cliente por ID
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ message: 'Erro interno ao buscar cliente.' });
  }
};

// @desc    Criar um novo cliente
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res) => {
  const { name, email, phone, address, loyalty_points = 0 } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO customers (name, email, phone, address, loyalty_points) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [name, email, phone, address, loyalty_points]
    );
    await logActivity(req.user.name, `Cliente ${name} (ID: ${rows[0].id}) criado.`, 'customer', rows[0].id);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Atualizar um cliente
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, loyalty_points } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE customers SET name = $1, email = $2, phone = $3, address = $4, loyalty_points = $5, updated_at = NOW() WHERE id = $6 RETURNING *;',
      [name, email, phone, address, loyalty_points, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    await logActivity(req.user.name, `Cliente ${name} (ID: ${id}) atualizado.`, 'customer', id);
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Deletar um cliente
// @route   DELETE /api/customers/:id
// @access  Private
exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM customers WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    await logActivity(req.user.name, `Cliente (ID: ${id}) excluído.`, 'customer', id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Adicionar uma interação ao cliente
// @route   POST /api/customers/:id/interactions
// @access  Private
exports.addInteraction = async (req, res) => {
  const { id: customer_id } = req.params;
  const { interaction_type, notes } = req.body;
  const user_id = req.user.id;

  if (!interaction_type || !notes) {
    return res.status(400).json({ message: 'Tipo de interação e notas são obrigatórios.' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO customer_interactions (customer_id, user_id, interaction_type, notes) VALUES ($1, $2, $3, $4) RETURNING *;',
      [customer_id, user_id, interaction_type, notes]
    );
    await logActivity(req.user.name, `Interação (${interaction_type}) adicionada ao cliente #${customer_id}.`, 'customer', customer_id);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar interação:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Obter todas as interações de um cliente
// @route   GET /api/customers/:id/interactions
// @access  Private
exports.getInteractions = async (req, res) => {
  const { id: customer_id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT ci.*, u.name as user_name FROM customer_interactions ci JOIN users u ON ci.user_id = u.id WHERE customer_id = $1 ORDER BY interaction_date DESC;',
      [customer_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar interações:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Obter histórico de vendas de um cliente
// @route   GET /api/customers/:id/sales-history
// @access  Private
exports.getCustomerSalesHistory = async (req, res) => {
    const { id: customer_id } = req.params;
    try {
        const { rows } = await pool.query(
            'SELECT * FROM sales WHERE customer_id = $1 ORDER BY sale_date DESC',
            [customer_id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar histórico de vendas do cliente:', error);
        res.status(500).json({ message: 'Erro interno ao buscar histórico de vendas.' });
    }
};

// @desc    Deletar uma interação do cliente
// @route   DELETE /api/customers/:customerId/interactions/:interactionId
// @access  Private
exports.deleteInteraction = async (req, res) => {
  const { customerId, interactionId } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM customer_interactions WHERE id = $1 AND customer_id = $2;', [interactionId, customerId]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Interação não encontrada.' });
    }
    await logActivity(req.user.name, `Interação (ID: ${interactionId}) excluída do cliente #${customerId}.`, 'customer', customerId);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar interação:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Obter todas as interações de clientes com paginação, ordenação e filtros
// @route   GET /api/customers/interactions
// @access  Private
exports.getAllCustomerInteractions = async (req, res) => {
  const { page = 1, pageSize = 10, sort = 'interaction_date', order = 'desc', filters } = req.query;
  const offset = (page - 1) * pageSize;

  try {
    let whereClause = '';
    const params = [];
    let paramIndex = 1;

    if (filters) {
      const parsedFilters = JSON.parse(filters);
      const filterConditions = [];

      if (parsedFilters.customer_name) {
        filterConditions.push(`c.name ILIKE ${paramIndex++}`);
        params.push(`%${parsedFilters.customer_name}%`);
      }
      if (parsedFilters.interaction_type) {
        filterConditions.push(`ci.interaction_type ILIKE ${paramIndex++}`);
        params.push(`%${parsedFilters.interaction_type}%`);
      }
      if (parsedFilters.notes) {
        filterConditions.push(`ci.notes ILIKE ${paramIndex++}`);
        params.push(`%${parsedFilters.notes}%`);
      }

      if (filterConditions.length > 0) {
        whereClause = ` WHERE ${filterConditions.join(' AND ')}`;
      }
    }

    const dataQuery = `
      SELECT
        ci.id,
        ci.customer_id,
        c.name AS customer_name,
        ci.user_id,
        u.name AS user_name,
        ci.interaction_type,
        ci.notes,
        ci.interaction_date
      FROM customer_interactions ci
      JOIN customers c ON ci.customer_id = c.id
      JOIN users u ON ci.user_id = u.id
      ${whereClause}
      ORDER BY ${sort} ${order.toUpperCase()}
      LIMIT ${paramIndex++} OFFSET ${paramIndex++};
    `;
    const dataResult = await pool.query(dataQuery, [...params, pageSize, offset]);

    const countQuery = `
      SELECT COUNT(*)
      FROM customer_interactions ci
      JOIN customers c ON ci.customer_id = c.id
      JOIN users u ON ci.user_id = u.id
      ${whereClause};
    `;
    const countResult = await pool.query(countQuery, params);
    const totalRecords = parseInt(countResult.rows[0].count, 10);

    res.json({
      data: dataResult.rows,
      page,
      pageSize,
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageSize),
    });
  } catch (error) {
    console.error('Erro ao buscar todas as interações de clientes:', error);
    res.status(500).json({ message: 'Erro interno ao buscar interações de clientes.' });
  }
};
