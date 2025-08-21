const db = require('../db');

const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    // req.user deve ser populado pelo middleware authenticateToken
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Não autenticado.' });
    }

    try {
      // Buscar o papel do usuário
      const userRoleResult = await db.query(
        'SELECT r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1',
        [req.user.id]
      );

      if (userRoleResult.rows.length === 0) {
        return res.status(403).json({ message: 'Papel do usuário não encontrado.' });
      }

      const userRoleName = userRoleResult.rows[0].role_name;

      // Se o usuário for admin, ele tem todas as permissões
      if (userRoleName === 'admin') {
        return next();
      }

      // Buscar as permissões associadas ao papel do usuário
      const userPermissionsResult = await db.query(
        `SELECT p.name FROM permissions p
         JOIN role_permissions rp ON p.id = rp.permission_id
         JOIN roles r ON rp.role_id = r.id
         WHERE r.name = $1`,
        [userRoleName]
      );

      const userPermissions = userPermissionsResult.rows.map(p => p.name);

      // Verificar se o usuário possui todas as permissões necessárias
      const hasPermission = requiredPermissions.every(perm => userPermissions.includes(perm));

      if (hasPermission) {
        next();
      } else {
        res.status(403).json({ message: 'Você não tem permissão para realizar esta ação.' });
      }
    } catch (error) {
      console.error('Erro no middleware de autorização:', error);
      res.status(500).json({ message: 'Erro interno do servidor ao verificar permissões.' });
    }
  };
};

module.exports = authorize;
