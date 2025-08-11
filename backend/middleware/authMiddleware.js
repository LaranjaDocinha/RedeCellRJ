const jwt = require('jsonwebtoken');
const pool = require('../db'); // Importa o pool de conexões

/**
 * Middleware de Autenticação
 * Verifica o token JWT e anexa as informações do usuário, incluindo seu papel e permissões, ao objeto `req`.
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Token de autenticação ausente.' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('[AuthMiddleware] JWT_SECRET não está definido.');
      return res.status(500).json({ message: 'Erro de configuração do servidor: JWT_SECRET não definido.' });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET.trim());
    const userId = decoded.user.id;

    // Busca o usuário, seu papel e suas permissões no banco de dados
    const query = `
      SELECT 
        u.id, u.name, u.email, u.profile_image_url, u.is_active, u.branch_id,
        r.name AS role,
        ARRAY_AGG(p.name) AS permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = $1
      GROUP BY u.id, r.name, u.branch_id;
    `;

    try {
      const { rows } = await pool.query(query, [userId]);

      if (rows.length === 0) {
        return res.status(403).json({ message: 'Usuário não encontrado.' });
      }

      req.user = rows[0]; // Anexa o usuário com papel e permissões ao request
      next();
    } catch (dbError) {
      console.error('[AuthMiddleware] Erro ao buscar usuário no banco de dados:', dbError);
      return res.status(500).json({ message: 'Erro interno do servidor ao autenticar usuário.' });
    }
  } catch (err) {
    console.error('[AuthMiddleware] Erro na verificação do token JWT:', err);
    return res.status(403).json({ message: 'Token de autenticação inválido ou expirado.' });
  }
};

/**
 * Middleware de Autorização Baseado em Permissões
 * Verifica se o usuário autenticado (`req.user`) possui a permissão necessária.
 * @param {string} requiredPermission - A permissão necessária para acessar a rota (ex: 'users:create').
 */
const authorize = (requiredPermission) => {
  return (req, res, next) => {
    // As permissões são carregadas pelo middleware `authenticateToken`
    const userPermissions = req.user?.permissions || [];

    // O admin tem todas as permissões implicitamente, ou verificamos a permissão específica
    if (req.user?.role === 'admin' || userPermissions.includes(requiredPermission)) {
      return next();
    }

    return res.status(403).json({ 
      message: `Acesso proibido. Requer a permissão: '${requiredPermission}'.` 
    });
  };
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado. Requer privilégios de administrador.' });
  }
};

module.exports = {
  authenticateToken,
  authorize,
  admin, // Export the new admin middleware
};