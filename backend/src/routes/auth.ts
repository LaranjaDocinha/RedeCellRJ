import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/authController.js';
import { ValidationError } from '../utils/errors.js';

const router = Router();

// Zod Schemas
const registerSchema = z.object({
  name: z.string().nonempty('Nome é obrigatório'),
  email: z.string().email('Email inválido').nonempty('Email é obrigatório'),
  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .nonempty('Senha é obrigatória'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido').nonempty('Email é obrigatório'),
  password: z.string().nonempty('Senha é obrigatória'),
});

const requestResetSchema = z.object({
  email: z.string().email('Email inválido').nonempty('Email é obrigatório'),
});

const resetPasswordSchema = z.object({
  token: z.string().nonempty('Token é obrigatório'),
  newPassword: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .nonempty('Nova senha é obrigatória'),
});

// Validation Middleware
const validate =
  (schema: z.ZodObject<any, any, any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(
          new ValidationError(
            'Validation failed',
            error.errors.map((err) => ({ path: err.path.join('.'), message: err.message })),
          ),
        );
      }
      next(error);
    }
  };

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post(
  '/request-password-reset',
  validate(requestResetSchema),
  authController.requestPasswordReset,
);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router;
