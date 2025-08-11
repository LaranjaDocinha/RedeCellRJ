const db = require('../db');

// Placeholder para abrir o caixa
exports.openCashier = async (req, res) => {
    const { userId, openingBalance } = req.body;
    try {
        const { rows } = await db.query('INSERT INTO cash_sessions (user_id, opening_balance) VALUES ($1, $2) RETURNING *;', [userId, openingBalance]);
        res.status(201).json({ message: 'Caixa aberto com sucesso!', session: rows[0] });
    } catch (error) {
        console.error('Erro ao abrir caixa:', error);
        res.status(500).json({ message: 'Erro ao abrir caixa' });
    }
};

// Placeholder para fechar o caixa
exports.closeCashier = async (req, res) => {
    res.status(501).json({ message: 'Funcionalidade de fechar caixa ainda não implementada.' });
};

// Placeholder para obter o status do caixa
exports.getCashierStatus = async (req, res) => {
    try {
        const { userId } = req.query;
        const { rows } = await db.query('SELECT * FROM cash_sessions WHERE user_id = $1 AND closed_at IS NULL ORDER BY opened_at DESC LIMIT 1', [userId]);
        if (rows.length > 0) {
            res.json({ isOpen: true, ...rows[0] });
        } else {
            res.json({ isOpen: false });
        }
    } catch (error) {
        console.error('Erro ao obter status do caixa:', error);
        res.status(500).json({ message: 'Erro ao obter status do caixa' });
    }
};

// Placeholder para obter o resumo do caixa atual
exports.getCashierSummary = async (req, res) => {
    res.status(501).json({ message: 'Funcionalidade de obter resumo do caixa ainda não implementada.' });
};
