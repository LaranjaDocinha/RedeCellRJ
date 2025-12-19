import { getPool } from '../db/index.js';
import { AppError } from '../utils/errors.js';
import bcrypt from 'bcrypt';
import pkg from 'jsonwebtoken';
const { sign } = pkg; // Removed verify
import { emailService } from './emailService.js'; // Import emailService
import { logActivityService } from './logActivityService.js';
import crypto from 'crypto';
async function getUserPermissions(userId) {
    const pool = getPool();
    const { rows } = await pool.query(`SELECT p.id, p.action, p.subject
     FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     JOIN user_roles ur ON rp.role_id = ur.role_id
     WHERE ur.user_id = $1`, [userId]);
    return rows;
}
export const authService = {
    async register(name, email, password, roleName = 'user') {
        const pool = getPool();
        const hashedPassword = await bcrypt.hash(password, 10);
        // Find the role ID
        const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [roleName]);
        if (roleResult.rows.length === 0) {
            throw new AppError(`Role '${roleName}' not found`, 400);
        }
        const roleId = roleResult.rows[0].id;
        try {
            const { rows: [user], } = await pool.query('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email', [name, email, hashedPassword]);
            // Link user to role
            await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
                user.id,
                roleId,
            ]);
            const permissions = await getUserPermissions(user.id);
            const userRoleName = roleName; // The role name is already available
            const payload = {
                id: user.id,
                email: user.email,
                role: userRoleName,
                permissions,
            };
            const token = sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', {
                expiresIn: '1h',
            });
            // Log activity
            await logActivityService.logActivity({
                userId: user.id,
                action: 'User Registered',
                resourceType: 'User',
                resourceId: user.id,
                newValue: { name: user.name, email: user.email, role: userRoleName },
            });
            return {
                user: { id: user.id, name: user.name, email: user.email, role: userRoleName, permissions },
                token,
            };
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof Error && error.code === '23505') {
                // Unique violation error code
                throw new AppError('User with this email already exists', 409);
            }
            throw error;
        }
    },
    async login(email, password) {
        const pool = getPool();
        console.log('Login attempt for:', email);
        const { rows: [user], } = await pool.query('SELECT u.id, u.name, u.email, u.password_hash FROM users u WHERE u.email = $1', [email]);
        console.log('User from DB:', user);
        if (!user) {
            console.log('User not found');
            throw new AppError('Invalid credentials', 401);
        }
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        console.log('Password match:', passwordMatch);
        if (!passwordMatch) {
            console.log('Password does not match');
            throw new AppError('Invalid credentials', 401);
        }
        const permissions = await getUserPermissions(user.id);
        console.log('User permissions:', permissions);
        // Fetch user's role
        const userRoleResult = await pool.query(`SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = $1`, [user.id]);
        const userRoleName = userRoleResult.rows[0]?.name || 'user'; // Default to 'user' if no role found
        const payload = { id: user.id, email: user.email, role: userRoleName, permissions };
        const token = sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1h' });
        // Log activity
        await logActivityService.logActivity({
            userId: user.id,
            action: 'User Logged In',
            resourceType: 'User',
            resourceId: user.id,
        });
        return {
            user: { id: user.id, name: user.name, email: user.email, role: userRoleName, permissions },
            token,
        };
    },
    async requestPasswordReset(email) {
        const pool = getPool();
        const { rows: [user], } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (!user) {
            // Don't reveal if user exists
            return;
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await pool.query('UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3', [passwordResetToken, passwordResetExpires, user.id]);
        // TODO: Use environment variable for frontend URL
        const resetURL = `http://localhost:3000/reset-password/${resetToken}`;
        const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
        try {
            await emailService.sendEmail(email, 'Your password reset token (valid for 10 min)', message);
        }
        catch (err) {
            await pool.query('UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE id = $1', [user.id]);
            throw new AppError('There was an error sending the email. Try again later!', 500);
        }
    },
    async resetPassword(token, newPassword) {
        const pool = getPool();
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const { rows: [user], } = await pool.query('SELECT id, email FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2', [hashedToken, new Date()]);
        if (!user) {
            throw new AppError('Token is invalid or has expired', 400);
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2', [hashedPassword, user.id]);
        // Auto login
        const permissions = await getUserPermissions(user.id);
        // Re-fetch role
        const userRoleResult = await pool.query(`SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = $1`, [user.id]);
        const userRoleName = userRoleResult.rows[0]?.name || 'user';
        const payload = {
            id: user.id,
            email: user.email,
            role: userRoleName,
            permissions,
        };
        const jwtToken = sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', {
            expiresIn: '1h',
        });
        return { token: jwtToken };
    },
};
