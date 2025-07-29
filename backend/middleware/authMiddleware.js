const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Token de autenticação ausente.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token de autenticação inválido.' });
    }
    req.user = user.user; // O payload do JWT contém um objeto 'user'
    next();
  });
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
