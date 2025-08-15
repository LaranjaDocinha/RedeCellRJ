const db = require('../db');

// Placeholder para abrir o caixa
exports.openCashier = async (req, res) => {
    const { userId, opening_balance } = req.body;
    try {
        const { rows } = await db.query('INSERT INTO cash_sessions (user_id, opening_balance) VALUES ($1, $2) RETURNING *;', [userId, opening_balance]);
        res.status(201).json({ message: 'Caixa aberto com sucesso!', session: rows[0] });
    } catch (error) {
        console.error('Erro ao abrir caixa:', error);
        res.status(500).json({ message: 'Erro ao abrir caixa' });
    }
};

exports.closeCashier = async (req, res) => {
    const { userId, closing_balance, notes } = req.body;

    if (closing_balance === undefined || closing_balance === null) {
        return res.status(400).json({ message: 'Saldo de fechamento é obrigatório.' });
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // 1. Find the open cash session for the user
        const sessionRes = await client.query(
            'SELECT id, opening_balance, opened_at FROM cash_sessions WHERE user_id = $1 AND status = \'open\' ORDER BY opened_at DESC LIMIT 1',
            [userId]
        );

        if (sessionRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Nenhuma sessão de caixa aberta encontrada para este usuário.' });
        }

        const session = sessionRes.rows[0];

        // 2. Calculate total cash sales since the cashier was opened
        const salesRes = await client.query(
            `SELECT COALESCE(SUM(total_amount), 0) as total_cash_sales 
             FROM sales 
             WHERE user_id = $1 AND sale_date >= $2 AND payment_method = 'Dinheiro'`,
            [userId, session.opened_at]
        );
        
        const totalCashSales = parseFloat(salesRes.rows[0].total_cash_sales);
        const openingBalance = parseFloat(session.opening_balance);

        // 3. Calculate the expected balance and the difference
        const calculatedBalance = openingBalance + totalCashSales;
        const difference = parseFloat(closing_balance) - calculatedBalance;

        // 4. Update the cash session with the closing data
        const updateRes = await client.query(
            `UPDATE cash_sessions 
             SET 
                closing_balance = $1, 
                calculated_balance = $2,
                difference = $3,
                notes = $4, 
                status = 'closed', 
                closed_at = NOW() 
             WHERE id = $5 
             RETURNING *`,
            [closing_balance, calculatedBalance, difference, notes, session.id]
        );

        await client.query('COMMIT');

        res.status(200).json({
            message: 'Caixa fechado com sucesso!',
            session: updateRes.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao fechar caixa:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao fechar o caixa.' });
    } finally {
        client.release();
    }
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
