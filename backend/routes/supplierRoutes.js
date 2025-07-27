const express = require('express');
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas as rotas de fornecedores são protegidas e requerem a role 'admin'


// GET /api/suppliers - Listar todos os fornecedores
router.get('/', async (req, res) => {
    const { limit = 9999, offset = 0, search = '' } = req.query;
    try {
        let query = 'SELECT * FROM suppliers';
        let countQuery = 'SELECT COUNT(*) FROM suppliers';
        const params = [];
        
        if (search) {
            query += ' WHERE name ILIKE $1 OR email ILIKE $1 OR contact_person ILIKE $1';
            countQuery += ' WHERE name ILIKE $1 OR email ILIKE $1 OR contact_person ILIKE $1';
            params.push(`%${search}%`);
        }

        const countResult = await db.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);

        query += ` ORDER BY name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await db.query(query, params);
        res.json({
            suppliers: result.rows,
            total: total
        });
    } catch (err) {
        console.error('Erro ao listar fornecedores:', err.message);
        res.status(500).send('Erro do Servidor');
    }
});

// POST /api/suppliers - Criar um novo fornecedor
router.post('/', async (req, res) => {
    const { name, contact_person, email, phone, address } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'O nome do fornecedor é obrigatório.' });
    }
    try {
        const newSupplier = await db.query(
            'INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, contact_person, email, phone, address]
        );
        res.status(201).json(newSupplier.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // unique_violation
            return res.status(409).json({ message: 'O e-mail fornecido já está em uso por outro fornecedor.' });
        }
        console.error('Erro ao criar fornecedor:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// PUT /api/suppliers/:id - Atualizar um fornecedor
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, contact_person, email, phone, address } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'O nome do fornecedor é obrigatório.' });
    }
    try {
        const updatedSupplier = await db.query(
            'UPDATE suppliers SET name = $1, contact_person = $2, email = $3, phone = $4, address = $5 WHERE id = $6 RETURNING *',
            [name, contact_person, email, phone, address, id]
        );
        if (updatedSupplier.rows.length === 0) {
            return res.status(404).json({ msg: 'Fornecedor não encontrado.' });
        }
        res.json(updatedSupplier.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'O e-mail fornecido já está em uso por outro fornecedor.' });
        }
        console.error('Erro ao atualizar fornecedor:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// DELETE /api/suppliers/:id - Excluir um fornecedor
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM suppliers WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Fornecedor não encontrado.' });
        }
        res.status(204).send(); // 204 No Content
    } catch (error) {
        console.error('Erro ao excluir fornecedor:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

module.exports = router;
