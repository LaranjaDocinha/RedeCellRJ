const db = require('../db');

// POST /api/purchase-orders - Criar uma nova ordem de compra
exports.createPurchaseOrder = async (req, res) => {
    const { supplier_id, expected_delivery_date, notes, items } = req.body;
    const user_id = req.user.id;

    if (!supplier_id || !items || items.length === 0) {
        return res.status(400).json({ message: 'Fornecedor e itens são obrigatórios.' });
    }

    const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.cost_price), 0);

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const purchaseOrderResult = await client.query(
            `INSERT INTO purchase_orders (supplier_id, user_id, expected_delivery_date, notes, total_amount, status)
             VALUES ($1, $2, $3, $4, $5, 'Pendente') RETURNING *`,
            [supplier_id, user_id, expected_delivery_date, notes, total_amount]
        );
        const newOrder = purchaseOrderResult.rows[0];

        for (const item of items) {
            await client.query(
                `INSERT INTO purchase_order_items (purchase_order_id, variation_id, quantity, cost_price)
                 VALUES ($1, $2, $3, $4)`,
                [newOrder.id, item.variation_id, item.quantity, item.cost_price]
            );
        }

        await client.query('COMMIT');
        res.status(201).json(newOrder);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao criar ordem de compra:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        client.release();
    }
};

// GET /api/purchase-orders - Listar todas as ordens de compra
exports.getAllPurchaseOrders = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT po.*, s.name as supplier_name
            FROM purchase_orders po
            JOIN suppliers s ON po.supplier_id = s.id
            ORDER BY po.order_date DESC
        `);
        res.json({ purchaseOrders: result.rows });
    } catch (err) {
        console.error('Erro ao listar ordens de compra:', err.message);
        res.status(500).send('Erro do Servidor');
    }
};

// GET /api/purchase-orders/:id - Obter detalhes de uma ordem de compra
exports.getPurchaseOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const orderResult = await db.query('SELECT * FROM purchase_orders WHERE id = $1', [id]);
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Ordem de compra não encontrada.' });
        }
        const itemsResult = await db.query(
            `SELECT poi.*, p.name as product_name, pv.color 
             FROM purchase_order_items poi
             JOIN product_variations pv ON poi.variation_id = pv.id
             JOIN products p ON pv.product_id = p.id
             WHERE poi.purchase_order_id = $1`,
            [id]
        );
        res.json({ order: orderResult.rows[0], items: itemsResult.rows });
    } catch (err) {
        console.error('Erro ao buscar ordem de compra:', err.message);
        res.status(500).send('Erro do Servidor');
    }
};

// PUT /api/purchase-orders/:id - Atualizar uma ordem de compra
exports.updatePurchaseOrder = async (req, res) => {
    const { id } = req.params;
    const { supplier_id, expected_delivery_date, notes, status, items } = req.body;
    const user_id = req.user.id;

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // Atualiza os dados da ordem de compra
        const updateOrderResult = await client.query(
            `UPDATE purchase_orders SET supplier_id = $1, expected_delivery_date = $2, notes = $3, status = $4, updated_at = NOW()
             WHERE id = $5 RETURNING *`,
            [supplier_id, expected_delivery_date, notes, status, id]
        );

        if (updateOrderResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Ordem de compra não encontrada.' });
        }

        // Atualiza os itens da ordem de compra (exemplo: deleta e recria ou atualiza)
        // Para simplificar, vamos deletar todos os itens existentes e reinserir os novos
        await client.query('DELETE FROM purchase_order_items WHERE purchase_order_id = $1', [id]);

        if (items && items.length > 0) {
            for (const item of items) {
                await client.query(
                    `INSERT INTO purchase_order_items (purchase_order_id, variation_id, quantity, cost_price)
                     VALUES ($1, $2, $3, $4)`,
                    [id, item.variation_id, item.quantity, item.cost_price]
                );
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Ordem de compra atualizada com sucesso!', order: updateOrderResult.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao atualizar ordem de compra:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        client.release();
    }
};

// POST /api/purchase-orders/:id/receive - Receber itens de uma ordem de compra
exports.receivePurchaseOrderItems = async (req, res) => {
    const { id } = req.params;
    const { itemsToReceive } = req.body; // [{ item_id: X, quantity: Y }, ...]
    const user_id = req.user.id;

    if (!itemsToReceive || itemsToReceive.length === 0) {
        return res.status(400).json({ message: 'Nenhum item para receber especificado.' });
    }

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        for (const item of itemsToReceive) {
            // Atualiza a quantidade recebida no item da ordem
            await client.query(
                'UPDATE purchase_order_items SET quantity_received = quantity_received + $1 WHERE id = $2',
                [item.quantity, item.item_id]
            );

            // Pega o variation_id do item da ordem
            const itemData = await client.query('SELECT variation_id FROM purchase_order_items WHERE id = $1', [item.item_id]);
            const { variation_id } = itemData.rows[0];

            // Atualiza o estoque da variação do produto
            await client.query(
                'UPDATE product_variations SET stock_quantity = stock_quantity + $1 WHERE id = $2',
                [item.quantity, variation_id]
            );

            // Adiciona um registro no histórico de estoque
            await client.query(
                `INSERT INTO stock_history (variation_id, user_id, change_type, quantity_change, reason)
                 VALUES ($1, $2, 'compra', $3, $4)`,
                [variation_id, user_id, item.quantity, `Recebimento da Ordem de Compra #${id}`]
            );
        }

        // Lógica para atualizar o status geral da Ordem de Compra
        const allItems = await client.query('SELECT quantity, quantity_received FROM purchase_order_items WHERE purchase_order_id = $1', [id]);
        const totalQuantity = allItems.rows.reduce((sum, row) => sum + row.quantity, 0);
        const totalReceived = allItems.rows.reduce((sum, row) => sum + row.quantity_received, 0);

        let newStatus = 'Recebido Parcialmente';
        if (totalReceived >= totalQuantity) {
            newStatus = 'Recebido';
        }

        await client.query('UPDATE purchase_orders SET status = $1 WHERE id = $2', [newStatus, id]);

        await client.query('COMMIT');
        res.status(200).json({ message: 'Itens recebidos e estoque atualizado com sucesso.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao receber ordem de compra:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        client.release();
    }
};