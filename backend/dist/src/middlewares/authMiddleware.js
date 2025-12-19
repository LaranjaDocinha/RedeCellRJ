import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import * as Sentry from '@sentry/node'; // Importar Sentry
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AuthenticationError('No token provided'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded JWT:', decoded); // Add log
        req.user = decoded;
        // Adicionar contexto do usuário ao Sentry
        Sentry.setUser({
            id: decoded.id,
            email: decoded.email,
            username: decoded.name || decoded.email, // Usar nome se disponível, senão email
        });
        // Adicionar tags relevantes
        Sentry.setTag('user_id', decoded.id);
        Sentry.setTag('user_email', decoded.email);
        Sentry.setTag('user_role', decoded.role); // Assumindo que o role está no JWT
        next();
    }
    catch (error) {
        console.error('JWT verification failed:', error); // Add log
        return next(new AuthenticationError('Invalid or expired token'));
    }
};
const authorize = (action, subject, options) => (req, res, next) => {
    const user = req.user; // Explicitly cast req.user to UserPayload
    // console.log(`[Auth] Authorizing action: ${action}, subject: ${subject} for user: ${user?.email}`); // Temporarily commented out
    if (!user || !user.permissions) {
        // Add check for permissions
        console.log('[Auth] User not authenticated or permissions not found.');
        return next(new AuthenticationError('User not authenticated or permissions not found'));
    }
    // console.log(`[Auth] User permissions:`, user.permissions); // Temporarily commented out
    const hasPermission = user.permissions.some((p) => p.action === action && p.subject === subject);
    // Lógica para autorização baseada em atributos (ex: branchId)
    if (hasPermission && options?.resourceBranchId && user.branchId) { // Assumindo que user.branchId existe
        if (user.branchId !== options.resourceBranchId) {
            // Se o usuário tem permissão para o recurso, mas não para o branch específico
            return next(new AuthorizationError(`You do not have permission to ${action} ${subject} in this branch`));
        }
    }
    else if (!hasPermission) {
        return next(new AuthorizationError(`You do not have permission to ${action} ${subject}`));
    }
    next();
};
export const authMiddleware = {
    authenticate,
    authorize,
};
