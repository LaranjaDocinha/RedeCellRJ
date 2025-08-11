const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validatePassword } = require('../utils/validation');
const { logActivity } = require('../utils/activityLogger');
const multer = require('multer');
const path = require('path');

// Configuração do Multer para upload de imagens de perfil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_images');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Rate Limiter para a rota de login
const loginLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutos
  max: 10, // Limita cada IP a 10 requisições por janela
  message: 'Muitas tentativas de login a partir deste IP, por favor, tente novamente após 3 minutos.',
  standardHeaders: true, // Retorna informações do limite nos cabeçalhos `RateLimit-*`
  legacyHeaders: false, // Desabilita os cabeçalhos `X-RateLimit-*`
});

// GET /api/users - Listar todos os usuários
exports.getAllUsers = async (req, res) => {
    const { limit = 10, offset = 0, search = '' } = req.query;
    try {
        let query = 'SELECT id, name, email, role, is_active, created_at FROM users';
        let countQuery = 'SELECT COUNT(*) FROM users';
        
        const filterParams = [];
        const whereClauses = [];
        let paramIndex = 1; // Começa o índice do parâmetro em 1

        if (search) {
            const searchParam = `%${search}%`;
            filterParams.push(searchParam);
            whereClauses.push(`(name ILIKE ${paramIndex} OR email ILIKE ${paramIndex})`);
            paramIndex++; // Incrementa o índice para o próximo parâmetro
        }

        if (whereClauses.length > 0) {
            const whereString = ' WHERE ' + whereClauses.join(' AND ');
            query += whereString;
            countQuery += whereString;
        }

        const totalResult = await db.query(countQuery, filterParams);
        const total = parseInt(totalResult.rows[0].count, 10);

        // Adiciona limit e offset como os últimos parâmetros
        query += ` ORDER BY name LIMIT ${paramIndex} OFFSET ${paramIndex + 1}`;
        filterParams.push(limit, offset); // Adiciona limit e offset aos parâmetros

        const usersResult = await db.query(query, filterParams); // Usa filterParams que agora inclui limit e offset

        res.json({
            users: usersResult.rows,
            total: total
        });
    } catch (err) {
        console.error('Erro ao listar usuários:', err.message);
        res.status(500).send('Erro do Servidor');
    }
};

// GET /api/users/:id - Obter um usuário específico
exports.getUserById = async (req, res) => {
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
};

// PATCH /api/users/profile - Atualizar perfil do usuário (incluindo imagem)
exports.updateUserProfile = async (req, res) => {
    try {
        const { name, phone, address, city, state, zip, bio } = req.body;
        const profileImage = req.file; // Informações do arquivo enviado pelo Multer

        let query = 'UPDATE users SET name = $1, phone = $2, address = $3, city = $4, state = $5, zip = $6, bio = $7';
        const queryParams = [name, phone, address, city, state, zip, bio];
        let paramIndex = 8;

        if (profileImage) {
            const imageUrl = `/uploads/profile_images/${profileImage.filename}`;
            query += `, profile_image_url = $${paramIndex++}`;
            queryParams.push(imageUrl);
        }

        query += ` WHERE id = $${paramIndex} RETURNING id, name, email, role, is_active, profile_image_url, phone, address, city, state, zip, bio`;
        queryParams.push(req.user.id); // req.user.id vem do authenticateToken

        const updatedUser = await db.query(query, queryParams);

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.json(updatedUser.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar perfil do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// POST /api/users - Criar um novo usuário
exports.createUser = async (req, res) => {
    const { name, email, password, role = 'seller' } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        // Novos usuários são sempre 'seller' por padrão via registro público
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
};

// PUT /api/users/:id - Atualizar um usuário
exports.updateUser = async (req, res) => {
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
};

// PATCH /api/users/:id/password - Alterar a senha de um usuário
exports.changeUserPassword = async (req, res) => {
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
};

// DELETE /api/users/:id - Desativar/Reativar um usuário (Soft Delete)
exports.toggleUserStatus = async (req, res) => {
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
};

// Rota para registrar um novo usuário (pode ser pública ou restrita)
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return res.status(400).json({ message: passwordValidation.message });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        // Novos usuários são sempre 'seller' por padrão via registro público
        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
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
};

// Rota para login de usuário
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }
    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1 AND is_active = TRUE', [email]);

        if (userResult.rows.length === 0) {
            await logActivity(`Tentativa de login falhou para o e-mail: ${email} (usuário não encontrado ou inativo).`);
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log('Resultado da comparação de senha (isMatch):', isMatch);

        if (!isMatch) {
            await logActivity(`Tentativa de login falhou para o usuário: ${user.name} <${email}> (senha incorreta).`);
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }
        await logActivity(`Usuário ${user.name} <${email}> logado com sucesso.`);
        const payload = { user: { id: user.id, name: user.name, role: user.role } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' },
            (err, token) => {
                if (err) {
                    console.error('[LOGIN JWT SIGN ERROR]', err);
                    throw err;
                }
                res.json({
                    token,
                    user: { id: user.id, name: user.name, email: user.email, role: user.role }
                });
            }
        );
    } catch (error) {
        console.error('[LOGIN CATCH ERROR]', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

exports.upload = upload;
exports.loginLimiter = loginLimiter;
