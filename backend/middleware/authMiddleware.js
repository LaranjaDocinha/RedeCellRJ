const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  next();
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(403).json({ message: 'Acesso proibido. Informações de usuário ausentes.' });
    }

    const hasRequiredRole = allowedRoles.includes(req.user.role);
    
    if (!hasRequiredRole) {
      return res.status(403).json({ message: `Acesso proibido. Requer uma das seguintes permissões: ${allowedRoles.join(', ')}.` });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
