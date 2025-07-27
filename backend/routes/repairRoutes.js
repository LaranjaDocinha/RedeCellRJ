const express = require('express');
const router = express.Router();
const db = require('../db');



// --- ROTAS PRINCIPAIS DE ORDENS DE SERVIÇO ---

// GET /api/repairs - Listar todas as O.S. com filtros
router.get('/', async (req, res) => {
    const { limit = 10, offset = 0, search = '', status = '' } = req.query;
    try {
        let query = `
            SELECT 
                r.id, r.status, r.device_type, r.created_at,
                r.priority, r.tags, u.name as user_name,
                c.name as customer_name
            FROM repairs r
            JOIN customers c ON r.customer_id = c.id
            LEFT JOIN users u ON r.user_id = u.id
        `;
        let countQuery = `
            SELECT COUNT(*) 
            FROM repairs r
            JOIN customers c ON r.customer_id = c.id
        `;

        const filterParams = [];
        const whereClauses = [];
        let currentPlaceholder = 1;

        if (search) {
            const searchParam = `%${search}%`;
            whereClauses.push(`(c.name ILIKE $${currentPlaceholder} OR r.device_type ILIKE $${currentPlaceholder} OR r.imei_serial ILIKE $${currentPlaceholder})`);
            filterParams.push(searchParam);
            currentPlaceholder++;
        }
        if (status) {
            whereClauses.push(`r.status = $${currentPlaceholder}`);
            filterParams.push(status);
            currentPlaceholder++;
        }

        if (whereClauses.length > 0) {
            const whereString = ' WHERE ' + whereClauses.join(' AND ');
            query += whereString;
            countQuery += whereString;
        }

        const totalResult = await db.query(countQuery, filterParams);
        const total = parseInt(totalResult.rows[0].count, 10);

        // Os placeholders para LIMIT e OFFSET serão os próximos na sequência
        const limitPlaceholder = currentPlaceholder;
        const offsetPlaceholder = currentPlaceholder + 1;
        
        filterParams.push(limit);
        filterParams.push(offset);

        query += ` ORDER BY r.created_at DESC LIMIT $${limitPlaceholder} OFFSET $${offsetPlaceholder}`;

        const repairsResult = await db.query(query, filterParams);

        res.json({
            repairs: repairsResult.rows,
            total: total
        });
    } catch (err) {
        console.error('Erro ao listar reparos:', err.message);
        res.status(500).send('Erro do Servidor');
    }
});

// POST /api/repairs - Criar uma nova O.S.
router.post('/', async (req, res) => {
    const { 
        customer_id, device_type, brand, model, imei_serial, 
        problem_description, service_cost = 0, priority = 'Normal', 
        tags, user_id 
    } = req.body;

    if (!customer_id || !device_type || !problem_description) {
        return res.status(400).json({ message: 'Cliente, tipo de aparelho e descrição do problema são obrigatórios.' });
    }
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const initialStatus = 'Orçamento pendente';
        const final_cost = parseFloat(service_cost);
        const user_id = req.user.id;

        // Converte a string de tags separadas por vírgula em um array
        const processedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];

        const repairResult = await client.query(
            `INSERT INTO repairs (
                customer_id, user_id, device_type, brand, model, imei_serial, 
                problem_description, status, service_cost, final_cost, 
                priority, tags
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [
                customer_id, user_id, device_type, brand, model, imei_serial, 
                problem_description, initialStatus, service_cost, final_cost,
                priority, processedTags // Usa o array processado aqui
            ]
        );
        const newRepair = repairResult.rows[0];

        await client.query(
            `INSERT INTO repair_history (repair_id, user_id, status_to, notes) VALUES ($1, $2, $3, $4)`,
            [newRepair.id, user_id, initialStatus, 'Ordem de serviço criada.']
        );

        await client.query('COMMIT');
        res.status(201).json(newRepair);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao criar reparo:', err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        client.release();
    }
});

// GET /api/repairs/stats - Obter estatísticas dos reparos
router.get('/stats', async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_repairs,
                COUNT(CASE WHEN status = 'Orçamento pendente' THEN 1 END) as pending_budget,
                COUNT(CASE WHEN status = 'Aguardando Aprovação' THEN 1 END) as pending_approval,
                COUNT(CASE WHEN status = 'Em Reparo' THEN 1 END) as in_progress,
                COUNT(CASE WHEN status = 'Finalizado' THEN 1 END) as completed_total,
                AVG(CASE WHEN status = 'Finalizado' THEN updated_at - created_at ELSE NULL END) as avg_completion_time
            FROM repairs;
        `;
        const statsResult = await db.query(statsQuery);
        res.json(statsResult.rows[0]);
    } catch (err) {
        console.error('Erro ao buscar estatísticas de reparos:', err.message);
        res.status(500).send('Erro do Servidor');
    }
});

// GET /api/repairs/:id - Obter detalhes de uma O.S.
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
        return next();
    }

    try {
        const repairQuery = `
            SELECT 
                r.*, 
                c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
                u.name as user_name
            FROM repairs r
            JOIN customers c ON r.customer_id = c.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = $1
        `;
        const partsQuery = `
            SELECT rp.*, pv.color, p.name as product_name
            FROM repair_parts rp
            JOIN product_variations pv ON rp.variation_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE rp.repair_id = $1
        `;
        const historyQuery = `
            SELECT rh.*, u.name as user_name
            FROM repair_history rh
            LEFT JOIN users u ON rh.user_id = u.id
            WHERE rh.repair_id = $1 ORDER BY rh.created_at DESC
        `;

        const repairResult = await db.query(repairQuery, [id]);
        if (repairResult.rows.length === 0) {
            return res.status(404).json({ message: 'Ordem de serviço não encontrada.' });
        }

        const partsResult = await db.query(partsQuery, [id]);
        const historyResult = await db.query(historyQuery, [id]);

        const repairDetails = repairResult.rows[0];
        repairDetails.parts = partsResult.rows;
        repairDetails.history = historyResult.rows;

        res.json(repairDetails);
    } catch (err) {
        console.error('Erro ao buscar detalhes do reparo:', err.message);
        res.status(500).send('Erro do Servidor');
    }
});

// PATCH /api/repairs/:id/status - Atualizar o status de uma O.S.
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, notes = '', user_id } = req.body;
    if (!status) {
        return res.status(400).json({ message: 'O novo status é obrigatório.' });
    }
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const user_id = req.user.id;

        const oldRepair = await client.query('SELECT status FROM repairs WHERE id = $1', [id]);
        if (oldRepair.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'O.S. não encontrada.' });
        }
        const status_from = oldRepair.rows[0].status;

        await client.query('UPDATE repairs SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);

        await client.query(
            `INSERT INTO repair_history (repair_id, user_id, status_from, status_to, notes) VALUES ($1, $2, $3, $4, $5)`,
            [id, user_id, status_from, status, notes]
        );

        await client.query('COMMIT');
        res.status(200).json({ message: 'Status atualizado com sucesso.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao atualizar status:', err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        client.release();
    }
});

// --- ROTAS PARA GERENCIAR PEÇAS EM UMA O.S. ---

// POST /api/repairs/:id/parts - Adicionar uma peça a uma O.S.
router.post('/:id/parts', async (req, res) => {
    const { id: repair_id } = req.params;
    const { variation_id, quantity_used, user_id } = req.body;
    if (!variation_id || !quantity_used) {
        return res.status(400).json({ message: 'ID da peça e quantidade são obrigatórios.' });
    }

    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const user_id = req.user.id;

        const variationResult = await client.query(
            'SELECT price, stock_quantity FROM product_variations WHERE id = $1 FOR UPDATE',
            [variation_id]
        );
        if (variationResult.rows.length === 0) throw new Error('Peça não encontrada no estoque.');
        
        const variation = variationResult.rows[0];
        const unit_price_at_time = parseFloat(variation.price);

        if (variation.stock_quantity < quantity_used) {
            throw new Error(`Estoque insuficiente. Apenas ${variation.stock_quantity} unidades disponíveis.`);
        }

        await client.query(
            'UPDATE product_variations SET stock_quantity = stock_quantity - $1 WHERE id = $2',
            [quantity_used, variation_id]
        );

        await client.query(
            'INSERT INTO repair_parts (repair_id, variation_id, quantity_used, unit_price_at_time) VALUES ($1, $2, $3, $4)',
            [repair_id, variation_id, quantity_used, unit_price_at_time]
        );

        const cost_increase = unit_price_at_time * quantity_used;
        await client.query(
            'UPDATE repairs SET parts_cost = parts_cost + $1, final_cost = final_cost + $1, updated_at = NOW() WHERE id = $2',
            [cost_increase, repair_id]
        );
        
        await client.query(
            'INSERT INTO stock_history (variation_id, user_id, change_type, quantity_change, reason) VALUES ($1, $2, $3, $4, $5)',
            [variation_id, user_id, 'reparo', -quantity_used, `Uso na O.S. ID: ${repair_id}`]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Peça adicionada com sucesso.' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao adicionar peça ao reparo:', err);
        res.status(500).json({ message: err.message || 'Erro interno do servidor.' });
    } finally {
        client.release();
    }
});

module.exports = router;