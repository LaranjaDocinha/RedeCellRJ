import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService.js';
import { ValidationError } from '../utils/errors.js';

const router = Router();

// Zod Schemas
const registerSchema = z.object({
  email: z.string().email('Email inválido').nonempty('Email é obrigatório'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres').nonempty('Senha é obrigatória'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido').nonempty('Email é obrigatório'),
  password: z.string().nonempty('Senha é obrigatória'),
});

// Validation Middleware
const validate = (schema: z.ZodObject<any, any, any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError('Validation failed', error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
    }
    next(error);
  }
};

router.post(
  '/register',
  validate(registerSchema),
  async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const { user, token } = await authService.register(email, password, 'user');
      res.status(201).json({ user, token });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  validate(loginSchema),
  async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const { user, token } = await authService.login(email, password);
      res.status(200).json({ user, token });
    } catch (error) {
      next(error);
    }
  }
);

export default router;