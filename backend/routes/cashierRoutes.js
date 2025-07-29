const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const cors = require('cors'); // Importar cors

// Rota para abrir um novo caixa
router.post('/open', cors(), [
    body('userId').isInt({ gt: 0 }).withMessage('ID do usuário inválido.'),
    body('opening_balance').isFloat({ gt: -1 }).withMessage('Saldo de abertura deve ser um número.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { opening_balance, userId } = req.body;
    console.log('Recebido para abrir caixa:', { opening_balance, userId });

    try {
        const existingSession = await db.query('SELECT * FROM cash_sessions WHERE user_id = $1 AND status = $2', [userId, 'open']);
        if (existingSession.rows.length > 0) {
            return res.status(400).json({ msg: 'Já existe um caixa aberto para este usuário.' });
        }

        const newSession = await db.query(
            'INSERT INTO cash_sessions (user_id, opening_balance, status) VALUES ($1, $2, $3) RETURNING *'
            , [userId, opening_balance, 'open']
        );
        res.status(201).json({ msg: 'Caixa aberto com sucesso!', session: newSession.rows[0] });
    } catch (err) {
        console.error('Erro ao abrir o caixa:', err);
        res.status(500).json({ msg: 'Erro interno do servidor.' });
    }
});

// Rota para verificar o status do caixa do usuário logado
router.get('/status', cors(), async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ msg: 'ID do usuário é obrigatório.' });
    }
    try {
        const session = await db.query('SELECT * FROM cash_sessions WHERE user_id = $1 AND status = $2 ORDER BY opened_at DESC LIMIT 1', [userId, 'open']);
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

// Rota para o fechamento de caixa cego
router.post('/close', [
    body('userId').isInt({ gt: 0 }),
    body('notes').optional().isString(),
    body('countedValues').isArray({ min: 1 }).withMessage('Valores contados são obrigatórios.'),
    body('countedValues.*.payment_method_id').isInt({ gt: 0 }),
    body('countedValues.*.counted_amount').isFloat({ gt: -1 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, notes, countedValues } = req.body;
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const sessionRes = await client.query('SELECT * FROM cash_sessions WHERE user_id = $1 AND status = $2 ORDER BY opened_at DESC LIMIT 1', [userId, 'open']);
        if (sessionRes.rows.length === 0) {
            throw new Error('Nenhum caixa aberto encontrado para este usuário.');
        }
        const session = sessionRes.rows[0];

        const salesQuery = `
            SELECT sp.payment_method, COALESCE(SUM(sp.amount), 0) as total
            FROM sale_payments sp
            JOIN sales s ON sp.sale_id = s.id
            WHERE s.user_id = $1 AND s.sale_date >= $2
            GROUP BY sp.payment_method;
        `;
        const salesRes = await client.query(salesQuery, [userId, session.opened_at]);
        const systemTotals = new Map(salesRes.rows.map(r => [r.payment_method, parseFloat(r.total)]));
        
        // Adiciona o saldo inicial ao método 'Dinheiro'
        const cashName = 'Dinheiro';
        const openingBalance = parseFloat(session.opening_balance);
        systemTotals.set(cashName, (systemTotals.get(cashName) || 0) + openingBalance);

        const allPaymentMethodsRes = await client.query('SELECT id, name FROM payment_methods');
        const paymentMethodsMap = new Map(allPaymentMethodsRes.rows.map(pm => [pm.id, pm.name]));

        let totalDiscrepancy = 0;
        const closingDetails = countedValues.map(cv => {
            const paymentMethodName = paymentMethodsMap.get(cv.payment_method_id);
            const systemAmount = systemTotals.get(paymentMethodName) || 0;
            const countedAmount = parseFloat(cv.counted_amount);
            const discrepancy = countedAmount - systemAmount;
            totalDiscrepancy += discrepancy;
            return { ...cv, system_amount: systemAmount, discrepancy };
        });

        const closingRes = await client.query(
            'INSERT INTO cash_drawer_closings (cash_session_id, closed_by_user_id, total_discrepancy, notes) VALUES ($1, $2, $3, $4) RETURNING id',
            [session.id, userId, totalDiscrepancy, notes]
        );
        const closingId = closingRes.rows[0].id;

        for (const detail of closingDetails) {
            await client.query(
                'INSERT INTO cash_drawer_closing_details (cash_drawer_closing_id, payment_method_id, counted_amount, system_amount, discrepancy) VALUES ($1, $2, $3, $4, $5)',
                [closingId, detail.payment_method_id, detail.counted_amount, detail.system_amount, detail.discrepancy]
            );
        }

        const closingBalance = closingDetails.reduce((sum, d) => sum + d.counted_amount, 0);
        await client.query(
            "UPDATE cash_sessions SET status = 'closed', closed_at = NOW(), closing_balance = $1, calculated_balance = $2, difference = $3 WHERE id = $4",
            [closingBalance, closingBalance - totalDiscrepancy, totalDiscrepancy, session.id]
        );

        await client.query('COMMIT');

        res.json({
            message: 'Caixa fechado com sucesso!',
            report: {
                closingId,
                openingBalance,
                totalDiscrepancy,
                details: closingDetails.map(d => ({...d, payment_method_name: paymentMethodsMap.get(d.payment_method_id)}))
            }
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
