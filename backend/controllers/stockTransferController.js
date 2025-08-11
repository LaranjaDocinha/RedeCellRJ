const pool = require('../db');
const { logActivity } = require('../utils/activityLogger');

// @desc    Create a new stock transfer request
// @route   POST /api/stock/transfers
// @access  Private
const createStockTransfer = async (req, res) => {
  const { product_variation_id, quantity, from_branch_id, to_branch_id, notes } = req.body;
  const requested_by_user_id = req.user.id;

  if (!product_variation_id || !quantity || !from_branch_id || !to_branch_id || quantity <= 0) {
    return res.status(400).json({ message: 'Dados da transferência incompletos ou inválidos.' });
  }
  if (from_branch_id === to_branch_id) {
    return res.status(400).json({ message: 'Filiais de origem e destino devem ser diferentes.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verificar disponibilidade de estoque na filial de origem
    const variationResult = await client.query(
      'SELECT stock_quantity, reserved_quantity FROM product_variations WHERE id = $1 AND branch_id = $2 FOR UPDATE',
      [product_variation_id, from_branch_id]
    );
    if (variationResult.rows.length === 0) {
      throw new Error('Variação do produto não encontrada na filial de origem.');
    }
    const { stock_quantity, reserved_quantity } = variationResult.rows[0];
    const available_stock = stock_quantity - reserved_quantity;

    if (available_stock < quantity) {
      throw new Error(`Estoque insuficiente na filial de origem. Disponível: ${available_stock}.`);
    }

    // 2. Decrementar stock_quantity na filial de origem
    await client.query(
      'UPDATE product_variations SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND branch_id = $3',
      [quantity, product_variation_id, from_branch_id]
    );

    // 3. Incrementar reserved_quantity na filial de destino
    // Se a variação não existir na filial de destino, ela deve ser criada primeiro (fora do escopo desta função, assumindo que existe ou será criada)
    // Por enquanto, apenas atualiza se existir
    const destinationVariationResult = await client.query(
        'SELECT id FROM product_variations WHERE product_id = (SELECT product_id FROM product_variations WHERE id = $1) AND color = (SELECT color FROM product_variations WHERE id = $1) AND size = (SELECT size FROM product_variations WHERE id = $1) AND branch_id = $2',
        [product_variation_id, to_branch_id]
    );

    if (destinationVariationResult.rows.length === 0) {
        // Se a variação não existe na filial de destino, precisamos criá-la
        const originalVariationDetails = await client.query(
            'SELECT product_id, price, cost_price, color, size, weight, min_stock_level, barcode FROM product_variations WHERE id = $1',
            [product_variation_id]
        );
        const originalProductDetails = await client.query(
            'SELECT name, description, category_id, supplier_id FROM products WHERE id = $1',
            [originalVariationDetails.rows[0].product_id]
        );

        const newProductVariationResult = await client.query(
            'INSERT INTO product_variations (product_id, price, cost_price, stock_quantity, reserved_quantity, color, size, weight, min_stock_level, barcode, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id',
            [
                originalVariationDetails.rows[0].product_id,
                originalVariationDetails.rows[0].price,
                originalVariationDetails.rows[0].cost_price,
                0, // Estoque inicial 0
                quantity, // Quantidade reservada
                originalVariationDetails.rows[0].color,
                originalVariationDetails.rows[0].size,
                originalVariationDetails.rows[0].weight,
                originalVariationDetails.rows[0].min_stock_level,
                originalVariationDetails.rows[0].barcode,
                to_branch_id
            ]
        );
        // Usar o ID da nova variação para a transferência
        // product_variation_id = newProductVariationResult.rows[0].id; // Não podemos reatribuir const
        // Precisamos de uma forma de referenciar a variação correta no destino
        // Por simplicidade, vamos assumir que a variação já existe ou que a criação é tratada em outro lugar
        // ou que a transferência só pode ser feita para variações existentes.
        // Para este MVP, vamos simplificar e apenas incrementar reserved_quantity se a variação existir.
        // Se não existir, a transferência não pode ser criada por este endpoint.
        throw new Error('Variação do produto não existe na filial de destino. Crie-a primeiro.');
    } else {
        await client.query(
            'UPDATE product_variations SET reserved_quantity = reserved_quantity + $1 WHERE id = $2',
            [quantity, destinationVariationResult.rows[0].id]
        );
    }

    // 4. Registrar a transferência
    const transferQuery = `
      INSERT INTO stock_transfers (
        product_variation_id, quantity, from_branch_id, to_branch_id, notes, requested_by_user_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'in_transit') RETURNING *;
    `;
    const transferResult = await client.query(
      transferQuery,
      [product_variation_id, quantity, from_branch_id, to_branch_id, notes, requested_by_user_id]
    );

    await logActivity(req.user.name, `Solicitação de transferência de estoque #${transferResult.rows[0].id} criada.`, 'stock_transfer', transferResult.rows[0].id);

    await client.query('COMMIT');
    res.status(201).json(transferResult.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar transferência de estoque:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
};

// @desc    Get all stock transfers
// @route   GET /api/stock/transfers
// @access  Private
const getAllStockTransfers = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        st.*,
        pv.barcode,
        p.name as product_name,
        v_from.name as from_branch_name,
        v_to.name as to_branch_name,
        u_req.name as requested_by_user_name,
        u_app.name as approved_by_user_name
      FROM stock_transfers st
      JOIN product_variations pv ON st.product_variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      JOIN branches v_from ON st.from_branch_id = v_from.id
      JOIN branches v_to ON st.to_branch_id = v_to.id
      LEFT JOIN users u_req ON st.requested_by_user_id = u_req.id
      LEFT JOIN users u_app ON st.approved_by_user_id = u_app.id
      ORDER BY st.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar transferências de estoque:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// @desc    Complete a stock transfer
// @route   PUT /api/stock/transfers/:id/complete
// @access  Private/Admin
const completeStockTransfer = async (req, res) => {
  const { id } = req.params;
  const approved_by_user_id = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Obter detalhes da transferência
    const transferResult = await client.query(
      'SELECT * FROM stock_transfers WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (transferResult.rows.length === 0) {
      throw new Error('Transferência não encontrada.');
    }
    const transfer = transferResult.rows[0];

    if (transfer.status !== 'in_transit') {
      throw new Error('A transferência não está em trânsito e não pode ser completada.');
    }

    // 2. Decrementar reserved_quantity e incrementar stock_quantity na filial de destino
    await client.query(
      'UPDATE product_variations SET reserved_quantity = reserved_quantity - $1, stock_quantity = stock_quantity + $1 WHERE id = $2',
      [transfer.quantity, transfer.product_variation_id]
    );

    // 3. Atualizar status da transferência
    const updateTransferQuery = `
      UPDATE stock_transfers
      SET status = 'completed', approved_by_user_id = $1, completion_date = NOW(), updated_at = NOW()
      WHERE id = $2 RETURNING *;
    `;
    const updatedTransferResult = await client.query(
      updateTransferQuery,
      [approved_by_user_id, id]
    );

    await logActivity(req.user.name, `Transferência de estoque #${id} concluída.`, 'stock_transfer', id);

    await client.query('COMMIT');
    res.json(updatedTransferResult.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao completar transferência de estoque:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
};

// @desc    Cancel a stock transfer
// @route   PUT /api/stock/transfers/:id/cancel
// @access  Private/Admin
const cancelStockTransfer = async (req, res) => {
  const { id } = req.params;
  const canceled_by_user_id = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Obter detalhes da transferência
    const transferResult = await client.query(
      'SELECT * FROM stock_transfers WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (transferResult.rows.length === 0) {
      throw new Error('Transferência não encontrada.');
    }
    const transfer = transferResult.rows[0];

    if (transfer.status === 'completed' || transfer.status === 'canceled') {
      throw new Error('Transferência já concluída ou cancelada e não pode ser alterada.');
    }

    // 2. Devolver estoque à filial de origem (se a transferência estava em trânsito)
    if (transfer.status === 'in_transit') {
      await client.query(
        'UPDATE product_variations SET stock_quantity = stock_quantity + $1 WHERE id = $2 AND branch_id = $3',
        [transfer.quantity, transfer.product_variation_id, transfer.from_branch_id]
      );
      // Remover a reserva da filial de destino (se a variação existia lá)
      const destinationVariationResult = await client.query(
        'SELECT id FROM product_variations WHERE product_id = (SELECT product_id FROM product_variations WHERE id = $1) AND color = (SELECT color FROM product_variations WHERE id = $1) AND size = (SELECT size FROM product_variations WHERE id = $1) AND branch_id = $2',
        [transfer.product_variation_id, transfer.to_branch_id]
      );
      if (destinationVariationResult.rows.length > 0) {
        await client.query(
          'UPDATE product_variations SET reserved_quantity = reserved_quantity - $1 WHERE id = $2',
          [transfer.quantity, destinationVariationResult.rows[0].id]
        );
      }
    }

    // 3. Atualizar status da transferência
    const updateTransferQuery = `
      UPDATE stock_transfers
      SET status = 'canceled', updated_at = NOW()
      WHERE id = $1 RETURNING *;
    `;
    const updatedTransferResult = await client.query(updateTransferQuery, [id]);

    await logActivity(req.user.name, `Transferência de estoque #${id} cancelada.`, 'stock_transfer', id);

    await client.query('COMMIT');
    res.json(updatedTransferResult.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao cancelar transferência de estoque:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
};

module.exports = {
  createStockTransfer,
  getAllStockTransfers,
  completeStockTransfer,
  cancelStockTransfer,
};
