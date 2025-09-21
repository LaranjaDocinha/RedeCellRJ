var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { query } from '../db/index.js';
import { AppError } from '../utils/errors.js';
import bcrypt from 'bcrypt';
import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
function getUserPermissions(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows } = yield query(`SELECT p.id, p.name
     FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     JOIN user_roles ur ON rp.role_id = ur.role_id
     WHERE ur.user_id = $1`, [userId]);
        return rows;
    });
}
export const authService = {
    register(name_1, email_1, password_1) {
        return __awaiter(this, arguments, void 0, function* (name, email, password, roleName = 'user') {
            const hashedPassword = yield bcrypt.hash(password, 10);
            // Find the role ID
            const roleResult = yield query('SELECT id FROM roles WHERE name = $1', [roleName]);
            if (roleResult.rows.length === 0) {
                throw new AppError(`Role '${roleName}' not found`, 400);
            }
            const roleId = roleResult.rows[0].id;
            const { rows: [user] } = yield query('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, loyalty_points', [name, email, hashedPassword]);
            // Link user to role
            yield query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [user.id, roleId]);
            const permissions = yield getUserPermissions(user.id);
            const payload = { id: user.id, email: user.email, role: roleName, permissions };
            const token = sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1h' });
            return { user: Object.assign(Object.assign({}, user), { role: roleName, permissions }), token };
        });
    },
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rows: [user] } = yield query('SELECT u.id, u.name, u.email, u.password_hash, r.name as role FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE u.email = $1', [email]);
            if (!user || !(yield bcrypt.compare(password, user.password_hash))) {
                throw new AppError('Invalid credentials', 401);
            }
            const permissions = yield getUserPermissions(user.id);
            const payload = { id: user.id, email: user.email, role: user.role, permissions };
            const token = sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1h' });
            return { user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions }, token };
        });
    },
    // TODO: Implement password reset flow
    requestPasswordReset(email) {
        return __awaiter(this, void 0, void 0, function* () {
            // Generate a reset token and save it to the database with an expiry
            // Send email to user with reset link
            // await emailService.sendEmail({
            //   to: email,
            //   subject: 'Password Reset Request',
            //   text: 'Click this link to reset your password: [link]',
            //   html: '<p>Click this link to reset your password: <a href="[link]">[link]</a></p>',
            // });
        });
    },
    resetPassword(token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verify token, update password, invalidate token
        });
    },
};
