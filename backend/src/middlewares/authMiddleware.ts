import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import * as Sentry from '@sentry/node';
import { UserPayload } from '../types/express.js';
import { userRepository } from '../repositories/user.repository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    console.log('[AUTH DEBUG] Decoded token:', JSON.stringify(decoded));
    
    // Validar se o usuário ainda existe (essencial após resets de banco)
    const userExists = await userRepository.findById(decoded.id);
    if (!userExists) {
        return next(new AuthenticationError('Usuário inexistente ou banco resetado. Por favor, faça login novamente.'));
    }

    req.user = decoded;

    // Sentry Context
    Sentry.setUser({
      id: decoded.id,
      email: decoded.email,
      username: decoded.name || decoded.email,
    });
    Sentry.setTag('user_id', decoded.id);
    Sentry.setTag('user_email', decoded.email);
    Sentry.setTag('user_role', decoded.role);

    next();
  } catch (error) {
    return next(new AuthenticationError('Sessão inválida ou expirada.'));
  }
};

const authorize =
  (action: string, subject: string, options?: { resourceBranchId?: number }) => (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserPayload;
    
    if (!user || !user.permissions) {
      return next(new AuthenticationError('Usuário não autenticado ou sem permissões definidas.'));
    }

    const hasPermission = user.permissions.some(
      (p: { action: string; subject: string }) => {
        if (p.action === action && p.subject === subject) return true;
        if (p.action === 'manage' && p.subject === subject) return true;
        if (p.subject === 'all') {
            if (p.action === 'manage') return true;
            if (p.action === action) return true;
        }
        return false;
      }
    );

    if (!hasPermission) {
        console.log(`[AUTH] Access Denied for user ${user.email}. Action: ${action}, Subject: ${subject}`);
        console.log(`[AUTH] User permissions:`, JSON.stringify(user.permissions));
    }

    if (hasPermission && options?.resourceBranchId && (user as any).branchId) {
        if ((user as any).branchId !== options.resourceBranchId) {
            return next(new AuthorizationError(`Você não tem permissão para esta filial.`));
        }
    } else if (!hasPermission) {
        return next(new AuthorizationError(`Acesso negado: você não tem permissão para ${action} em ${subject}.`));
    }
    next();
  };

export const authMiddleware = {
  authenticate,
  authorize,
};