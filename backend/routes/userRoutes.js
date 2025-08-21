const express = require('express');
// Atualiza para importar o novo middleware 'authorize'
const { authenticateToken } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { check, validationResult } = require('express-validator');
const { createUserValidation, validate } = require('../validation/userValidation');
const userController = require('../controllers/userController');

const router = express.Router();

// --- ROTAS DE PERFIL E AUTENTICAÇÃO (PÚBLICAS) ---

// Rota para registrar um novo usuário (pública)
router.post(
  '/register',
  [
    check('name', 'Nome é obrigatório e deve ter pelo menos 3 caracteres.').not().isEmpty().isLength({ min: 3 }),
    check('email', 'Por favor, inclua um e-mail válido.').isEmail(),
    check('password', 'A senha é obrigatória e deve ter pelo menos 8 caracteres.').isLength({ min: 8 }),
  ],
  userController.registerUser
);

// Rota para login de usuário (pública)
router.post('/login', userController.loginLimiter, userController.loginUser);
  

// --- ROTAS CRUD PARA GERENCIAMENTO DE USUÁRIOS (PROTEGIDAS) ---

// GET /api/users - Listar todos os usuários
router.get('/', [authenticateToken, authorize('users:read')], userController.getAllUsers);

// --- ROTAS DE PERFIL E AUTENTICAÇÃO (PROTEGIDAS) ---

// Rota para obter o perfil do usuário logado (qualquer usuário autenticado pode acessar)
router.get('/profile/me', authenticateToken, userController.getCurrentUserProfile);

// GET /api/users/:id - Obter um usuário específico
router.get('/:id', [authenticateToken, authorize('users:read')], userController.getUserById);

// POST /api/users - Criar um novo usuário
router.post(
  '/',
  createUserValidation,
  validate,
  [authenticateToken, authorize(['users:create'])],
  userController.createUser
);

// PUT /api/users/:id - Atualizar um usuário
router.put('/:id', [authenticateToken, authorize('users:update'), userController.upload.single('profileImage')], userController.updateUser);

// PATCH /api/users/:id/password - Alterar a senha de um usuário
// router.use(authorize('admin')); // Authorize only admin for routes below


// DELETE /api/users/:id - Desativar/Reativar um usuário (Soft Delete)
router.delete('/:id', [authenticateToken, authorize(['users:delete'])], userController.toggleUserStatus);

// POST /api/users/bulk-action - Realizar ações em massa
router.post('/bulk-action', [authenticateToken, authorize('users:update')], userController.bulkAction);

// POST /api/users/:id/impersonate - Personificar um usuário (apenas para administradores)
router.post('/:id/impersonate', [authenticateToken, authorize(['users:manage-roles'])], userController.impersonateUser);

// POST /api/users/:id/send-reset-email - Enviar e-mail de reset de senha
router.post('/:id/send-reset-email', [authenticateToken, authorize('users:update')], userController.sendPasswordResetEmail);

// GET /api/users/:id/activity-logs - Obter logs de atividade de um usuário específico
router.get('/:id/activity-logs', [authenticateToken, authorize('users:read')], userController.getUserActivityLogs);


// GET /api/users/:id/login-history - Obter histórico de login de um usuário específico
router.get('/:id/login-history', [authenticateToken, authorize('users:read')], userController.getUserLoginHistory);

// PUT /api/users/profile - Atualizar o próprio perfil do usuário (qualquer usuário autenticado pode acessar)
router.put('/profile', [authenticateToken, userController.upload.single('profileImage')], userController.updateMyProfile);

// POST /api/users/change-password - Alterar a senha do usuário logado
router.post('/change-password', authenticateToken, userController.changeMyPassword);

// GET /api/users/sessions - Listar sessões ativas do usuário logado
router.get('/sessions', authenticateToken, userController.getUserSessions);

// DELETE /api/users/sessions/:id - Revogar uma sessão específica do usuário logado
router.delete('/sessions/:id', authenticateToken, userController.revokeUserSession);

// POST /api/users/logout - Realizar logout e invalidar refresh token
router.post('/logout', userController.logout);


// Rotas para 2FA
router.post('/2fa/generate', authenticateToken, userController.generate2FASecret);
router.post('/2fa/verify', authenticateToken, userController.verify2FAToken);
router.post('/2fa/enable', authenticateToken, userController.enable2FA);
router.post('/2fa/disable', authenticateToken, userController.disable2FA);




module.exports = router;
