const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware para simular um usuário autenticado (substituir por autenticação real)
const authenticateMock = (req, res, next) => {
  req.user = { id: 1 }; // Simulando que o usuário com ID 1 está logado
  next();
};

// Rota para abrir um novo caixa
router.post('/open', authenticateMock, async (req, res) => {
  const { opening_balance } = req.body;
  const userId = req.user.id;

  if (opening_balance === undefined || isNaN(parseFloat(opening_balance))) {
    return res.status(400).json({ msg: 'Saldo de abertura é obrigatório e deve ser um número.' });
  }

  try {
    // 1. Verificar se já existe um caixa aberto para este usuário
    const existingSession = await db.query(
      'SELECT * FROM cash_sessions WHERE user_id = $1 AND status = $2',
      [userId, 'open']
    );

    if (existingSession.rows.length > 0) {
      return res.status(400).json({ msg: 'Já existe um caixa aberto para este usuário.' });
    }

    // 2. Inserir a nova sessão de caixa
    const newSession = await db.query(
      'INSERT INTO cash_sessions (user_id, opening_balance, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, opening_balance, 'open']
    );

    res.status(201).json({
      msg: 'Caixa aberto com sucesso!',
      session: newSession.rows[0],
    });
  } catch (err) {
    console.error('Erro ao abrir o caixa:', err);
    res.status(500).json({ msg: 'Erro interno do servidor.' });
  }
});

// Rota para verificar o status do caixa do usuário logado
router.get('/status', authenticateMock, async (req, res) => {
  const userId = req.user.id;
  try {
    const session = await db.query(
      'SELECT * FROM cash_sessions WHERE user_id = $1 AND status = $2 ORDER BY opened_at DESC LIMIT 1',
      [userId, 'open']
    );

    if (session.rows.length > 0) {
      res.json({ isOpen: true, session: session.rows[0] });
    } else {
      res.json({ isOpen: false, session: null });
    }
  } catch (err) {
    console.error('Erro ao verificar status do caixa:', err);
    res.status(500).json({ msg: 'Erro interno do servidor.' });
  }
});

// Rota para fechar o caixa
router.post('/close', authenticateMock, async (req, res) => {
  const { closing_balance, notes } = req.body; // Valor contado na gaveta
  const userId = req.user.id;

  if (closing_balance === undefined || isNaN(parseFloat(closing_balance))) {
    return res.status(400).json({ msg: 'Saldo de fechamento é obrigatório.' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // 1. Encontrar a sessão aberta
    const sessionRes = await client.query(
      'SELECT * FROM cash_sessions WHERE user_id = $1 AND status = $2 FOR UPDATE',
      [userId, 'open']
    );
    if (sessionRes.rows.length === 0) {
      throw new Error('Nenhum caixa aberto encontrado para este usuário.');
    }
    const session = sessionRes.rows[0];

    // 2. Calcular o total de vendas desde a abertura do caixa
    const salesTotalRes = await client.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_sales
       FROM sales
       WHERE created_at >= $1`,
      [session.opened_at]
    );
    const totalSales = parseFloat(salesTotalRes.rows[0].total_sales);

    // 3. Calcular o valor esperado no caixa
    const openingBalance = parseFloat(session.opening_balance);
    const calculatedBalance = openingBalance + totalSales; // Futuramente, subtrair despesas
    const difference = parseFloat(closing_balance) - calculatedBalance;

    // 4. Atualizar a sessão de caixa com os valores de fechamento
    const updatedSession = await client.query(
      `UPDATE cash_sessions
       SET closing_balance = $1,
           calculated_balance = $2,
           difference = $3,
           closed_at = NOW(),
           status = 'closed',
           notes = $4
       WHERE id = $5
       RETURNING *`,
      [closing_balance, calculatedBalance, difference, notes, session.id]
    );

    await client.query('COMMIT');
    res.json({
      msg: 'Caixa fechado com sucesso!',
      session: updatedSession.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao fechar o caixa:', err);
    res.status(500).json({ msg: err.message || 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
});

module.exports = router;
