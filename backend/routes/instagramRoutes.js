// backend/routes/instagramRoutes.js
const express = require('express');
const router = express.Router();
const InstagramController = require('../controllers/instagramController');
const { authenticateToken } = require('../middleware/authMiddleware'); // Corrigido

// Rota para iniciar o processo de autorização OAuth 2.0
// Acesso protegido para garantir que apenas usuários logados possam conectar
router.get(
  '/auth',
  authenticateToken, // Corrigido
  InstagramController.redirectToAuth
);

module.exports = router;

