const pool = require('../db');
const { AppError } = require('../utils/appError');

// @desc    Obter todas as cotações com filtros e paginação
// @route   GET /api/quotations
// @access  Private
exports.getAllQuotations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, customer_id, status, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        q.id, q.customer_id, c.name as customer_name, q.user_id, u.name as user_name,
        q.quotation_date, q.valid_until_date, q.total_amount, q.status, q.notes, q.pdf_url
      FROM quotations q
      JOIN customers c ON q.customer_id = c.id
      JOIN users u ON q.user_id = u.id
    `;
    const queryParams = [];
    const whereClauses = [];
    let paramIndex = 1;

    if (customer_id) {
      whereClaues.push(`q.customer_id = $${paramIndex++}`);
      queryParams.push(customer_id);
    }
    if (status) {
      whereClauses.push(`q.status = $${paramIndex++}`);
      queryParams.push(status);
    }
    if (startDate) {
      whereClauses.push(`q.quotation_date >= $${paramIndex++}`);
      queryParams.push(startDate);
    }
    if (endDate) {
      whereClauses.push(`q.quotation_date <= $${paramIndex++}`);
      queryParams.push(endDate);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY q.quotation_date DESC';
    queryParams.push(limit, offset);
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

    const { rows } = await pool.query(query, queryParams);

    // Contagem total para paginação
    let countQuery = 'SELECT COUNT(*) FROM quotations q';
    if (whereClauses.length > 0) {
      countQuery += ' WHERE ' + whereClauses.join(' AND ');
    }
    const totalResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(totalResult.rows[0].count, 10);

    res.status(200).json({
      quotations: rows,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(new AppError('Erro ao buscar cotações.', 500));
  }
};

// @desc    Obter uma cotação por ID
// @route   GET /api/quotations/:id
// @access  Private
exports.getQuotationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quotationResult = await pool.query(
      `SELECT 
        q.id, q.customer_id, c.name as customer_name, q.user_id, u.name as user_name,
        q.quotation_date, q.valid_until_date, q.total_amount, q.status, q.notes, q.pdf_url
      FROM quotations q
      JOIN customers c ON q.customer_id = c.id
      JOIN users u ON q.user_id = u.id
      WHERE q.id = $1`,
      [id]
    );

    if (quotationResult.rows.length === 0) {
      return next(new AppError('Cotação não encontrada.', 404));
    }
    const quotation = quotationResult.rows[0];

    const itemsResult = await pool.query(
      'SELECT id, product_id, product_variation_id, description, quantity, unit_price, subtotal FROM quotation_items WHERE quotation_id = $1',
      [id]
    );
    quotation.items = itemsResult.rows;

    res.status(200).json(quotation);
  } catch (error) {
    next(new AppError('Erro ao buscar a cotação.', 500));
  }
};

// @desc    Criar uma nova cotação
// @route   POST /api/quotations
// @access  Private
exports.createQuotation = async (req, res, next) => {
  const client = await pool.getClient();
  try {
    await client.query('BEGIN');

    const { customer_id, quotation_date, valid_until_date, total_amount, status, notes, items } = req.body;
    const userId = req.user.id;

    const quotationResult = await client.query(
      'INSERT INTO quotations (customer_id, user_id, quotation_date, valid_until_date, total_amount, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [customer_id, userId, quotation_date, valid_until_date, total_amount, status, notes]
    );
    const quotation = quotationResult.rows[0];

    for (const item of items) {
      await client.query(
        'INSERT INTO quotation_items (quotation_id, product_id, product_variation_id, description, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [quotation.id, item.product_id || null, item.product_variation_id || null, item.description, item.quantity, item.unit_price, item.subtotal]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ 
      message: 'Cotação criada com sucesso!',
      quotation: quotation
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(new AppError('Erro ao criar a cotação.', 500));
  } finally {
    client.release();
  }
};

// @desc    Atualizar uma cotação
// @route   PUT /api/quotations/:id
// @access  Private
exports.updateQuotation = async (req, res, next) => {
  const client = await pool.getClient();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { customer_id, quotation_date, valid_until_date, total_amount, status, notes, items } = req.body;

    const quotationResult = await client.query(
      'UPDATE quotations SET customer_id = $1, quotation_date = $2, valid_until_date = $3, total_amount = $4, status = $5, notes = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [customer_id, quotation_date, valid_until_date, total_amount, status, notes, id]
    );

    if (quotationResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return next(new AppError('Cotação não encontrada para atualização.', 404));
    }

    // Deletar itens antigos e inserir os novos (abordagem simplificada para atualização de itens)
    await client.query('DELETE FROM quotation_items WHERE quotation_id = $1', [id]);
    for (const item of items) {
      await client.query(
        'INSERT INTO quotation_items (quotation_id, product_id, product_variation_id, description, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, item.product_id || null, item.product_variation_id || null, item.description, item.quantity, item.unit_price, item.subtotal]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({
      message: 'Cotação atualizada com sucesso!',
      quotation: quotationResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(new AppError('Erro ao atualizar a cotação.', 500));
  } finally {
    client.release();
  }
};

// @desc    Deletar uma cotação
// @route   DELETE /api/quotations/:id
// @access  Private
exports.deleteQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    // A exclusão de quotation_items é feita em cascata pelo DB (ON DELETE CASCADE)
    const result = await pool.query('DELETE FROM quotations WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return next(new AppError('Cotação não encontrada para exclusão.', 404));
    }

    res.status(204).send();
  } catch (error) {
    next(new AppError('Erro ao deletar a cotação.', 500));
  }
};

// TODO: Implementar geração de PDF para cotação
exports.generateQuotationPdf = async (req, res, next) => {
  res.status(501).json({ message: 'Geração de PDF de cotação ainda não implementada.' });
};
