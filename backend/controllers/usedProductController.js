const db = require('../db');
const { logActivity } = require('../utils/activityLogger');

// Obter todos os produtos seminovos
exports.getAllUsedProducts = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT up.*, c.name as category_name FROM used_products up LEFT JOIN categories c ON up.category_id = c.id ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar produtos seminovos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter um produto seminovo por ID
exports.getUsedProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT up.*, c.name as category_name FROM used_products up LEFT JOIN categories c ON up.category_id = c.id WHERE up.id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produto seminovo não encontrado.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(`Erro ao buscar produto seminovo ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar um novo produto seminovo
exports.createUsedProduct = async (req, res) => {
  const { product_name, description, category_id, serial_number, condition, acquisition_price, sale_price, current_stock, branch_id } = req.body;
  const user_id = req.user.id; // Assuming user_id from auth token

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      'INSERT INTO used_products (product_name, description, category_id, serial_number, condition, acquisition_price, sale_price, current_stock, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;',
      [product_name, description, category_id || null, serial_number || null, condition, acquisition_price, sale_price || null, current_stock, branch_id]
    );
    const usedProductId = result.rows[0].id;

    // Log the initial stock as a transaction (purchase from unknown source or initial entry)
    if (current_stock > 0) {
        await client.query(
            'INSERT INTO used_product_transactions (used_product_id, transaction_type, quantity, price, user_id, notes) VALUES ($1, $2, $3, $4, $5, $6);',
            [usedProductId, 'initial_stock', current_stock, acquisition_price, user_id, 'Estoque inicial na criação do produto']
        );
    }

    await logActivity(req.user.name, `Produto seminovo #${usedProductId} (${product_name}) criado.`, 'used_product', usedProductId);

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar produto seminovo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Atualizar um produto seminovo
exports.updateUsedProduct = async (req, res) => {
  const { id } = req.params;
  const { product_name, description, category_id, serial_number, condition, acquisition_price, sale_price, current_stock, branch_id, is_available } = req.body;

  try {
    const result = await db.query(
      'UPDATE used_products SET product_name = $1, description = $2, category_id = $3, serial_number = $4, condition = $5, acquisition_price = $6, sale_price = $7, current_stock = $8, branch_id = $9, is_available = $10, updated_at = NOW() WHERE id = $11 RETURNING *;',
      [product_name, description, category_id || null, serial_number || null, condition, acquisition_price, sale_price || null, current_stock, branch_id, is_available, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produto seminovo não encontrado.' });
    }

    await logActivity(req.user.name, `Produto seminovo #${id} (${product_name}) atualizado.`, 'used_product', id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Erro ao atualizar produto seminovo ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar um produto seminovo
exports.deleteUsedProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM used_products WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Produto seminovo não encontrado.' });
    }

    await logActivity(req.user.name, `Produto seminovo #${id} deletado.`, 'used_product', id);
    res.status(204).send();
  } catch (error) {
    console.error(`Erro ao deletar produto seminovo ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Registrar a compra de um produto seminovo de um cliente
exports.purchaseUsedProductFromCustomer = async (req, res) => {
  const { used_product_id, quantity, price, customer_id, notes } = req.body;
  const user_id = req.user.id;

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Atualizar estoque do produto seminovo
    const productUpdateResult = await client.query(
      'UPDATE used_products SET current_stock = current_stock + $1, updated_at = NOW() WHERE id = $2 RETURNING product_name;',
      [quantity, used_product_id]
    );

    if (productUpdateResult.rows.length === 0) {
      throw new Error('Produto seminovo não encontrado.');
    }
    const productName = productUpdateResult.rows[0].product_name;

    // Registrar a transação de compra
    await client.query(
      'INSERT INTO used_product_transactions (used_product_id, transaction_type, quantity, price, customer_id, user_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7);',
      [used_product_id, 'purchase_from_customer', quantity, price, customer_id || null, user_id, notes]
    );

    await logActivity(req.user.name, `Compra de ${quantity} unidade(s) do produto seminovo #${used_product_id} (${productName}) do cliente #${customer_id}.`, 'used_product_transaction', used_product_id);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Compra de produto seminovo registrada com sucesso!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao registrar compra de produto seminovo:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
};

// Registrar a venda de um produto seminovo para um cliente
exports.sellUsedProductToCustomer = async (req, res) => {
  const { used_product_id, quantity, price, customer_id, notes } = req.body;
  const user_id = req.user.id;

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Verificar estoque disponível
    const productResult = await client.query(
      'SELECT product_name, current_stock FROM used_products WHERE id = $1 FOR UPDATE;',
      [used_product_id]
    );
    if (productResult.rows.length === 0) {
      throw new Error('Produto seminovo não encontrado.');
    }
    const { product_name, current_stock } = productResult.rows[0];

    if (current_stock < quantity) {
      throw new Error(`Estoque insuficiente. Apenas ${current_stock} unidades disponíveis.`);
    }

    // Atualizar estoque do produto seminovo
    await client.query(
      'UPDATE used_products SET current_stock = current_stock - $1, updated_at = NOW() WHERE id = $2;',
      [quantity, used_product_id]
    );

    // Registrar a transação de venda
    await client.query(
      'INSERT INTO used_product_transactions (used_product_id, transaction_type, quantity, price, customer_id, user_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7);',
      [used_product_id, 'sale_to_customer', quantity, price, customer_id, user_id, notes]
    );

    await logActivity(req.user.name, `Venda de ${quantity} unidade(s) do produto seminovo #${used_product_id} (${product_name}) para o cliente #${customer_id}.`, 'used_product_transaction', used_product_id);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Venda de produto seminovo registrada com sucesso!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao registrar venda de produto seminovo:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
};

// Obter histórico de transações de um produto seminovo
exports.getUsedProductTransactions = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      'SELECT upt.*, u.name as user_name, c.name as customer_name FROM used_product_transactions upt JOIN users u ON upt.user_id = u.id LEFT JOIN customers c ON upt.customer_id = c.id WHERE upt.used_product_id = $1 ORDER BY upt.transaction_date DESC;',
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error(`Erro ao buscar histórico de transações para o produto seminovo ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
