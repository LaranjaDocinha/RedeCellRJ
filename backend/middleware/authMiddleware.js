const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Acesso proibido. O token expirou.' });
      }
      return res.status(403).json({ message: 'Acesso proibido. Token inválido.' });
    }
    
    // O payload contém o objeto 'user' que definimos no login
    req.user = payload.user; 
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
