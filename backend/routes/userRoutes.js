const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// --- ROTAS CRUD PARA GERENCIAMENTO DE USUÁRIOS (Protegidas para Admin) ---

// GET /api/users - Listar todos os usuários
router.get('/', [authenticateToken, authorizeRoles('admin')], userController.getAllUsers);

// GET /api/users/:id - Obter um usuário específico
router.get('/:id', [authenticateToken, authorizeRoles('admin')], userController.getUserById);

// PATCH /api/users/profile - Atualizar perfil do usuário (incluindo imagem)
router.patch('/profile', [authenticateToken, userController.upload.single('profileImage')], userController.updateUserProfile);

// POST /api/users - Criar um novo usuário
router.post('/', [authenticateToken, authorizeRoles('admin')], userController.createUser);

// PUT /api/users/:id - Atualizar um usuário
router.put('/:id', [authenticateToken, authorizeRoles('admin')], userController.updateUser);

// PATCH /api/users/:id/password - Alterar a senha de um usuário
router.patch('/:id/password', [authenticateToken, authorizeRoles('admin')], userController.changeUserPassword);

// DELETE /api/users/:id - Desativar/Reativar um usuário (Soft Delete)
router.delete('/:id', [authenticateToken, authorizeRoles('admin')], userController.toggleUserStatus);

// --- ROTAS DE AUTENTICAÇÃO PÚBLICA ---

// Rota para registrar um novo usuário (pode ser pública ou restrita)
router.post('/register', userController.registerUser);

// Rota para login de usuário
router.post('/login', userController.loginLimiter, userController.loginUser);

module.exports = router;