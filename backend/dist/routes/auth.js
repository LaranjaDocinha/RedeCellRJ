var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
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
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ValidationError('Validation failed', error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
router.post('/register', validate(registerSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const { user, token } = yield authService.register(email, password, 'user');
        res.status(201).json({ user, token });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/login', validate(loginSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const { user, token } = yield authService.login(email, password);
        res.status(200).json({ user, token });
    }
    catch (error) {
        next(error);
    }
}));
export default router;
