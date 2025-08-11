const db = require('../db');
const { logActivity } = require('../utils/activityLogger');

// Helper function to generate a unique gift card code
const generateUniqueCode = async () => {
  let code;
  let isUnique = false;
  while (!isUnique) {
    code = Math.random().toString(36).substring(2, 10).toUpperCase(); // 8 alphanumeric characters
    const { rows } = await db.query('SELECT id FROM gift_cards WHERE code = $1', [code]);
    if (rows.length === 0) {
      isUnique = true;
    }
  }
  return code;
};

// Criar um novo vale-presente
exports.createGiftCard = async (req, res) => {
  const { initial_value, expiry_date, customer_id } = req.body;
  const created_by_user_id = req.user.id;

  if (!initial_value || initial_value <= 0) {
    return res.status(400).json({ message: 'Valor inicial inválido.' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const code = await generateUniqueCode();

    const result = await client.query(
      'INSERT INTO gift_cards (code, initial_value, current_value, expiry_date, customer_id, created_by_user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
      [code, initial_value, initial_value, expiry_date || null, customer_id || null, created_by_user_id]
    );
    const giftCard = result.rows[0];

    // Log transaction for issuing the gift card
    await client.query(
      'INSERT INTO gift_card_transactions (gift_card_id, transaction_type, amount, user_id, notes) VALUES ($1, $2, $3, $4, $5);',
      [giftCard.id, 'issue', initial_value, created_by_user_id, 'Emissão de vale-presente']
    );

    await logActivity(req.user.name, `Vale-presente #${giftCard.id} (Código: ${code}) criado com valor de R$${initial_value}.`, 'gift_card', giftCard.id);

    await client.query('COMMIT');
    res.status(201).json(giftCard);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar vale-presente:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Obter todos os vales-presente
exports.getAllGiftCards = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT gc.*, c.name as customer_name, u.name as created_by_user_name FROM gift_cards gc LEFT JOIN customers c ON gc.customer_id = c.id LEFT JOIN users u ON gc.created_by_user_id = u.id ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar vales-presente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter um vale-presente por ID ou Código
exports.getGiftCard = async (req, res) => {
  const { id } = req.params; // Pode ser ID ou Código
  try {
    let queryText = 'SELECT gc.*, c.name as customer_name, u.name as created_by_user_name FROM gift_cards gc LEFT JOIN customers c ON gc.customer_id = c.id LEFT JOIN users u ON gc.created_by_user_id = u.id WHERE gc.id = $1 OR gc.code = $1';
    const { rows } = await db.query(queryText, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Vale-presente não encontrado.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(`Erro ao buscar vale-presente ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Resgatar (usar) um vale-presente
exports.redeemGiftCard = async (req, res) => {
  const { code, amount, sale_id } = req.body;
  const user_id = req.user.id;

  if (!code || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Código do vale-presente e valor de resgate são obrigatórios.' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT * FROM gift_cards WHERE code = $1 FOR UPDATE;',
      [code]
    );

    if (rows.length === 0) {
      throw new Error('Vale-presente não encontrado.');
    }
    const giftCard = rows[0];

    if (giftCard.status !== 'active') {
      throw new Error(`Vale-presente não está ativo. Status atual: ${giftCard.status}.`);
    }
    if (giftCard.expiry_date && new Date(giftCard.expiry_date) < new Date()) {
      throw new Error('Vale-presente expirado.');
    }
    if (giftCard.current_value < amount) {
      throw new Error(`Saldo insuficiente. Saldo atual: R$${giftCard.current_value}.`);
    }

    const newCurrentValue = giftCard.current_value - amount;
    let newStatus = giftCard.status;
    if (newCurrentValue === 0) {
      newStatus = 'redeemed'; // Totalmente resgatado
    }

    await client.query(
      'UPDATE gift_cards SET current_value = $1, status = $2, updated_at = NOW() WHERE id = $3;',
      [newCurrentValue, newStatus, giftCard.id]
    );

    // Log transaction for redemption
    await client.query(
      'INSERT INTO gift_card_transactions (gift_card_id, transaction_type, amount, sale_id, user_id, notes) VALUES ($1, $2, $3, $4, $5, $6);',
      [giftCard.id, 'redeem', amount, sale_id || null, user_id, `Resgate de R$${amount} para venda #${sale_id || 'N/A'}`]
    );

    await logActivity(req.user.name, `Vale-presente #${giftCard.id} (Código: ${code}) resgatado em R$${amount}. Saldo restante: R$${newCurrentValue}.`, 'gift_card', giftCard.id);

    await client.query('COMMIT');
    res.status(200).json({ message: 'Vale-presente resgatado com sucesso!', newBalance: newCurrentValue });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao resgatar vale-presente:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Atualizar status ou valor de um vale-presente (para administração)
exports.updateGiftCard = async (req, res) => {
  const { id } = req.params;
  const { current_value, status, expiry_date, customer_id } = req.body;
  const user_id = req.user.id;

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT * FROM gift_cards WHERE id = $1 FOR UPDATE;',
      [id]
    );
    if (rows.length === 0) {
      throw new Error('Vale-presente não encontrado.');
    }
    const oldGiftCard = rows[0];

    let updateQuery = 'UPDATE gift_cards SET updated_at = NOW()';
    const queryParams = [];
    let paramIndex = 1;

    if (current_value !== undefined && current_value !== oldGiftCard.current_value) {
      updateQuery += `, current_value = $${paramIndex++}`;
      queryParams.push(current_value);
      // Log top-up/adjustment transaction
      const transactionType = current_value > oldGiftCard.current_value ? 'top_up' : 'adjustment';
      const amountChange = current_value - oldGiftCard.current_value;
      await client.query(
        'INSERT INTO gift_card_transactions (gift_card_id, transaction_type, amount, user_id, notes) VALUES ($1, $2, $3, $4, $5);',
        [id, transactionType, amountChange, user_id, `Ajuste de valor de R$${oldGiftCard.current_value} para R$${current_value}`]
      );
    }
    if (status !== undefined && status !== oldGiftCard.status) {
      updateQuery += `, status = $${paramIndex++}`;
      queryParams.push(status);
    }
    if (expiry_date !== undefined && expiry_date !== oldGiftCard.expiry_date) {
      updateQuery += `, expiry_date = $${paramIndex++}`;
      queryParams.push(expiry_date);
    }
    if (customer_id !== undefined && customer_id !== oldGiftCard.customer_id) {
        updateQuery += `, customer_id = $${paramIndex++}`;
        queryParams.push(customer_id);
    }

    updateQuery += ` WHERE id = $${paramIndex++}`;
    queryParams.push(id);

    await client.query(updateQuery, queryParams);

    await logActivity(req.user.name, `Vale-presente #${id} atualizado.`, 'gift_card', id);

    await client.query('COMMIT');
    res.status(200).json({ message: 'Vale-presente atualizado com sucesso!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar vale-presente:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Obter histórico de transações de um vale-presente
exports.getGiftCardTransactions = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      'SELECT gct.*, u.name as user_name, s.sale_date FROM gift_card_transactions gct JOIN users u ON gct.user_id = u.id LEFT JOIN sales s ON gct.sale_id = s.id WHERE gct.gift_card_id = $1 ORDER BY gct.transaction_date DESC;',
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error(`Erro ao buscar histórico de transações para o vale-presente ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
