const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// --- ROTAS CRUD PARA GERENCIAMENTO DE USUÁRIOS (Protegidas para Admin) ---

// GET /api/users - Listar todos os usuários
router.get('/', [authenticateToken, authorizeRoles('admin')], async (req, res) => {
    const { limit = 10, offset = 0, search = '' } = req.query;
    try {
        let query = 'SELECT id, name, email, role, is_active, created_at FROM users';
        let countQuery = 'SELECT COUNT(*) FROM users';
        
        const filterParams = [];
        const whereClauses = [];

        if (search) {
            const searchParam = `%${search}%`;
            filterParams.push(searchParam);
            whereClauses.push(`(name ILIKE $1 OR email ILIKE $1)`);
        }

        if (whereClauses.length > 0) {
            const whereString = ' WHERE ' + whereClauses.join(' AND ');
            query += whereString;
            countQuery += whereString;
        }

        const totalResult = await db.query(countQuery, filterParams);
        const total = parseInt(totalResult.rows[0].count, 10);

        const queryParams = [...filterParams];
        query += ` ORDER BY name LIMIT ${queryParams.length + 1} OFFSET ${queryParams.length + 2}`;
        queryParams.push(limit, offset);

        const usersResult = await db.query(query, queryParams);

        res.json({
            users: usersResult.rows,
            total: total
        });
    } catch (err) {
        console.error('Erro ao listar usuários:', err.message);
        res.status(500).send('Erro do Servidor');
    }
});

// GET /api/users/:id - Obter um usuário específico
router.get('/:id', [authenticateToken, authorizeRoles('admin')], async (req, res) => {
    try {
        const { id } = req.params;
        const userResult = await db.query('SELECT id, name, email, role, is_active FROM users WHERE id = $1', [id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }
        res.json(userResult.rows[0]);
    } catch (err) {
        console.error('Erro ao buscar usuário:', err.message);
        res.status(500).send('Erro do Servidor');
    }
});

// POST /api/users - Criar um novo usuário
router.post('/', [authenticateToken, authorizeRoles('admin')], async (req, res) => {
    const { name, email, password, role = 'seller' } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, is_active',
            [name, email, password_hash, role]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'O e-mail fornecido já está em uso.' });
        }
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// PUT /api/users/:id - Atualizar um usuário
router.put('/:id', [authenticateToken, authorizeRoles('admin')], async (req, res) => {
    const { id } = req.params;
    const { name, role, is_active } = req.body;
    if (name === undefined || role === undefined || is_active === undefined) {
        return res.status(400).json({ message: 'Nome, permissão (role) e status (is_active) são obrigatórios.' });
    }
    try {
        const updatedUser = await db.query(
            'UPDATE users SET name = $1, role = $2, is_active = $3 WHERE id = $4 RETURNING id, name, email, role, is_active',
            [name, role, is_active, id]
        );
        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }
        res.json(updatedUser.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// PATCH /api/users/:id/password - Alterar a senha de um usuário
router.patch('/:id/password', [authenticateToken, authorizeRoles('admin')], async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ message: 'A nova senha é obrigatória.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const result = await db.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [password_hash, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }
        res.status(200).json({ message: 'Senha atualizada com sucesso.' });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// DELETE /api/users/:id - Desativar/Reativar um usuário (Soft Delete)
router.delete('/:id', [authenticateToken, authorizeRoles('admin')], async (req, res) => {
    const { id } = req.params;
    try {
        const userResult = await db.query('SELECT is_active FROM users WHERE id = $1', [id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }
        const newStatus = !userResult.rows[0].is_active;
        await db.query('UPDATE users SET is_active = $1 WHERE id = $2', [newStatus, id]);
        res.json({ message: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso.` });
    } catch (error) {
        console.error('Erro ao alterar status do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// --- ROTAS DE AUTENTICAÇÃO PÚBLICA ---

// Rota para registrar um novo usuário (pode ser pública ou restrita)
// Por enquanto, vamos manter pública, mas poderia ser protegida também.
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        // Novos usuários são sempre 'seller' por padrão via registro público
        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, \'seller\') RETURNING id, name, email, role',
            [name, email, password_hash]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'O e-mail fornecido já está em uso.' });
        }
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota para login de usuário
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }
    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1 AND is_active = TRUE', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas ou usuário inativo.' });
        }
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }
        const payload = { user: { id: user.id, name: user.name, role: user.role } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: { id: user.id, name: user.name, email: user.email, role: user.role }
                });
            }
        );
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

module.exports = router;
