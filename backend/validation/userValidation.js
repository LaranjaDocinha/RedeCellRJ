const { check, validationResult } = require('express-validator');

// Middleware para lidar com erros de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Schemas de validação para usuários
const registerValidation = [
  check('name', 'Nome é obrigatório e deve ter pelo menos 3 caracteres.').not().isEmpty().isLength({ min: 3 }),
  check('email', 'Por favor, inclua um e-mail válido.').isEmail(),
  check('password', 'A senha é obrigatória e deve ter pelo menos 8 caracteres.').isLength({ min: 8 }),
];

const createUserValidation = [
  ...registerValidation,
  check('role', 'A permissão (role) é obrigatória.').not().isEmpty(),
];

const loginValidation = [
  check('email', 'Por favor, inclua um e-mail válido.').isEmail(),
  check('password', 'A senha é obrigatória.').not().isEmpty(),
];

module.exports = {
  registerValidation,
  createUserValidation,
  loginValidation,
  validate,
};
