const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validatePassword } = require('../utils/validation');
const { logActivity } = require('../utils/activityLogger');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Configuração do Multer para upload de imagens de perfil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_images');
  },
  filename: (req, file, cb) => {
    // Use original name + timestamp to ensure uniqueness and relevance
    const name = file.originalname.split('.')[0];
    const ext = path.extname(file.originalname);
    cb(null, `${name}-${Date.now()}${ext}`);
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
        let query = 'SELECT id, name, email, role, is_active, created_at, last_login_at FROM users';
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
exports.createUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { name, email, password, role = 'seller' } = req.body;

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return next(new AppError(passwordValidation.message, 400));
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
            return next(new AppError('O e-mail fornecido já está em uso.', 409));
        }
        next(error); // Pass other errors to global error handler
    }
};

// PUT /api/users/:id - Atualizar um usuário
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, role, is_active, branch_id } = req.body;
    const profileImage = req.file; // Get the uploaded file

    if (name === undefined || role === undefined || is_active === undefined || branch_id === undefined) {
        return res.status(400).json({ message: 'Nome, permissão (role), status (is_active) e filial (branch_id) são obrigatórios.' });
    }
    try {
        let query = 'UPDATE users SET name = $1, role = $2, is_active = $3, branch_id = $4';
        const queryParams = [name, role, is_active, branch_id];
        let paramIndex = 5; // Next parameter index

        if (profileImage) {
            const imageUrl = `/uploads/profile_images/${profileImage.filename}`;
            query += `, profile_image_url = ${paramIndex++}`;
            queryParams.push(imageUrl);
        }

        query += ` WHERE id = ${paramIndex} RETURNING id, name, email, role, is_active, profile_image_url, branch_id`;
        queryParams.push(id); // The ID of the user being updated

        const updatedUser = await db.query(query, queryParams);

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
exports.registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { name, email, password } = req.body;

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return next(new AppError(passwordValidation.message, 400));
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, password_hash, 'seller'] // Default role for public registration
        );
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return next(new AppError('O e-mail fornecido já está em uso.', 409));
        }
        next(error); // Pass other errors to global error handler
    }
};

// Rota para login de usuário
exports.loginUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1 AND is_active = TRUE', [email]);

        if (userResult.rows.length === 0) {
            await db.query(
                'INSERT INTO login_history (user_id, ip_address, user_agent, success) VALUES ($1, $2, $3, $4)',
                [null, ipAddress, userAgent, false] // user_id is null for non-existent user
            );
            await logActivity(`Tentativa de login falhou para o e-mail: ${email} (usuário não encontrado ou inativo).`);
            return next(new AppError('Credenciais inválidas.', 401));
        }
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            await db.query(
                'INSERT INTO login_history (user_id, ip_address, user_agent, success) VALUES ($1, $2, $3, $4)',
                [user.id, ipAddress, userAgent, false]
            );
            await logActivity(user.name, `Tentativa de login falhou para o usuário: ${user.name} <${email}> (senha incorreta).`);
            return next(new AppError('Credenciais inválidas.', 401));
        }

        // Atualiza o timestamp de último login
        await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

        // Record successful login
        await db.query(
            'INSERT INTO login_history (user_id, ip_address, user_agent, success) VALUES ($1, $2, $3, $4)',
            [user.id, ipAddress, userAgent, true]
        );

        await logActivity(user.name, `Usuário ${user.name} <${email}> logado com sucesso.`, 'user', user.id, user.branch_id || 1);
        const payload = { user: { id: user.id, name: user.name, role: user.role } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' },
            (err, token) => {
                if (err) {
                    console.error('[LOGIN JWT SIGN ERROR]', err);
                    return next(new AppError('Erro ao gerar token de autenticação.', 500));
                }
                res.json({
                    token,
                    user: { id: user.id, name: user.name, email: user.email, role: user.role }
                });
            }
        );
    } catch (error) {
        console.error('[LOGIN CATCH ERROR]', error);
        next(error); // Pass other errors to global error handler
    }
};

exports.generate2FASecret = async (req, res) => {
  try {
    const user = req.user; // Obtido do authenticateToken

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `PDV Web (${user.email})`,
    });

    // Salvar o segredo temporariamente ou associá-lo ao usuário para a próxima etapa de verificação
    // Por simplicidade, vamos retorná-lo e o frontend será responsável por enviá-lo de volta para enable2FA
    // Em um ambiente de produção, você pode querer armazenar isso em cache no lado do servidor com um TTL

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        console.error('Erro ao gerar QR Code:', err);
        return res.status(500).json({ message: 'Erro ao gerar QR Code.' });
      }
      res.json({ secret: secret.base32, qrcode: data_url });
    });
  } catch (error) {
    console.error('Erro ao gerar segredo 2FA:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.verify2FAToken = async (req, res) => {
  const { token, secret } = req.body;

  if (!token || !secret) {
    return res.status(400).json({ message: 'Token e segredo são obrigatórios.' });
  }

  try {
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1, // Permite um desvio de 1 período de tempo (30 segundos)
    });

    if (verified) {
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false, message: 'Token inválido.' });
    }
  } catch (error) {
    console.error('Erro ao verificar token 2FA:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.enable2FA = async (req, res) => {
  const { token, secret } = req.body;
  const user = req.user; // Obtido do authenticateToken

  if (!token || !secret) {
    return res.status(400).json({ message: 'Token e segredo são obrigatórios para ativar o 2FA.' });
  }

  try {
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Token de verificação inválido.' });
    }

    // Salvar o segredo e habilitar 2FA para o usuário
    await db.query(
      'UPDATE users SET two_factor_secret = $1, two_factor_enabled = TRUE WHERE id = $2',
      [secret, user.id]
    );

    res.json({ message: 'Autenticação de dois fatores ativada com sucesso!' });
  } catch (error) {
    console.error('Erro ao ativar 2FA:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.disable2FA = async (req, res) => {
  const { token } = req.body;
  const user = req.user; // Obtido do authenticateToken

  if (!token) {
    return res.status(400).json({ message: 'Token é obrigatório para desativar o 2FA.' });
  }

  try {
    // Verificar o token antes de desativar
    const userResult = await db.query('SELECT two_factor_secret FROM users WHERE id = $1', [user.id]);
    if (userResult.rows.length === 0 || !userResult.rows[0].two_factor_secret) {
      return res.status(404).json({ message: 'Segredo 2FA não encontrado para este usuário.' });
    }

    const verified = speakeasy.totp.verify({
      secret: userResult.rows[0].two_factor_secret,
      encoding: 'base32',
      token: token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Token de verificação inválido.' });
    }

    // Desativar 2FA e remover o segredo
    await db.query(
      'UPDATE users SET two_factor_secret = NULL, two_factor_enabled = FALSE WHERE id = $1',
      [user.id]
    );

    res.json({ message: 'Autenticação de dois fatores desativada com sucesso!' });
  } catch (error) {
    console.error('Erro ao desativar 2FA:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.getUserActivityLogs = async (req, res) => {
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    try {
        // First, get the user's name from the users table using the provided ID
        const userResult = await db.query('SELECT name FROM users WHERE id = $1', [id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        const userName = userResult.rows[0].name;

        // Then, fetch activity logs for that user name
        const logsResult = await db.query(
            'SELECT id, user_name, description, timestamp FROM activity_log WHERE user_name = $1 ORDER BY timestamp DESC LIMIT $2 OFFSET $3',
            [userName, limit, offset]
        );

        const countResult = await db.query(
            'SELECT COUNT(*) FROM activity_log WHERE user_name = $1',
            [userName]
        );

        res.json({
            logs: logsResult.rows,
            total: parseInt(countResult.rows[0].count, 10),
        });
    } catch (error) {
        console.error('Erro ao buscar logs de atividade do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

exports.upload = upload;
exports.loginLimiter = loginLimiter;

// GET /api/users/profile/me - Obter o perfil do usuário logado
exports.getCurrentUserProfile = async (req, res) => {
    try {
        // req.user é preenchido pelo middleware authenticateToken
        const user = req.user; 
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        // Retorna apenas as informações de perfil relevantes
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile_image_url: user.profile_image_url,
            phone: user.phone,
            address: user.address,
            city: user.city,
            state: user.state,
            zip: user.zip,
            bio: user.bio,
            is_active: user.is_active,
            branch_id: user.branch_id, // Incluir branch_id no perfil do usuário
            two_factor_enabled: user.two_factor_enabled,
            two_factor_secret: user.two_factor_secret // Apenas para o próprio usuário, não expor em outras rotas
        });
    } catch (error) {
        console.error('Erro ao obter perfil do usuário logado:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

exports.getUserLoginHistory = async (req, res) => {
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    try {
        const historyResult = await db.query(
            'SELECT id, user_id, login_at, ip_address, user_agent, success FROM login_history WHERE user_id = $1 ORDER BY login_at DESC LIMIT $2 OFFSET $3',
            [id, limit, offset]
        );

        const countResult = await db.query(
            'SELECT COUNT(*) FROM login_history WHERE user_id = $1',
            [id]
        );

        res.json({
            history: historyResult.rows,
            total: parseInt(countResult.rows[0].count, 10),
        });
    } catch (error) {
        console.error('Erro ao buscar histórico de login do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// POST /api/users/bulk-action - Realizar ações em massa
exports.bulkAction = async (req, res) => {
    const { action, userIds, role } = req.body; // role é opcional, usado apenas para a ação 'setRole'

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: 'Ação e uma lista de IDs de usuário são obrigatórios.' });
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        let result;
        switch (action) {
            case 'activate':
                result = await client.query('UPDATE users SET is_active = TRUE WHERE id = ANY($1)', [userIds]);
                break;
            case 'deactivate':
                result = await client.query('UPDATE users SET is_active = FALSE WHERE id = ANY($1)', [userIds]);
                break;
            case 'setRole':
                if (!role) {
                    return res.status(400).json({ message: 'A permissão (role) é obrigatória para esta ação.' });
                }
                result = await client.query('UPDATE users SET role = $1 WHERE id = ANY($2)', [role, userIds]);
                break;
            default:
                return res.status(400).json({ message: 'Ação desconhecida.' });
        }

        await client.query('COMMIT');
        res.status(200).json({ message: `Ação '${action}' executada com sucesso para ${result.rowCount} usuário(s).` });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao executar ação em massa:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao processar a ação em massa.' });
    } finally {
        client.release();
    }
};

// POST /api/users/:id/send-reset-email - Enviar e-mail de reset de senha
exports.sendPasswordResetEmail = async (req, res) => {
    const { id } = req.params;
    try {
        const userResult = await db.query('SELECT email, name FROM users WHERE id = $1', [id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        const userEmail = userResult.rows[0].email;
        const userName = userResult.rows[0].name;

        console.log(`[SIMULATED EMAIL] Enviando e-mail de reset de senha para ${userName} <${userEmail}> (ID: ${id}).`);

        res.status(200).json({ message: `E-mail de reset de senha simulado enviado para ${userEmail}.` });
    } catch (error) {
        console.error('Erro ao simular envio de e-mail de reset de senha:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

exports.impersonateUser = async (req, res, next) => {
    const { id } = req.params; // ID do usuário a ser personificado
    const adminUser = req.user; // Usuário administrador que está solicitando a personificação

    // A autorização para 'admin' já é feita no middleware da rota, mas é bom ter uma verificação extra
    if (adminUser.role !== 'admin') {
        return next(new AppError('Apenas administradores podem personificar usuários.', 403));
    }

    try {
        // Buscar o usuário a ser personificado
        const userToImpersonateResult = await db.query(
            'SELECT id, name, email, role FROM users WHERE id = $1 AND is_active = TRUE',
            [id]
        );

        if (userToImpersonateResult.rows.length === 0) {
            return next(new AppError('Usuário a ser personificado não encontrado ou inativo.', 404));
        }

        const impersonatedUser = userToImpersonateResult.rows[0];

        // Gerar um novo token JWT para o usuário personificado
        const payload = { user: { id: impersonatedUser.id, name: impersonatedUser.name, role: impersonatedUser.role } };
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token de personificação com validade menor
        );

        // Opcional: Registrar a ação de personificação no log de atividades
        await logActivity(
            adminUser.name,
            `Administrador ${adminUser.name} (${adminUser.id}) personificou o usuário ${impersonatedUser.name} (${impersonatedUser.id}).`,
            'system',
            adminUser.id
        );

        res.json({ token });

    } catch (error) {
        console.error('Erro ao personificar usuário:', error);
        next(new AppError('Erro interno do servidor ao tentar personificar o usuário.', 500));
    }
};