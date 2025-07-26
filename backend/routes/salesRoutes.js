const express = require('express');
const db = require('../db');
const router = express.Router();

// Middleware de autenticação (provisório)
const authMiddleware = (req, res, next) => {
    req.user = { id: 1 }; // Simula um usuário logado. Substituir por validação de token JWT.
    next();
};

// Rota para criar uma nova venda ou devolução
router.post('/', authMiddleware, async (req, res) => {
    const { customer_id, items, payments, sale_discount = { type: null, value: 0 }, notes, original_sale_id } = req.body;
    const user_id = req.user.id;

    if (!items || items.length === 0) {
        console.error('Validation Error: Itens são obrigatórios.');
        return res.status(400).json({ message: 'Itens são obrigatórios.' });
    }
    // Em uma devolução, o pagamento pode não ser obrigatório (gerar crédito, etc)
    if (!original_sale_id && (!payments || payments.length === 0)) {
        console.error('Validation Error: Pagamento é obrigatório para vendas.');
        return res.status(400).json({ message: 'Pagamento é obrigatório para vendas.' });
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const isReturn = !!original_sale_id;
        const saleType = isReturn ? 'return' : 'sale';
        const stockChangeMultiplier = isReturn ? 1 : -1; // Adiciona no retorno, subtrai na venda

        // 1. Calcular subtotal e verificar estoque (apenas para vendas)
        let subtotal = 0;
        for (const item of items) {
            const variationResult = await client.query(
                'SELECT price, stock_quantity FROM product_variations WHERE id = $1 FOR UPDATE',
                [item.variation_id]
            );

            if (variationResult.rows.length === 0) throw new Error(`Produto com ID de variação ${item.variation_id} não encontrado.`);
            
            const variation = variationResult.rows[0];
            // Para vendas, checa se há estoque. Para devoluções, não é necessário.
            if (!isReturn && variation.stock_quantity < item.quantity) {
                const errorMessage = `Estoque insuficiente para o produto ${item.product_name}.`;
                console.error('Validation Error:', errorMessage);
                return res.status(400).json({ message: errorMessage });
            }

            let item_price = parseFloat(item.unit_price); // Usa o preço do item no carrinho
            if (item.discount && item.discount.value > 0) {
                if (item.discount.type === 'percentage') {
                    item_price -= item_price * (parseFloat(item.discount.value) / 100);
                } else { // fixed
                    item_price -= parseFloat(item.discount.value);
                }
            }
            subtotal += item_price * item.quantity;
        }

        // 2. Calcular desconto geral e total final
        let total_amount = subtotal;
        if (sale_discount && sale_discount.value > 0) {
            if (sale_discount.type === 'percentage') {
                total_amount -= total_amount * (parseFloat(sale_discount.value) / 100);
            } else { // fixed
                total_amount -= parseFloat(sale_discount.value);
            }
        }

        // 3. Validar pagamentos (apenas para vendas)
        const total_paid = payments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
        if (!isReturn && total_paid < total_amount) {
            const errorMessage = `Valor pago (R$ ${total_paid.toFixed(2)}) é menor que o total da venda (R$ ${total_amount.toFixed(2)}).`;
            console.error('Validation Error:', errorMessage);
            return res.status(400).json({ message: errorMessage });
        }

        // 4. Inserir a transação na tabela 'sales'
        const saleResult = await client.query(
            'INSERT INTO sales (customer_id, user_id, subtotal, discount_type, discount_value, total_amount, notes, sale_type, original_sale_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, sale_date',
            [customer_id, user_id, subtotal, sale_discount.type, sale_discount.value, total_amount, notes, saleType, original_sale_id]
        );
        const newSale = saleResult.rows[0];

        // 5. Inserir os itens e atualizar estoque
        for (const item of items) {
            await client.query(
                'INSERT INTO sale_items (sale_id, variation_id, quantity, unit_price, discount_type, discount_value) VALUES ($1, $2, $3, $4, $5, $6)',
                [newSale.id, item.variation_id, item.quantity, item.unit_price, item.discount?.type, item.discount?.value]
            );
            // Atualiza o estoque: subtrai para venda, adiciona para devolução
            await client.query(
                'UPDATE product_variations SET stock_quantity = stock_quantity + ($1) WHERE id = $2',
                [item.quantity * stockChangeMultiplier, item.variation_id]
            );
            // Registra no histórico de estoque
            await client.query(
                'INSERT INTO stock_history (variation_id, user_id, change_type, quantity_change, reason) VALUES ($1, $2, $3, $4, $5)',
                [item.variation_id, user_id, saleType, item.quantity * stockChangeMultiplier, `${isReturn ? 'Devolução da Venda' : 'Venda'} ID: ${isReturn ? original_sale_id : newSale.id}`]
            );
        }
        
        // 6. Inserir os pagamentos
        for (const payment of payments) {
            await client.query(
                'INSERT INTO sale_payments (sale_id, payment_method, amount) VALUES ($1, $2, $3)',
                [newSale.id, payment.method, payment.amount]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            message: `${isReturn ? 'Devolução' : 'Venda'} registrada com sucesso!`,
            sale_id: newSale.id,
            total_amount: total_amount.toFixed(2),
            total_paid: total_paid.toFixed(2),
            change: (total_paid - total_amount).toFixed(2)
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao registrar transação:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao registrar a transação.', error: error.message });
    } finally {
        client.release();
    }
});

// Rota para obter métodos de pagamento
router.get('/payment-methods', async (req, res) => {
    try {
        const result = await db.query('SELECT id, name FROM payment_methods WHERE is_active = TRUE ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar métodos de pagamento:', err.message);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar métodos de pagamento.' });
    }
});

// Rota para obter histórico de vendas
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const { limit = 10, offset = 0, customer_id, start_date, end_date, _sort = 'sale_date', _order = 'desc' } = req.query;
        let queryParams = [limit, offset];
        let whereClauses = [];
        let paramIndex = 3; // Start from $3 as $1 and $2 are for limit and offset

        let baseQuery = `
            SELECT
                s.id,
                s.sale_date,
                s.total_amount,
                s.discount_type,
                s.discount_value,
                s.notes,
                c.name AS customer_name,
                u.name AS user_name,
                (
                    SELECT json_agg(
                        json_build_object(
                            'item_id', si.id,
                            'product_name', p.name,
                            'color', pv.color,
                            'barcode', pv.barcode,
                            'quantity', si.quantity,
                            'unit_price', si.unit_price,
                            'discount_type', si.discount_type,
                            'discount_value', si.discount_value
                        )
                    )
                    FROM sale_items si
                    JOIN product_variations pv ON si.variation_id = pv.id
                    JOIN products p ON pv.product_id = p.id
                    WHERE si.sale_id = s.id
                ) AS items,
                (
                    SELECT json_agg(
                        json_build_object(
                            'payment_id', sp.id,
                            'method', sp.payment_method,
                            'amount', sp.amount
                        )
                    )
                    FROM sale_payments sp
                    WHERE sp.sale_id = s.id
                ) AS payments
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN users u ON s.user_id = u.id
        `;

        let countQuery = `SELECT COUNT(*) FROM sales s LEFT JOIN customers c ON s.customer_id = c.id LEFT JOIN users u ON s.user_id = u.id`;

        if (customer_id) {
            whereClauses.push(`s.customer_id = ${paramIndex++}`);
            queryParams.push(customer_id);
        }
        if (start_date) {
            whereClauses.push(`s.sale_date >= ${paramIndex++}`);
            queryParams.push(start_date);
        }
        if (end_date) {
            whereClauses.push(`s.sale_date <= ${paramIndex++}`);
            queryParams.push(end_date);
        }

        if (whereClauses.length > 0) {
            baseQuery += ` WHERE ` + whereClauses.join(' AND ');
            countQuery += ` WHERE ` + whereClauses.join(' AND ');
        }

        baseQuery += ` ORDER BY s.${_sort} ${_order} LIMIT $1 OFFSET $2`;

        const salesResult = await db.query(baseQuery, queryParams);
        const totalSalesResult = await db.query(countQuery, queryParams.slice(2)); // Exclude limit and offset for count query

        res.json({
            sales: salesResult.rows,
            total: parseInt(totalSalesResult.rows[0].count),
        });

    } catch (err) {
        console.error('Erro ao buscar histórico de vendas:', err.message);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar histórico de vendas.', error: err.message });
    }
});

// Rota para obter detalhes de uma única venda por ID
router.get('/detail/:id', authMiddleware, async (req, res) => {
    const client = await db.getClient();
    try {
        const { id } = req.params;

        const baseQuery = `
            SELECT
                s.id,
                s.sale_date,
                s.subtotal,
                s.discount_type,
                s.discount_value,
                s.total_amount,
                s.notes,
                c.name AS customer_name,
                c.email AS customer_email,
                c.phone AS customer_phone,
                u.name AS user_name,
                (
                    SELECT json_agg(
                        json_build_object(
                            'item_id', si.id,
                            'product_name', p.name,
                            'color', pv.color,
                            'barcode', pv.barcode,
                            'quantity', si.quantity,
                            'unit_price', si.unit_price,
                            'discount_type', si.discount_type,
                            'discount_value', si.discount_value
                        )
                    )
                    FROM sale_items si
                    JOIN product_variations pv ON si.variation_id = pv.id
                    JOIN products p ON pv.product_id = p.id
                    WHERE si.sale_id = s.id
                ) AS items,
                (
                    SELECT json_agg(
                        json_build_object(
                            'payment_id', sp.id,
                            'method', sp.payment_method,
                            'amount', sp.amount
                        )
                    )
                    FROM sale_payments sp
                    WHERE sp.sale_id = s.id
                ) AS payments
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.id = $1
        `;

        const saleResult = await client.query(baseQuery, [id]);

        if (saleResult.rows.length === 0) {
            return res.status(404).json({ message: 'Venda não encontrada.' });
        }

        res.json(saleResult.rows[0]);

    } catch (err) {
        console.error('Erro ao buscar detalhes da venda:', err.message);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar detalhes da venda.', error: err.message });
    } finally {
        client.release(); // Ensure client is released
    }
});

// Rota para buscar vendas por método de pagamento e período (para drill-down do dashboard)
router.get('/by-payment-method', authMiddleware, async (req, res) => {
    const { paymentMethod, startDate, endDate } = req.query;

    if (!paymentMethod || !startDate || !endDate) {
        return res.status(400).json({ message: 'Todos os parâmetros (paymentMethod, startDate, endDate) são obrigatórios.' });
    }

    try {
        const query = `
            SELECT
                s.id,
                s.sale_date,
                s.total_amount,
                c.name as customer_name,
                u.name as user_name
            FROM sales s
            JOIN sale_payments sp ON s.id = sp.sale_id
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN users u ON s.user_id = u.id
            WHERE
                sp.payment_method = $1
                AND s.sale_date BETWEEN $2 AND $3
            ORDER BY s.sale_date DESC;
        `;
        const { rows } = await db.query(query, [paymentMethod, startDate, endDate]);
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar vendas por método de pagamento:', err.message);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota para buscar vendas por usuário e período (para drill-down do dashboard)
router.get('/by-user', authMiddleware, async (req, res) => {
    const { userId, startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
        return res.status(400).json({ message: 'Todos os parâmetros (userId, startDate, endDate) são obrigatórios.' });
    }

    try {
        const query = `
            SELECT
                s.id,
                s.sale_date,
                s.total_amount,
                c.name as customer_name,
                u.name as user_name
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            JOIN users u ON s.user_id = u.id
            WHERE
                s.user_id = $1
                AND s.sale_date BETWEEN $2 AND $3
            ORDER BY s.sale_date DESC;
        `;
        const { rows } = await db.query(query, [userId, startDate, endDate]);
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar vendas por usuário:', err.message);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

module.exports = router;
