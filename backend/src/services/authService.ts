
import { query } from '../db/index.js';
import { AppError } from '../utils/errors.js';
import bcrypt from 'bcrypt';
import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import { emailService } from './emailService.js'; // Import emailService

interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  loyalty_points: number;
}

interface Permission {
  id: number;
  name: string;
}

interface JwtPayload {
  id: number;
  email: string;
  role: string; // Keep for now, but permissions will be primary for authZ
  permissions: Permission[];
}

async function getUserPermissions(userId: number): Promise<Permission[]> {
  const { rows } = await query(
    `SELECT p.id, p.name
     FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     JOIN user_roles ur ON rp.role_id = ur.role_id
     WHERE ur.user_id = $1`,
    [userId]
  );
  return rows;
}

export const authService = {
  async register(name: string, email: string, password: string, roleName: string = 'user') {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find the role ID
    const roleResult = await query('SELECT id FROM roles WHERE name = $1', [roleName]);
    if (roleResult.rows.length === 0) {
      throw new AppError(`Role '${roleName}' not found`, 400);
    }
    const roleId = roleResult.rows[0].id;

    const { rows: [user] } = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, loyalty_points',
      [name, email, hashedPassword]
    );

    // Link user to role
    await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [user.id, roleId]);

    const permissions = await getUserPermissions(user.id);

    const payload: JwtPayload = { id: user.id, email: user.email, role: roleName, permissions };
    const token = sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1h' });

    return { user: { ...user, role: roleName, permissions }, token };
  },

  async login(email: string, password: string) {
    const { rows: [user] } = await query(
      'SELECT u.id, u.name, u.email, u.password_hash, r.name as role FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE u.email = $1',
      [email]
    );

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new AppError('Invalid credentials', 401);
    }

    const permissions = await getUserPermissions(user.id);

    const payload: JwtPayload = { id: user.id, email: user.email, role: user.role, permissions };
    const token = sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1h' });

    return { user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions }, token };
  },

  // TODO: Implement password reset flow
  async requestPasswordReset(email: string) {
    // Generate a reset token and save it to the database with an expiry
    // Send email to user with reset link
    // await emailService.sendEmail({
    //   to: email,
    //   subject: 'Password Reset Request',
    //   text: 'Click this link to reset your password: [link]',
    //   html: '<p>Click this link to reset your password: <a href="[link]">[link]</a></p>',
    // });
  },

  async resetPassword(token: string, newPassword: string) {
    // Verify token, update password, invalidate token
  },
};
