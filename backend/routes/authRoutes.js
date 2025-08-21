const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const AppError = require('../utils/appError');

const router = express.Router();

// POST /api/auth/refresh-token - Endpoint para renovar o token de acesso
router.post('/refresh-token', async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh Token ausente.', 401));
  }

  try {
    // Verificar se o refresh token é válido e não expirou
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET.trim());

    // Buscar o refresh token no banco de dados
    const tokenRecord = await db.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND expires_at > NOW()',
      [refreshToken, decoded.userId]
    );

    if (tokenRecord.rows.length === 0) {
      return next(new AppError('Refresh Token inválido ou expirado.', 403));
    }

    // Gerar um novo Access Token
    const userResult = await db.query(
      'SELECT id, name, email, role_id FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return next(new AppError('Usuário não encontrado.', 404));
    }

    const user = userResult.rows[0];
    const roleResult = await db.query('SELECT name FROM roles WHERE id = $1', [user.role_id]);
    const roleName = roleResult.rows.length > 0 ? roleResult.rows[0].name : 'unknown';

    const newAccessToken = jwt.sign(
      { user: { id: user.id, name: user.name, role: roleName } },
      process.env.JWT_SECRET.trim(),
      { expiresIn: '8h' } // Novo access token expira em 8 horas
    );

    // Opcional: Gerar um novo Refresh Token e invalidar o antigo (para maior segurança)
    // const newRefreshToken = jwt.sign(
    //   { userId: user.id },
    //   process.env.REFRESH_TOKEN_SECRET.trim(),
    //   { expiresIn: '7d' }
    // );
    // await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    // await db.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)', [user.id, newRefreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]);

    res.json({ accessToken: newAccessToken /*, newRefreshToken */ });

  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return next(new AppError('Falha ao renovar token.', 403));
  }
});

module.exports = router;
