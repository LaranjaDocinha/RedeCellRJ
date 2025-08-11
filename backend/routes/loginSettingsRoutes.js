// backend/routes/loginSettingsRoutes.js
const express = require('express');
const router = express.Router();
const { getLoginScreenSettings, updateLoginScreenSettings } = require('../controllers/loginSettingsController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// Rota PÚBLICA para obter as configurações da tela de login
// Qualquer pessoa (mesmo não autenticada) pode acessar para renderizar a página de login.
router.get('/login-screen', getLoginScreenSettings);

// Rota PROTEGIDA para atualizar as configurações da tela de login
// Apenas administradores podem acessar esta rota.
router.put('/login-screen', [authenticateToken, authorize('admin')], updateLoginScreenSettings);

module.exports = router;
